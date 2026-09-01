import MarkdownIt from 'markdown-it';
import { marked, Renderer } from 'marked';

const markdown = new MarkdownIt;

const defaultLinkOpenRenderer = markdown.renderer.rules.link_open ?? function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

markdown.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (!token) return '';

    if (token.attrGet('target') === null) {
        token.attrSet('target', '_blank');
    }

    if (token.attrGet('rel') === null && token.attrGet('target') === '_blank') {
        token.attrSet('rel', 'noopener noreferrer');
    }

    return defaultLinkOpenRenderer(tokens, idx, options, env, self);
};

export default function parseMarkdown(str: string) {
    return markdown.render(str);
}

const markedRenderer = new Renderer();
const defaultMarkedLink = markedRenderer.link;
markedRenderer.link = function (token) {
    const html = defaultMarkedLink.call(this, token);
    if (!html.startsWith('<a ') || /\starget=/i.test(html)) return html;
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
};

export function parseMarked(src: string) {
    return marked.parse(src, { async: false, renderer: markedRenderer });
}
