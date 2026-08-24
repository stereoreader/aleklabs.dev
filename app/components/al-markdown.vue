<script lang="ts">
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';

const markdown = new MarkdownIt({
    html: false,
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
</script>
<script setup lang="ts">

const { src } = defineProps<{
    src: string
}>();

const html = markdown.render(src);

</script>

<template>
    <div class="markdown" v-html="html"></div>
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

    strong {
        font-weight: bold;
    }

}
</style>