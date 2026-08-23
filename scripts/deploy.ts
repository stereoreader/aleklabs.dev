import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const APP_ASSET_GENERATION_RETENTION = 4;

void main().catch((error: unknown) => {
    console.error('[deploy] Deployment failed');
    console.error(error);
    process.exitCode = 1;
});

async function main(): Promise<void> {

    const buildDir = resolve(process.cwd(), 'build');
    const buildGitDir = resolve(buildDir, '.git');
    const publicDir = resolve(process.cwd(), '.output', 'public');
    const stereoReaderAppDir = 'C:\\www\\stereoreader\\dist';
    const stereoReaderAppBetaDir = 'C:\\www\\stereoreader\\dist-beta';
    const stereoReaderBuildDir = resolve(buildDir, 'stereo-reader');
    const stereoReaderBuildAppDir = resolve(stereoReaderBuildDir, 'app');
    const stereoReaderBuildAppBetaDir = resolve(stereoReaderBuildDir, 'app-beta');

    await assertDirectoryExists(buildGitDir);
    await assertDirectoryExists(publicDir);
    await assertDirectoryExists(stereoReaderAppDir);
    await assertDirectoryExists(stereoReaderAppBetaDir);

    const exceptions = ['.git', 'CNAME', 'stereo-reader'];
    console.log('[deploy] Clearing build folder except ' + exceptions.join(', '));
    for (const entry of await readdir(buildDir)) {
        if (exceptions.includes(entry)) {
            continue;
        }

        await rm(resolve(buildDir, entry), { recursive: true, force: true });
    }

    console.log('[deploy] Copying .output/public into build');
    await cp(publicDir, buildDir, { recursive: true, force: true });

    console.log('[deploy] Copying Stereo Reader app into build/stereo-reader/app');
    await copyStereoReaderApp(stereoReaderAppDir, stereoReaderBuildAppDir);

    console.log('[deploy] Copying Stereo Reader app beta into build/stereo-reader/app-beta');
    await copyStereoReaderApp(stereoReaderAppBetaDir, stereoReaderBuildAppBetaDir);


    console.log('[deploy] Reading latest source repo commit message');
    const commitMessage = await runCommand('git', ['log', '-1', '--pretty=%B'], { captureStdout: true });

    console.log('[deploy] Staging build repo changes');
    await runCommand('git', ['add', '.'], { cwd: buildDir });

    const buildRepoStatus = await runCommand('git', ['status', '--short'], { captureStdout: true, cwd: buildDir });

    if (!buildRepoStatus.trim()) {
        console.log('[deploy] Build repo has no changes to commit');
        return;
    }

    console.log('[deploy] Committing build repo changes');
    await runCommand('git', ['commit', '--file', '-'], { captureStdout: true, cwd: buildDir, input: commitMessage });

    console.log('[deploy] Pushing build repo changes');
    await runCommand('git', ['push'], { cwd: buildDir });

    async function assertDirectoryExists(directoryPath: string): Promise<void> {

        await access(directoryPath, constants.R_OK);

        const directoryStats = await stat(directoryPath);

        if (!directoryStats.isDirectory()) {
            throw new Error(`Expected a directory: ${directoryPath}`);
        }
    }

    async function copyStereoReaderApp(sourceAppDir: string, buildAppDir: string): Promise<void> {

        const assetGenerations = await getAssetGenerations(buildAppDir);
        const sourceAssetsDir = resolve(sourceAppDir, 'assets');
        const currentAssetPaths = new Set((await getFiles(sourceAssetsDir)).map(filePath =>
            `assets/${filePath.slice(sourceAssetsDir.length + 1).replaceAll('\\', '/')}`
        ));

        if (await isDirectory(buildAppDir)) {
            for (const entry of await readdir(buildAppDir)) {
                if (entry === 'assets') {
                    continue;
                }

                await rm(resolve(buildAppDir, entry), { recursive: true, force: true });
            }
        }

        await cp(sourceAppDir, buildAppDir, { recursive: true, force: true });

        const currentPrecachedAssetPaths = await getPrecachedAssetPaths(buildAppDir);
        assetGenerations.unshift([...currentPrecachedAssetPaths]);
        assetGenerations.length = Math.min(assetGenerations.length, APP_ASSET_GENERATION_RETENTION);

        const retainedAssetPaths = new Set([...currentAssetPaths, ...assetGenerations.flat()]);
        const assetsDir = resolve(buildAppDir, 'assets');

        if (!retainedAssetPaths.size || !await isDirectory(assetsDir)) {
            return;
        }

        for (const filePath of await getFiles(assetsDir)) {
            const assetPath = `assets/${filePath.slice(assetsDir.length + 1).replaceAll('\\', '/')}`;

            if (retainedAssetPaths.has(assetPath)) {
                continue;
            }

            await rm(filePath, { force: true });
        }

        await writeFile(resolve(buildAppDir, 'pwa-asset-generations.json'), JSON.stringify(assetGenerations));
    }

    async function getAssetGenerations(appDir: string): Promise<string[][]> {

        const generationsPath = resolve(appDir, 'pwa-asset-generations.json');

        try {
            const generations = JSON.parse(await readFile(generationsPath, 'utf8'));

            if (!Array.isArray(generations) || !generations.every(generation =>
                Array.isArray(generation) && generation.every(assetPath => typeof assetPath === 'string' && assetPath.startsWith('assets/'))
            )) {
                throw new Error(`Invalid asset generation manifest: ${generationsPath}`);
            }

            return generations;
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }

            const previousAssetPaths = await getPrecachedAssetPaths(appDir);
            return previousAssetPaths.size ? [[...previousAssetPaths]] : [];
        }
    }

    async function getPrecachedAssetPaths(appDir: string): Promise<Set<string>> {

        const serviceWorkerPath = resolve(appDir, 'service-worker.js');

        try {
            const serviceWorker = await readFile(serviceWorkerPath, 'utf8');
            return new Set([...serviceWorker.matchAll(/"url":"(assets\/[^"]+)"/g)].map(([, assetPath]) => assetPath));
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }

            return new Set();
        }
    }

    async function getFiles(directoryPath: string): Promise<string[]> {

        const files: string[] = [];

        for (const entry of await readdir(directoryPath, { withFileTypes: true })) {
            const entryPath = resolve(directoryPath, entry.name);

            if (entry.isDirectory()) {
                files.push(...await getFiles(entryPath));
                continue;
            }

            if (entry.isFile()) {
                files.push(entryPath);
            }
        }

        return files;
    }

    async function isDirectory(directoryPath: string): Promise<boolean> {

        try {
            return (await stat(directoryPath)).isDirectory();
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                return false;
            }

            throw e;
        }
    }

    async function runCommand(
        command: string,
        args: string[],
        options?: { captureStdout?: boolean; cwd?: string; input?: string }
    ): Promise<string> {

        return await new Promise<string>((resolvePromise, rejectPromise) => {
            const child = spawn(command, args, {
                cwd: options?.cwd,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';

            child.once('error', rejectPromise);
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', (chunk: string) => {
                stdout += chunk;

                if (!options?.captureStdout) {
                    process.stdout.write(chunk);
                }
            });
            child.stderr.on('data', (chunk: string) => {
                process.stderr.write(chunk);
            });
            child.once('exit', (code, signal) => {
                if (signal) {
                    rejectPromise(new Error(`Command "${command}" terminated with signal ${signal}`));
                    return;
                }

                if (code !== 0) {
                    rejectPromise(new Error(`Command "${command}" exited with code ${code ?? 'unknown'}`));
                    return;
                }

                resolvePromise(stdout);
            });

            child.stdin.end(options?.input ?? '');
        });
    }
}
