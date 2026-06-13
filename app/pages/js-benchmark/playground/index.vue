<script setup>
import '../object';
import '../string';

import favico from '../assets/favicon.ico';

useHead({
    title: "JS benchmark",
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: favico,
        },
    ]
});

useHead({
    script: [
        {
            innerHTML: `
const script = document.createElement('script');

if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    script.type = 'module';
    script.src = 'http://localhost:8001/benchmark.js';
} else {
    script.src = 'https://cdn.jsdelivr.net/gh/silentmantra/benchmark/loader.js';
}

document.head.appendChild(script);
            `.trim(),
        },
    ],
});


let propagatingStateToRoute = false;
const state = reactive({ code: '' });

const setDefaultTemplate = () => {
    state.code =
        `/* code to execute before each solution */

// @benchmark solution1
    /* code to execute before the solution, remove // @run if you don't need it */

// @run
    /* code to be looped to benchmark the solution 

// @benchmark solution2
    /* code to execute before the solution, remove // @run if you don't need it */

// @run
    /* code to be looped to benchmark the solution

`;
}
popstate();
const $code = ref();
const loaded = ref(false);

const formatFromKey = e => {
    if (e.key === 'l' && e.ctrlKey) {
        (e.preventDefault(), format());
    }
}
const format = async () => state.code = await prettier.format(state.code, { parse: 'babel', trailingComma: 'none', plugins: prettierPlugins });
const copyRawUrl = () => copyToClipboard(location.href);
const copyMarkupUrl = () => copyToClipboard(`[${state.title || 'benchmark'}](${location.href})`);
const duplicate = () => window.open(location.href);

function getCodeElement() {
    return $code.value?.element ?? $code.value?.$el ?? $code.value;
}

{

    let writePromise;
    watch(state, async state => {
        propagatingStateToRoute = true;
        await (writePromise ??= new Promise(r => queueMicrotask(async () => {
            //console.log('writing state to URL', JSON.clone(state));
            const hash = await JSON.stringify(state).compress('gzip base64 uri');
            history.replaceState(
                history.state,
                '',
                `${location.pathname}${location.search}#${hash}`,
            );
            writePromise = null;
        })));
    });
}

watch(() => state.code, updateCode);
{
    let interval;
    listen({
        loaded() {
            updateCode(state.code);
        },
        start() {
            interval = setInterval(() => {
                const cont = document.querySelector('.silentmantra-benchmark');
                const codeElement = getCodeElement();
                if (cont && codeElement) {
                    if (codeElement.offsetWidth < cont.scrollWidth) {
                        codeElement.style.width = cont.scrollWidth + 16 + 'px';
                    }
                }
            }, 500);
        },
        stop() { clearInterval(interval), benchmark = null }
    });
}

function listen(handlers) {
    for (const name in handlers) {
        window.addEventListener('silentmantra/benchmark:' + name, handlers[name]);
    }
}

onMounted(() => {
    if (!state.code) updateCode('');
});

let benchmark;

async function updateCode(code) {
    setTimeout(() => loaded.value = true);
    const codeElement = getCodeElement();
    if (!codeElement) {
        return;
    }
    benchmark = await window.SilentMantraBenchmark?.set(codeElement, code);
}

watch(() => state.title, title => document.title = [title, 'AlekLabs JS benchmark'].filter(Boolean).join(' / '));

window.addEventListener('hashchange', popstate);
document.addEventListener('keyup', e => e.key === "Enter" && e.ctrlKey && benchmark?.start());

async function popstate() {
    if (!location.hash) return;
    if (propagatingStateToRoute) {
        propagatingStateToRoute = false;
        return;
    }
    const data = JSON.parse(await location.hash.slice(1).decompress('uri base64 gzip'));
    if (typeof data?.code === 'string') {
        data.code = data.code.replace(/^\s*\/\*\s*@\s*skip\s*\*\/.*(?:\r?\n)?/gm, '');
    }
    console.log('reading state from URL', data);

    Object.walk(data, (v, k, obj, path) => {

        if (v?.constructor.name === 'Object') {
            return;
        }
        let curr = state, currK;
        while (currK = path.shift()) {
            curr = curr[currK];
        }
        if (Array.isArray(curr)) {
            curr.replace(obj);
        } else {
            try {
                curr[k] = v;
            } catch (e) {
                debugger;
            }
        }
    });
}

function copyToClipboard(text) {
    const dialog = document.querySelector('dialog');
    const area = dialog.querySelector('textarea');
    dialog.style.opacity = 0;
    area.textContent = text;
    dialog.showModal();
    area.focus();
    area.select();
    document.execCommand('copy');
    dialog.close();
}

</script>
<template>
    <dialog><textarea></textarea></dialog>
    <div class="wrapper" :class="{ loaded }">
        <h1><img src="../assets/gauge.svg"> AlekLabs JS benchmark</h1>
        <div class="subtitle">A benchmark to write in pure JS and host anywhere, read <a target="_blank"
                href='/js-benchmark'>the
                docs</a></div>
        <div class="toolbar">
            <button v-if="0" @click="format">format code (Ctrl+L)</button>
            <button @click="copyRawUrl">copy url</button>
            <button @click="copyMarkupUrl">copy markup url</button>
            <button v-if="0" @click="copyEmbed">embed</button>
            <button v-if="0" @click="duplicate">duplicate</button>
            <button @click="state.code = '', state.title = ''">empty</button>
            <button @click="setDefaultTemplate">help</button>
        </div>
        <div class="title">
            <input v-model="state.title" placeholder="title" />
        </div>
        <div class="code-wrapper">
            <al-code autofocus ref="$code" v-model="state.code" class="code" @keydown="formatFromKey" />
        </div>
    </div>
</template>

<style scoped lang="scss">
/* color palette from <https://github.com/vuejs/theme> */
.wrapper {
    --vt-c-white: #ffffff;
    --vt-c-white-soft: #f8f8f8;
    --vt-c-white-mute: #f2f2f2;

    --vt-c-black: #181818;
    --vt-c-black-soft: #222222;
    --vt-c-black-mute: #282828;

    --vt-c-indigo: #2c3e50;

    --vt-c-divider-light-1: rgba(60, 60, 60, 0.29);
    --vt-c-divider-light-2: rgba(60, 60, 60, 0.12);
    --vt-c-divider-dark-1: rgba(84, 84, 84, 0.65);
    --vt-c-divider-dark-2: rgba(84, 84, 84, 0.48);

    --vt-c-text-light-1: var(--vt-c-indigo);
    --vt-c-text-light-2: rgba(60, 60, 60, 0.66);
    --vt-c-text-dark-1: var(--vt-c-white);
    --vt-c-text-dark-2: rgba(235, 235, 235, 0.64);
}

/* semantic color variables for this project */
.wrapper {
    --color-background: var(--vt-c-white);
    --color-background-soft: var(--vt-c-white-soft);
    --color-background-mute: var(--vt-c-white-mute);
    --color-scrollbar-track: #ddd;
    --color-border: var(--vt-c-divider-light-2);
    --color-border-hover: var(--vt-c-divider-light-1);

    --color-heading: var(--vt-c-text-light-1);
    --color-text: var(--vt-c-text-light-1);

    --section-gap: 160px;
}

.wrapper {
    --color-background: var(--vt-c-black);
    --color-background-soft: var(--vt-c-black-soft);
    --color-background-mute: var(--vt-c-black-mute);
    --color-scrollbar-track: #333;

    --color-border: var(--vt-c-divider-dark-2);
    --color-border-hover: var(--vt-c-divider-dark-1);

    --color-heading: var(--vt-c-text-dark-1);
    --color-text: var(--vt-c-text-dark-2);
}

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    font-weight: normal;
}

p {
    margin-bottom: 16px;
}

pre {
    background-color: var(--color-background-mute);
    padding: 8px;
    margin-block: 8px;
}

:deep(.silentmantra-benchmark) {
    position: absolute;
    width: 100%;
}

.wrapper {
    position: relative;
    opacity: 0;
    transition: opacity 500ms;

    &.loaded {
        opacity: 1;
    }
}

* {
    outline: none;
    font-family: 'Courier New', Courier, monospace;
    scrollbar-width: 16px;
    scrollbar-color: var(--color-scrollbar-track) var(--color-background);
}

dialog {
    position: fixed;
    width: 1px;
    height: 1px;
    opacity: .01;
}

h1 {
    img {
        vertical-align: middle;
    }

    @media (max-width: 1024px) {
        font-size: 18px;
    }

    margin-bottom: 0px;
}

.subtitle {
    margin-bottom: 8px;
}

.title {
    margin-bottom: 8px;

    input {
        width: 100%;
    }
}

textarea,
input {
    display: block;
    border: 1px solid var(--color-border);
    background: var(--color-background-soft);
    color: var(--color-text);
    padding: 8px;
}

.code {
    //min-width: 720px;
    width: 100%;
    overflow-y: hidden;
    //resize: horizontal;
    max-width: 100%;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: auto;
}

.toolbar {
    display: flex;
    margin-bottom: 8px;
    gap: 16px;

    @media (max-width: 1024px) {
        gap: 8px;
    }

    button {
        color: var(--color-text);
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid var(--color-border);
        position: relative;
        background-color: var(--color-background-soft);
        transition: background-color 250ms;

        @media (max-width: 1024px) {
            padding: 8px;
        }

        &:hover {
            background-color: var(--color-background-mute);
        }

        &:active {
            top: 1px;
            left: 1px;
        }
    }
}
</style>
