import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, readdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

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
    const stereoReaderBuildDir = resolve(buildDir, 'stereo-reader');
    const stereoReaderBuildAppDir = resolve(stereoReaderBuildDir, 'app');

    await assertDirectoryExists(buildGitDir);
    await assertDirectoryExists(publicDir);
    await assertDirectoryExists(stereoReaderAppDir);

    const exceptions = ['.git', 'CNAME'];
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
    await cp(stereoReaderAppDir, stereoReaderBuildAppDir, { recursive: true, force: true });

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
