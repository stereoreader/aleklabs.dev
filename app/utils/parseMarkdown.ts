import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt;

export default function parseMarkdown (str: string) {
    return markdown.render(str);
}