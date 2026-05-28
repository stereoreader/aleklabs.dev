<script setup>

import { ref, onMounted } from 'vue';

const props = defineProps({ src: String });

import MarkdownIt from "markdown-it";
// import MarkdownItAbbr from "markdown-it-abbr";
// import MarkdownItAnchor from "markdown-it-anchor";
// import MarkdownItFootnote from "markdown-it-footnote";
// import MarkdownItSub from "markdown-it-sub";
// import MarkdownItSup from "markdown-it-sup";
// import MarkdownItTasklists from "markdown-it-task-lists";
// import MarkdownItTOC from "markdown-it-toc-done-right";

const markdown = new MarkdownIt({ html: true })
    // .use(MarkdownItAbbr)
    // .use(MarkdownItAnchor)
    // .use(MarkdownItFootnote)
    // .use(MarkdownItSub)
    // .use(MarkdownItSup)
    // .use(MarkdownItTasklists)
    // .use(MarkdownItTOC);

const $div = ref();

onMounted(() => {
    setInnerHTML($div.value, markdown.render(props.src));
});

function setInnerHTML(elm, html) {
    elm.innerHTML = html;

    elm.querySelectorAll("script")
        .forEach(oldScriptEl => {
            const newScriptEl = document.createElement("script");

            Array.from(oldScriptEl.attributes).forEach(attr => {
                newScriptEl.setAttribute(attr.name, attr.value)
            });

            const scriptText = document.createTextNode(oldScriptEl.innerHTML);
            newScriptEl.appendChild(scriptText);

            oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
        });
}
</script>

<template>
    <div ref="$div" />
</template>