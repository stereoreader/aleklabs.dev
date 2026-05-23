import { defineNuxtModule } from '@nuxt/kit';
import { promises as fs } from 'fs';
import path from 'path';

interface ModuleOptions {
    contentDir: string;
    buildDir: string;
    baseURL: string;
    extensions: string[];
    assetKeys: string[];
}

interface ContentFileHookContext {
    file: {
        id?: string;
        path?: string;
        body?: unknown;
    };
    content?: Record<string, unknown>;
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'content-assets-v3'
    },

    defaults: {
        contentDir: 'content',
        buildDir: 'content-assets',
        baseURL: '/_content-assets/',
        extensions: [
            '.png',
            '.jpg',
            '.jpeg',
            '.webp',
            '.gif',
            '.svg',
            '.avif',
            '.mp4',
            '.webm',
            '.pdf'
        ],
        assetKeys: [
            'src',
            'href',
            'poster',
            'image',
            'cover',
            'thumbnail',
            'ogImage'
        ]
    },

    setup(options, nuxt) {
        const contentRoot = path.resolve(nuxt.options.rootDir, options.contentDir);
        const targetRoot = path.resolve(nuxt.options.buildDir, options.buildDir);
        const baseURL = withLeadingAndTrailingSlash(options.baseURL);
        const extensionSet = new Set(options.extensions.map(extension => extension.toLowerCase()));
        const assetKeySet = new Set(options.assetKeys);

        nuxt.options.watch.push(contentRoot);

        nuxt.hook('nitro:config', async nitroConfig => {
            await copyAssets(contentRoot, targetRoot);

            nitroConfig.publicAssets ||= [];
            nitroConfig.publicAssets.push({
                dir: targetRoot,
                baseURL,
                maxAge: 60 * 60 * 24 * 365
            });
        });

        (nuxt.hook as unknown as Function)('builder:watch', async (event: string, changedPath: string) => {
            const absolutePath = path.isAbsolute(changedPath)
                ? changedPath
                : path.resolve(nuxt.options.rootDir, changedPath);

            if (!isInsideDirectory(contentRoot, absolutePath)) {
                return;
            }

            if (!extensionSet.has(path.extname(absolutePath).toLowerCase())) {
                return;
            }

            const relativePath = path.relative(contentRoot, absolutePath);
            const targetPath = path.join(targetRoot, relativePath);

            if (event === 'unlink') {
                await fs.rm(targetPath, { force: true });
                return;
            }

            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.copyFile(absolutePath, targetPath);
        });

        (nuxt.hook as unknown as Function)('content:file:beforeParse', (ctx: ContentFileHookContext) => {
            if (typeof ctx.file.body !== 'string') {
                return;
            }

            const filePath = getContentFilePath(ctx.file);

            if (!filePath.endsWith('.md')) {
                return;
            }

            const fileDir = path.posix.dirname(filePath);

            ctx.file.body = ctx.file.body
                .replace(/(!\[[^\]]*]\()([^)\s]+)([^)]*\))/g, (match, prefix, url, suffix) => {
                    if (!shouldRewriteAssetUrl(url)) {
                        return match;
                    }

                    return `${prefix}${resolveAssetUrl(fileDir, url)}${suffix}`;
                })
                .replace(/\bsrc=(['"])(.*?)\1/g, (match, quote, url) => {
                    if (!shouldRewriteAssetUrl(url)) {
                        return match;
                    }

                    return `src=${quote}${resolveAssetUrl(fileDir, url)}${quote}`;
                });
        });

        (nuxt.hook as unknown as Function)('content:file:afterParse', (ctx: ContentFileHookContext) => {
            const filePath = getContentFilePath(ctx.file);
            const fileDir = path.posix.dirname(filePath);

            if (ctx.content) {
                rewriteParsedContent(ctx.content, fileDir);
            }
        });

        function rewriteParsedContent(value: unknown, fileDir: string, key?: string) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    rewriteParsedContent(item, fileDir);
                }

                return;
            }

            if (!value || typeof value !== 'object') {
                return;
            }

            const record = value as Record<string, unknown>;

            for (const [childKey, childValue] of Object.entries(record)) {
                if (typeof childValue === 'string' && assetKeySet.has(childKey) && shouldRewriteAssetUrl(childValue)) {
                    record[childKey] = resolveAssetUrl(fileDir, childValue);
                    continue;
                }

                rewriteParsedContent(childValue, fileDir, childKey);
            }
        }

        function resolveAssetUrl(fileDir: string, url: string) {
            const [pathPart, suffix = ''] = splitUrlSuffix(url);
            const resolvedPath = normalizeRoutePath(path.posix.join(fileDir, pathPart));

            return `${baseURL}${resolvedPath}${suffix}`;
        }

        function shouldRewriteAssetUrl(url: string) {
            if (
                url.startsWith('/') ||
                url.startsWith('#') ||
                url.startsWith('http://') ||
                url.startsWith('https://') ||
                url.startsWith('//') ||
                url.startsWith('data:') ||
                url.startsWith('blob:') ||
                url.startsWith('mailto:')
            ) {
                return false;
            }

            const [pathPart] = splitUrlSuffix(url);

            return extensionSet.has(path.extname(pathPart).toLowerCase());
        }

        function splitUrlSuffix(url: string): [string, string?] {
            const index = url.search(/[?#]/);

            if (index === -1) {
                return [url];
            }

            return [url.slice(0, index), url.slice(index)];
        }

        async function copyAssets(sourceDirectory: string, targetDirectory: string) {
            await fs.rm(targetDirectory, { recursive: true, force: true });
            await copyDirectoryAssets(sourceDirectory, targetDirectory);
        }

        async function copyDirectoryAssets(sourceDirectory: string, targetDirectory: string) {
            const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });

            for (const entry of entries) {
                const sourcePath = path.join(sourceDirectory, entry.name);

                if (entry.isDirectory()) {
                    await copyDirectoryAssets(sourcePath, targetDirectory);
                    continue;
                }

                if (!extensionSet.has(path.extname(entry.name).toLowerCase())) {
                    continue;
                }

                const relativePath = path.relative(contentRoot, sourcePath);
                const targetPath = path.join(targetDirectory, relativePath);

                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                await fs.copyFile(sourcePath, targetPath);
            }
        }

        function getContentFilePath(file: ContentFileHookContext['file']) {
            const rawPath = String(file.id ?? file.path ?? '');

            return normalizeRoutePath(
                rawPath
                    .replace(/^content:/, '')
                    .replace(/^\/+/, '')
                    .replace(/^content\//, '')
            );
        }

        function normalizeRoutePath(value: string) {
            return value.replaceAll('\\', '/').replace(/^\/+/, '');
        }

        function withLeadingAndTrailingSlash(value: string) {
            return `/${value.replace(/^\/+|\/+$/g, '')}/`;
        }

        function isInsideDirectory(directory: string, filePath: string) {
            const relativePath = path.relative(directory, filePath);

            return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
        }
    }
});