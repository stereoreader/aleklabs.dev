import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

void main().catch((error: unknown) => {
    console.error('[deploy] Deployment failed');
    console.error(error);
    process.exitCode = 1;
});

async function main(): Promise<void> {

    const buildDir = resolve(process.cwd(), 'build');
    const publicDir = resolve(process.cwd(), '.output', 'public');
    const stereoReaderAppDir = 'C:\\www\\stereoreader\\dist';
    const stereoReaderBuildDir = resolve(buildDir, 'stereo-reader');
    const stereoReaderBuildAppDir = resolve(stereoReaderBuildDir, 'app');
    const wranglerArgs = ['wrangler', 'pages', 'deploy', './build', '--project-name', 'aleklabs-dev', ...process.argv.slice(2)];

    await assertDirectoryExists(publicDir);
    await assertDirectoryExists(stereoReaderAppDir);

    console.log('[deploy] Clearing build folder');
    await rm(buildDir, { recursive: true, force: true });

    console.log('[deploy] Copying .output/public into build');
    await cp(publicDir, buildDir, { recursive: true, force: true });

    console.log('[deploy] Copying Stereo Reader app into build/stereo-reader/app');
    await cp(stereoReaderAppDir, stereoReaderBuildAppDir, { recursive: true, force: true });

    console.log('[deploy] Deploying build with Wrangler');
    await runCommand('npx', wranglerArgs);

    async function assertDirectoryExists(directoryPath: string): Promise<void> {

        await access(directoryPath, constants.R_OK);

        const directoryStats = await stat(directoryPath);

        if (!directoryStats.isDirectory()) {
            throw new Error(`Expected a directory: ${directoryPath}`);
        }
    }

    async function runCommand(command: string, args: string[]): Promise<void> {

        await new Promise<void>((resolvePromise, rejectPromise) => {
            const child = process.platform === 'win32'
                ? spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command, ...args], { stdio: 'inherit' })
                : spawn(command, args, { stdio: 'inherit' });

            child.once('error', rejectPromise);
            child.once('exit', (code, signal) => {
                if (signal) {
                    rejectPromise(new Error(`Command "${command}" terminated with signal ${signal}`));
                    return;
                }

                if (code !== 0) {
                    rejectPromise(new Error(`Command "${command}" exited with code ${code ?? 'unknown'}`));
                    return;
                }

                resolvePromise();
            });
        });
    }
}
