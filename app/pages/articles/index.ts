import { parse } from 'yaml';
import { lexer } from 'marked';

const covers = import.meta.glob('@content/articles/**/cover.webp', {
    eager: true,
    query: '?url',
    import: 'default',
});

const pages = import.meta.glob('@content/articles/**/index.md', {
    eager: true,
    query: '?raw',
    import: 'default',
});

type Article = {
    title: string;
    description: string;
    date: string;
    coverUrl: string;
    slug: string
    //tags?: string[];
};

export const articles = (Object.entries(pages) as [string, string][]).map(([path, data]) => {

    console.log(path);
    console.log(covers);
    const meta = parseMarkdownArticle(data);
    meta.title = extractMarkdownTitle(data)!;
    meta.coverUrl = covers[path.replace('index.md', 'cover.webp')];

    return meta;

    function parseMarkdownArticle(markdown: string) {
        const normalized = markdown.replace(/^\uFEFF/u, '').replace(/\r\n?/g, '\n');
        const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/u.exec(normalized);
        return parse(match![1] as string) as Article;
    }

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

