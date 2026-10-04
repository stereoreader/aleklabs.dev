import MarkdownIt from 'markdown-it';
import { marked, Renderer } from 'marked';

const markdown = new MarkdownIt().use(addH2Anchors);

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

export function parseMarked(src: string) {
    const renderer = new Renderer();
    const defaultLink = renderer.link;
    const headingSlugs = new Map<string, number>();

    renderer.link = function (token) {
        const html = defaultLink.call(this, token);
        if (!html.startsWith('<a ') || /\starget=/i.test(html)) return html;
        return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
    };

    renderer.heading = function ({ tokens, depth, text }) {
        const html = this.parser.parseInline(tokens);
        if (depth !== 2) return `<h${depth}>${html}</h${depth}>\n`;
        const id = getUniqueHeadingSlug(text, headingSlugs);
        return `<h2 id="${id}"><a class="heading-anchor" href="#${encodeURIComponent(id)}">${html}</a></h2>\n`;
    };

    return marked.parse(src, { async: false, renderer });
}

export function addH2Anchors(markdown: MarkdownIt): void {
    const defaultHeadingOpenRenderer = markdown.renderer.rules.heading_open ?? function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    const defaultHeadingCloseRenderer = markdown.renderer.rules.heading_close ?? function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    markdown.core.ruler.push('h2_anchors', state => {
        const headingSlugs = new Map<string, number>();

        state.tokens.forEach((token, index) => {
            if (token.type !== 'heading_open' || token.tag !== 'h2') return;

            const id = token.attrGet('id');
            if (id !== null) {
                headingSlugs.set(id, (headingSlugs.get(id) ?? 0) + 1);
                return;
            }

            token.attrSet('id', getUniqueHeadingSlug(state.tokens[index + 1]?.content ?? '', headingSlugs));
        });
    });

    markdown.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const html = defaultHeadingOpenRenderer(tokens, idx, options, env, self);
        const id = token?.tag === 'h2' ? token.attrGet('id') : null;
        return id === null ? html : `${html}<a class="heading-anchor" href="#${encodeURIComponent(id)}">`;
    };
    markdown.renderer.rules.heading_close = function (tokens, idx, options, env, self) {
        const html = defaultHeadingCloseRenderer(tokens, idx, options, env, self);
        return tokens[idx]?.tag === 'h2' ? `</a>${html}` : html;
    };
}

function getUniqueHeadingSlug(heading: string, headingSlugs: Map<string, number>): string {
    const slug = heading
        .normalize('NFKC')
        .toLowerCase()
        .replace(/<[^>]*>/gu, '')
        .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/gu, '-')
        .replace(/-+/gu, '-')
        .replace(/^-|-$/gu, '') || 'section';
    const count = headingSlugs.get(slug) ?? 0;
    headingSlugs.set(slug, count + 1);
    return count === 0 ? slug : `${slug}-${count}`;
}
