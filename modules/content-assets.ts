import { defineNuxtModule } from '@nuxt/kit';
import { createJiti } from 'jiti';
import { promises as fs } from 'fs';
import path from 'path';

interface ModuleOptions {
    contentConfig: string;
    contentDir: string;
    buildDir: string;
    baseURL: string;
    extensions: string[];
    extraAssetKeys: string[];
}

interface ContentFileHookContext {
    file: {
        id?: string;
        path?: string;
        body?: unknown;
    };
    content?: Record<string, unknown>;
}

interface ContentConfig {
    collections?: Record<string, ContentCollectionConfig>;
}

interface ContentCollectionConfig {
    source?: CollectionSource;
    schema?: unknown;
}

type CollectionSource = string | {
    include?: string | string[];
    cwd?: string;
    repository?: unknown;
};

interface NormalizedCollection {
    name: string;
    sourceBases: string[];
    schemaKeys: Set<string>;
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'content-assets-v3'
    },

    defaults: {
        contentConfig: 'content.config.ts',
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
        extraAssetKeys: []
    },

    async setup(options, nuxt) {
        const contentRoot = path.resolve(nuxt.options.rootDir, options.contentDir);
        const targetRoot = path.resolve(nuxt.options.buildDir, options.buildDir);
        const contentConfigPath = path.resolve(nuxt.options.rootDir, options.contentConfig);
        const baseURL = withLeadingAndTrailingSlash(options.baseURL);
        const extensionSet = new Set(options.extensions.map(extension => extension.toLowerCase()));
        const staticAssetKeys = new Set([
            'src',
            'href',
            'poster',
            'image',
            'cover',
            'thumbnail',
            'ogImage',
            ...options.extraAssetKeys
        ]);

        let collections = await loadCollections();
        let assetKeys = buildAssetKeys(collections);

        nuxt.options.watch.push(contentRoot);
        nuxt.options.watch.push(contentConfigPath);

        nuxt.hook('nitro:config', async nitroConfig => {
            await copyAssets(contentRoot, targetRoot);

            nitroConfig.publicAssets ||= [];
            nitroConfig.publicAssets.push({
                dir: targetRoot,
                baseURL,
                maxAge: 60 * 60 * 24 * 365
            });
        });

        nuxt.hook('builder:watch' as 'ready', async (event: string, changedPath: string) => {
            const absolutePath = path.isAbsolute(changedPath)
                ? changedPath
                : path.resolve(nuxt.options.rootDir, changedPath);

            if (isSamePath(absolutePath, contentConfigPath)) {
                collections = await loadCollections();
                assetKeys = buildAssetKeys(collections);
                return;
            }

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

        nuxt.hook('content:file:beforeParse' as 'ready', (ctx: ContentFileHookContext) => {
            if (typeof ctx.file.body !== 'string') {
                return;
            }

            const contentFilePath = getContentFilePath(ctx.file);

            if (!contentFilePath.endsWith('.md')) {
                return;
            }

            const fileDir = path.posix.dirname(contentFilePath);

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

        nuxt.hook('content:file:afterParse' as 'ready', (ctx: ContentFileHookContext) => {
            if (!ctx.content) {
                return;
            }

            const contentFilePath = getContentFilePath(ctx.file);
            const fileDir = path.posix.dirname(contentFilePath);

            rewriteParsedContent(ctx.content, fileDir);
        });

        async function loadCollections() {
            const contentConfig = await loadContentConfig();
            const normalizedCollections: NormalizedCollection[] = [];

            for (const [name, collection] of Object.entries(contentConfig.collections ?? {})) {
                normalizedCollections.push({
                    name,
                    sourceBases: getCollectionSourceBases(collection.source),
                    schemaKeys: getSchemaKeys(collection.schema)
                });
            }

            return normalizedCollections;
        }

        async function loadContentConfig() {
            const jiti = createJiti(import.meta.url);
            const loadedConfig = await jiti.import(contentConfigPath, {
                default: true
            }) as ContentConfig | { default?: ContentConfig };

            if (loadedConfig && 'default' in loadedConfig && loadedConfig.default) {
                return loadedConfig.default;
            }

            return loadedConfig as ContentConfig;
        }

        function buildAssetKeys(normalizedCollections: NormalizedCollection[]) {
            const keys = new Set(staticAssetKeys);

            for (const collection of normalizedCollections) {
                for (const key of collection.schemaKeys) {
                    keys.add(key);
                }
            }

            return keys;
        }

        function getContentFilePath(file: ContentFileHookContext['file']) {
            const candidates = [
                file.id,
                file.path
            ]
                .filter((value): value is string => typeof value === 'string' && value.length > 0)
                .map(normalizeContentHookPath);

            for (const candidate of candidates) {
                const resolvedPath = resolveCollectionContentPath(candidate);

                if (resolvedPath) {
                    return resolvedPath;
                }
            }

            return candidates[0] ?? '';
        }

        function resolveCollectionContentPath(rawPath: string) {
            for (const collection of collections) {
                const namespace = `${collection.name}/`;

                if (rawPath.startsWith(namespace)) {
                    const pathWithoutNamespace = rawPath.slice(namespace.length);

                    for (const sourceBase of collection.sourceBases) {
                        if (pathWithoutNamespace === sourceBase || pathWithoutNamespace.startsWith(`${sourceBase}/`)) {
                            return pathWithoutNamespace;
                        }

                        return joinSourceBase(sourceBase, pathWithoutNamespace);
                    }

                    return pathWithoutNamespace;
                }

                for (const sourceBase of collection.sourceBases) {
                    if (rawPath === sourceBase || rawPath.startsWith(`${sourceBase}/`)) {
                        return rawPath;
                    }
                }
            }

            return undefined;
        }

        function getCollectionSourceBases(source: CollectionSource | undefined) {
            if (!source) {
                return [''];
            }

            const includes = getCollectionSourceIncludes(source);
            const cwdBase = getCollectionSourceCwdBase(source);

            return includes.map(include => {
                const staticBase = getStaticGlobBase(normalizeRoutePath(include).replace(/^content\//, ''));

                return normalizeRoutePath(path.posix.join(cwdBase, staticBase));
            });
        }

        function getCollectionSourceIncludes(source: CollectionSource) {
            if (typeof source === 'string') {
                return [source];
            }

            if (Array.isArray(source.include)) {
                return source.include;
            }

            if (typeof source.include === 'string') {
                return [source.include];
            }

            return ['**/*'];
        }

        function getCollectionSourceCwdBase(source: CollectionSource) {
            if (typeof source === 'string' || !source.cwd) {
                return '';
            }

            const absoluteCwd = path.isAbsolute(source.cwd)
                ? source.cwd
                : path.resolve(nuxt.options.rootDir, source.cwd);

            if (!isInsideDirectory(contentRoot, absoluteCwd) && !isSamePath(contentRoot, absoluteCwd)) {
                return '';
            }

            return normalizeRoutePath(path.relative(contentRoot, absoluteCwd));
        }

        function getStaticGlobBase(include: string) {
            const segments = include.split('/');
            const baseSegments: string[] = [];

            for (const segment of segments) {
                if (hasGlobSyntax(segment)) {
                    break;
                }

                baseSegments.push(segment);
            }

            if (baseSegments.length === segments.length) {
                baseSegments.pop();
            }

            return baseSegments.join('/');
        }

        function getSchemaKeys(schema: unknown) {
            const keys = new Set<string>();

            collectSchemaKeys(schema, keys, 0);

            return keys;
        }

        function collectSchemaKeys(schema: unknown, keys: Set<string>, depth: number) {
            if (!schema || typeof schema !== 'object' || depth > 16) {
                return;
            }

            const unwrappedSchema = unwrapSchema(schema);
            const shape = getSchemaShape(unwrappedSchema);

            if (!shape) {
                return;
            }

            for (const [key, childSchema] of Object.entries(shape)) {
                keys.add(key);
                collectSchemaKeys(childSchema, keys, depth + 1);
            }
        }

        function unwrapSchema(schema: unknown) {
            let currentSchema = schema;

            for (let index = 0; index < 16; index++) {
                if (!currentSchema || typeof currentSchema !== 'object') {
                    return currentSchema;
                }

                const record = currentSchema as Record<string, unknown>;
                const definition = record._def as Record<string, unknown> | undefined;

                if (typeof record.unwrap === 'function') {
                    const nextSchema = record.unwrap();

                    if (nextSchema && nextSchema !== currentSchema) {
                        currentSchema = nextSchema;
                        continue;
                    }
                }

                const innerSchema = definition?.innerType ?? definition?.schema ?? definition?.type;

                if (innerSchema && innerSchema !== currentSchema) {
                    currentSchema = innerSchema;
                    continue;
                }

                return currentSchema;
            }

            return currentSchema;
        }

        function getSchemaShape(schema: unknown) {
            if (!schema || typeof schema !== 'object') {
                return undefined;
            }

            const record = schema as Record<string, unknown>;

            if (record.shape && typeof record.shape === 'object') {
                return record.shape as Record<string, unknown>;
            }

            const definition = record._def as Record<string, unknown> | undefined;
            const shape = definition?.shape;

            if (typeof shape === 'function') {
                return shape() as Record<string, unknown>;
            }

            if (shape && typeof shape === 'object') {
                return shape as Record<string, unknown>;
            }

            return undefined;
        }

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
                if (typeof childValue === 'string' && assetKeys.has(childKey) && shouldRewriteAssetUrl(childValue)) {
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

            return [
                url.slice(0, index),
                url.slice(index)
            ];
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

        function joinSourceBase(sourceBase: string, value: string) {
            if (!sourceBase) {
                return value;
            }

            if (value === sourceBase || value.startsWith(`${sourceBase}/`)) {
                return value;
            }

            return normalizeRoutePath(path.posix.join(sourceBase, value));
        }

        function normalizeContentHookPath(value: string) {
            return normalizeRoutePath(
                value
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

        function hasGlobSyntax(value: string) {
            return /[*?[\]{}!]/.test(value);
        }

        function isInsideDirectory(directory: string, filePath: string) {
            const relativePath = path.relative(directory, filePath);

            return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
        }

        function isSamePath(left: string, right: string) {
            return path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();
        }
    }
});