<script setup>

import { ref, watch, reactive, onMounted } from 'vue';
let propagatingStateToRoute = false;
const state = reactive({ code: '' });

popstate();
const $code = ref();
const loaded = ref(false);
const output = ref('');
const error = ref(false);
const consoleLog = reactive([]);

window.console = new Proxy(window.console, {
    get(obj, prop) {
        if (prop === 'log') {
            return function (...args) {
                consoleLog.push(args);
                debugger;
                obj.log(...args);
            }
        }
        if (typeof obj[prop] === 'function') return obj[prop].bind(obj);
        return Reflect.get(...arguments);
    }
});

const formatFromKey = e => {
    if (e.key === 'l' && e.ctrlKey) {
        (e.preventDefault(), format());
    }
}

const format = async () => state.code = await prettier.format(state.code, { parse: 'babel', trailingComma: 'none', plugins: prettierPlugins });
const copyRawUrl = () => copyToClipboard(location.href);
const copyMarkupUrl = () => copyToClipboard(`[${state.title || 'benchmark'}](${location.href})`);
const duplicate = () => window.open(location.href);
{

    let writePromise;
    watch(state, async state => {
        propagatingStateToRoute = true;
        await (writePromise ??= new Promise(r => queueMicrotask(async () => {
            //console.log('writing state to URL', JSON.clone(state));
            const hash = await JSON.stringify(state).compress('gzip base64 uri');
            location.hash = hash;
            writePromise = null;
        })));
    });
}

const syncHeight = () => {
    const area = $code.value;
    if (area.offsetWidth < area.scrollWidth) {
        area.style.width = area.scrollWidth + 16 + 'px';
    }
    if (area.offsetHeight < area.scrollHeight) {
        area.style.height = area.scrollHeight + 16 + 'px';
    }
};

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
                if (cont) {
                    if ($code.value.offsetWidth < cont.scrollWidth) {
                        $code.value.style.width = cont.scrollWidth + 16 + 'px';
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

async function updateCode(code) {
    setTimeout(() => loaded.value = true);
    const area = $code.value;
    area.value = code;
    error.value = false;
    try {
        consoleLog.length = 0;
        const result = await evalScript(code);
        output.value = result;//consoleLog.map(args => args.join(' ')).join('\n') + '\n' + result;

    } catch (e) {
        output.value = e.message;
        error.value = true;
    }
}

watch(() => state.code, syncHeight, { once: true })

watch(() => state.title, title => document.title = [title, 'silentmantra benchmark'].filter(Boolean).join(' / '));

window.addEventListener('hashchange', popstate);
document.addEventListener('keyup', e => e.key === "Enter" && e.ctrlKey && benchmark?.start());

async function popstate() {
    if (!location.hash) return;
    if (propagatingStateToRoute) {
        propagatingStateToRoute = false;
        return;
    }
    const data = JSON.parse(await location.hash.slice(1).decompress('uri base64 gzip'));
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

async function evalScript(code) {

    const script = document.createElement('script');
    script.type = "module";

    const id = Math.random().toString().slice(2).split('').reverse().join('');

    script.src = `data:text/javascript;base64,` + btoa(`
    try {
        window.__result${id} = eval(\`${code}\`);
    } catch (e) {
        window.__error${id} = e;
    }
`);

    document.body.appendChild(script);

    return new Promise((resolve, reject) => {
        script.onload = () => {
            if (window['__error' + id]) {
                const e = window['__error' + id];
                delete window['__error' + id];
                reject(e);
            }
            const result = window['__result' + id];
            delete window['__result' + id];
            location.host === 'localhost' || script.remove();
            resolve([result]);
        };
        script.onerror = reject;
    });
}

</script>
<template>
    <dialog><textarea></textarea></dialog>
    <div class="wrapper" :class="{ loaded }">
        <h1><img src="/public/gauge.svg"> silentmantra/snippet</h1>
        <!-- <div class="subtitle">A benchmark to write in pure JS and host anywhere, read <a target="_blank" href='/'>the
                    docs</a></div> -->
        <div class="toolbar">
            <button @click="format">format code (Ctrl+L)</button>
            <button @click="copyRawUrl">copy url</button>
            <button @click="copyMarkupUrl">copy markup url</button>
            <button v-if="0" @click="copyEmbed">embed</button>
            <button v-if="0" @click="duplicate">duplicate</button>
            <button @click="state.code = '', state.title = ''">empty</button>
        </div>
        <div class="title">
            <input v-model="state.title" placeholder="title" />
        </div>
        <div class="code-wrapper">
            <div class="toolbar">
                <button @click="updateCode($code.value)">Run</button>
            </div>
            <textarea autofocus ref="$code" v-once :key="1" class="code" spellcheck="false" @input="syncHeight"
                @keydown="formatFromKey"
                @keyup="state.code = $code.value"></textarea>
            <div class="output" :class="{ error }">
                <template v-for="args in consoleLog">{{ args.join(' ') + '\n' }}</template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.output {
    margin-top: 8px;
    position: absolute;
    width: 100%;
    white-space: pre;
    overflow-x: auto;

    &.error {
        color: red;
        background: #211;
    }
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

    margin-bottom: 16px;
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
input,
.output {
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