import { parse } from 'yaml';
import { lexer } from 'marked';

const covers = import.meta.glob('@content/articles/**/cover.webp', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

const pages = import.meta.glob('@content/articles/**/index.md', {
    eager: true,
    query: '?raw',
    import: 'default',
});

type Article = {
    title: string;
    description: string;
    date: Date;
    coverUrl: string;
    slug: string,
    data: string,
    seoDescription: string;
    readOn: string[];
    //tags?: string[];
};

export const articles = (Object.entries(pages) as [string, string][]).map(([path, data]) => {

    const normalized = data.replace(/^\uFEFF/u, '').replace(/\r\n?/g, '\n');
    const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/u.exec(normalized);

    if (!(typeof match?.[1] === 'string' && typeof match?.[2] === 'string')) {
        throw new Error('No meta for' + path);
    }

    const meta = parse(match[1]) as Article;
    meta.data = match[2];
    meta.title = extractMarkdownTitle(data)!;
    meta.date = new Date(meta.date);
    meta.readOn ??= [];

    const coverUrl = covers[path.replace('index.md', 'cover.webp')];
    if (!coverUrl) {
        throw new Error('No cover image for ' + meta.title);
    }

    meta.coverUrl = coverUrl;

    return meta;


    function extractMarkdownTitle(markdown: string): string | null {
        const tokens = lexer(markdown);

        for (const token of tokens) {
            if (token.type === 'heading' && token.depth === 1) {
                return token.text.trim();
            }
        }

        return null;
    }
});

