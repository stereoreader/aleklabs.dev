<script setup>
import { defaultKeymap, indentLess, indentMore } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { defaultHighlightStyle, HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    autofocus: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'keydown']);

const element = ref();
let view;
let syncingFromProps = false;
const tabSpaces = '    ';

defineExpose({
    element,
    focus() {
        view?.focus();
    },
});

const jsHighlightStyle = HighlightStyle.define(
    [
        { tag: [tags.keyword, tags.modifier], color: '#7fd7ff' },
        { tag: [tags.controlKeyword, tags.operatorKeyword], color: '#6eb8ff' },
        { tag: [tags.function(tags.variableName), tags.labelName], color: '#87e5a5' },
        { tag: [tags.name, tags.variableName], color: 'var(--color-text)' },
        { tag: [tags.propertyName, tags.attributeName], color: '#94b6ff' },
        { tag: [tags.string, tags.special(tags.string)], color: '#f6bf77' },
        { tag: [tags.number, tags.bool, tags.null], color: '#f59ac1' },
        { tag: [tags.comment], color: '#7f8c98', fontStyle: 'italic' },
        { tag: [tags.punctuation, tags.bracket], color: '#9ca8b3' },
    ],
    { themeType: 'dark' }
);

const theme = EditorView.theme(
    {
        '&': {
            width: '100%',
            maxWidth: '100%',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background-soft)',
            color: 'var(--color-text)',
            fontFamily: '\'Courier New\', Courier, monospace',
            fontSize: '14px',
            lineHeight: '1.4',
        },
        '.cm-scroller': {
            overflowX: 'auto',
            overflowY: 'hidden',
        },
        '.cm-content': {
            minHeight: '256px',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            padding: '8px',
            caretColor: '#7fd7ff',
        },
        '.cm-cursor': {
            borderLeftColor: '#7fd7ff',
        },
        '.cm-activeLine': {
            backgroundColor: 'rgba(127, 215, 255, 0.08)',
        },
        '.cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: 'rgba(127, 215, 255, 0.25) !important',
        },
        '&.cm-focused': {
            outline: 'none',
            borderColor: 'var(--color-border-hover)',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: 'rgba(127, 215, 255, 0.3) !important',
        },
    },
    { dark: true }
);

onMounted(() => {
    if (!element.value) {
        return;
    }

    view = new EditorView({
        parent: element.value,
        state: EditorState.create({
            doc: props.modelValue,
            extensions: [
                EditorState.tabSize.of(4),
                indentUnit.of(tabSpaces),
                drawSelection(),
                highlightActiveLine(),
                javascript(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                syntaxHighlighting(jsHighlightStyle),
                theme,
                keymap.of([
                    {
                        key: 'Tab',
                        run(view) {
                            if (view.state.selection.ranges.some(range => !range.empty)) {
                                return indentMore({
                                    state: view.state,
                                    dispatch(transaction) {
                                        view.dispatch(transaction);
                                    },
                                });
                            }
                            view.dispatch(view.state.replaceSelection(tabSpaces));
                            return true;
                        },
                    },
                    {
                        key: 'Shift-Tab',
                        run(view) {
                            return indentLess({
                                state: view.state,
                                dispatch(transaction) {
                                    view.dispatch(transaction);
                                },
                            });
                        },
                    },
                    ...defaultKeymap,
                ]),
                EditorView.domEventHandlers({
                    keydown(event) {
                        emit('keydown', event);
                        return false;
                    },
                }),
                EditorView.updateListener.of(update => {
                    if (!update.docChanged || syncingFromProps) {
                        return;
                    }
                    emit('update:modelValue', update.state.doc.toString());
                }),
            ],
        }),
    });

    if (props.autofocus) {
        view.focus();
    }
});

watch(
    () => props.modelValue,
    nextValue => {
        if (!view) {
            return;
        }
        const currentValue = view.state.doc.toString();
        if (nextValue === currentValue) {
            return;
        }
        syncingFromProps = true;
        view.dispatch({
            changes: {
                from: 0,
                to: currentValue.length,
                insert: nextValue,
            },
        });
        syncingFromProps = false;
    }
);

onBeforeUnmount(() => {
    view?.destroy();
});
</script>

<template>
    <div ref="element" class="al-code"></div>
</template>

<style lang="scss" scoped>
.al-code {
    width: 100%;
}

:deep(.cm-editor) {
    scrollbar-width: 16px;
    scrollbar-color: var(--color-scrollbar-track) var(--color-background);
}
</style>