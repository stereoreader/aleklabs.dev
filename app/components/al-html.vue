<script lang="ts">
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';

const markdown = createMarkdown(false);
const markdownWithHtml = createMarkdown(true);

function createMarkdown(allowHtml: boolean) {
    const markdown = new MarkdownIt({
        html: allowHtml,
        linkify: true,
        typographer: true,
    }).use(markdownItAttrs, {
        allowedAttributes: [
            'class',
            'id',
            'target'
        ],
    });

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

    return markdown;
}

function renderMarkdown(src: string, allowHtml: boolean, executeScripts: boolean): string {
    const html = (allowHtml || executeScripts ? markdownWithHtml : markdown).render(src);

    if (!allowHtml && !executeScripts) {
        return html;
    }

    return html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, function (_match, attributesSource: string, scriptContent: string) {
        return `<template data-markdown-script="${encodeURIComponent(JSON.stringify(parseScriptAttributes(attributesSource)))}">${escapeHtml(scriptContent)}</template>`;
    });
}

function parseScriptAttributes(attributesSource: string): Array<[string, string]> {
    const attributes: Array<[string, string]> = [];
    const attributeMatcher = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let attributeMatch: RegExpExecArray | null;

    while ((attributeMatch = attributeMatcher.exec(attributesSource))) {
        attributes.push([
            attributeMatch[1],
            attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? ''
        ]);
    }

    return attributes;
}

function escapeHtml(scriptContent: string): string {
    return scriptContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
</script>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    src: string
    allowHtml?: boolean
    executeScripts?: boolean
}>(), {
    allowHtml: false,
    executeScripts: false
});

const container = ref<HTMLElement | null>(null);
const html = computed(() => renderMarkdown(props.src, props.allowHtml, props.executeScripts));

onMounted(() => {
    activateEmbeddedScripts();
});

watch([() => props.src, () => props.allowHtml, () => props.executeScripts], () => {
    activateEmbeddedScripts();
}, {
    flush: 'post'
});

function activateEmbeddedScripts(): void {
    if (!import.meta.client || !props.executeScripts || !container.value) {
        return;
    }

    container.value.querySelectorAll('template[data-markdown-script]').forEach(placeholder => {
        const serializedAttributes = placeholder.getAttribute('data-markdown-script');

        if (!serializedAttributes) {
            return;
        }

        const script = document.createElement('script');
        const attributes = JSON.parse(decodeURIComponent(serializedAttributes)) as Array<[string, string]>;
        let src = '';
        let hasAsyncAttribute = false;

        for (const [name, value] of attributes) {
            if (name === 'src') {
                src = value;
                continue;
            }

            if (name === 'async') {
                hasAsyncAttribute = true;
            }

            script.setAttribute(name, value);
        }

        const scriptContent = placeholder.textContent ?? '';

        if (scriptContent) {
            script.appendChild(document.createTextNode(scriptContent));
        }

        if (src) {
            if (!hasAsyncAttribute && script.getAttribute('type') !== 'module') {
                script.async = false;
            }

            script.setAttribute('src', src);
        }

        placeholder.replaceWith(script);
    });
}

</script>

<template>
    <div ref="container" class="markdown" v-html="html"></div>
</template>

<style lang="scss">
.markdown {

    h1,
    h2,
    h3 {
        color: #ddd;
    }

    p:has(.article-cover) {
        margin: 0;
    }

    .article-cover {
        margin: -32px;
        margin-bottom: 32px;
        width: calc(100% + 64px);
    }

    pre:has(>code) {
        background: #222;
        padding: 8px;
        border-radius: 4px;
        background: #222233;
        color: orange;
    }

    blockquote {
        border-left: 3px solid #555;
        background: #222;
        margin-left: 0;
        padding-inline: 32px;
        display: block;
        padding-block: 1px;
    }

    hr {
        margin-top: 48px;
        margin-bottom: 48px;
        margin-inline: auto;
        width: 25%;
        border: 1px solid #333;
    }

    li {
        margin-bottom: 16px;
    }

}
</style>