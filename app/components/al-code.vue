<script setup lang="ts">
import { autocompletion, pickedCompletion } from '@codemirror/autocomplete';
import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { defaultKeymap, indentLess, indentMore } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { defaultHighlightStyle, HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorSelection, EditorState, Prec, RangeSetBuilder } from '@codemirror/state';
import { Decoration, drawSelection, EditorView, highlightActiveLine, keymap, ViewPlugin } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
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

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'keydown', value: KeyboardEvent): void;
}>();

const element = ref<HTMLElement>();
let view: EditorView | undefined;
let syncingFromProps = false;
const tabSpaces = '    ';

type KeywordConfig = {
    style: string;
    template: string;
    textStyle?: string;
};

type ResolvedKeywordConfig = KeywordConfig & {
    keywordVars: string;
    textVars?: string;
    completionClass: string;
};

const keywords: Record<string, KeywordConfig> = {
    '@benchmark': {
        style: 'color: orange;',
        textStyle: 'color: yellow; font-style: normal;',
        template: ' <solution name>',
    },
    '@run': {
        style: 'color: #87e5a5;',
        template: '\n',
    },
    '@group': {
        style: 'color: orange;',
        textStyle: 'color: yellow; font-style: normal;',
        template: ' <group name>',
    },
};

const resolvedKeywords = Object.fromEntries(
    Object.entries(keywords).map(([key, config]) => [
        key,
        {
            ...config,
            completionClass: `al-code-completion-${toClassName(key)}`,
            keywordVars: toStyleVariables(config.style, '--al-code-keyword'),
            textVars: toStyleVariables(config.textStyle, '--al-code-keyword-tail'),
        },
    ])
) as Record<string, ResolvedKeywordConfig>;

const keywordPattern = /^(\s*\/\/\s*)(@\w+)(.*)$/;
const keywordAutocompletePattern = /@\w*$/;
const placeholderPattern = /<[^<>]*>/;
const keywordCompletionTheme = EditorView.theme(buildKeywordCompletionThemeRules());

const keywordDecorations = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildKeywordDecorations(view.state);
        }

        update(update: ViewUpdate) {
            if (!update.docChanged) {
                return;
            }
            this.decorations = buildKeywordDecorations(update.state);
        }
    },
    {
        decorations(value) {
            return value.decorations;
        },
    }
);

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
                javascriptLanguage.data.of({ autocomplete: keywordCompletionSource }),
                autocompletion({
                    optionClass(completion) {
                        return resolvedKeywords[completion.label]?.completionClass ?? '';
                    },
                }),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                syntaxHighlighting(jsHighlightStyle),
                Prec.highest(keywordDecorations),
                keywordCompletionTheme,
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

function buildKeywordDecorations(state: EditorState): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber++) {
        const line = state.doc.line(lineNumber);
        const match = line.text.match(keywordPattern);
        if (!match) {
            continue;
        }
        const prefix = match[1];
        const keyword = match[2];
        if (!prefix || !keyword) {
            continue;
        }
        const config = resolvedKeywords[keyword];
        if (!config) {
            continue;
        }
        const prefixLength = prefix.length;
        const keywordFrom = line.from + prefixLength;
        const keywordTo = keywordFrom + keyword.length;
        builder.add(
            keywordFrom,
            keywordTo,
            Decoration.mark({
                class: 'al-code-keyword-mark',
                attributes: { style: config.keywordVars },
            })
        );
        if (!config.textVars || keywordTo >= line.to) {
            continue;
        }
        builder.add(
            keywordTo,
            line.to,
            Decoration.mark({
                class: 'al-code-keyword-tail',
                attributes: { style: config.textVars },
            })
        );
    }
    return builder.finish();
}

function keywordCompletionSource(context: CompletionContext): CompletionResult | null {
    const line = context.state.doc.lineAt(context.pos);
    const cursorOffsetInLine = context.pos - line.from;
    const beforeCursor = line.text.slice(0, cursorOffsetInLine);
    const keywordMatch = beforeCursor.match(keywordAutocompletePattern);
    if (!keywordMatch) {
        return null;
    }

    const atText = keywordMatch[0];
    if (!atText) {
        return null;
    }

    const atOffset = beforeCursor.length - atText.length;
    const beforeAt = beforeCursor.slice(0, atOffset);
    if (!isKeywordAutocompleteContext(beforeAt, line.text)) {
        return null;
    }

    return {
        from: line.from + atOffset,
        options: Object.keys(resolvedKeywords).map(keyword => ({
            label: keyword,
            type: 'keyword',
            apply(view, completion, from, to) {
                applyKeywordCompletion(view, completion, from, to);
            },
        })),
        validFor: keywordAutocompletePattern,
    };
}

function applyKeywordCompletion(view: EditorView, completion: Completion, from: number, to: number): void {
    const keyword = completion.label;
    const config = resolvedKeywords[keyword];
    if (!config) {
        return;
    }

    const line = view.state.doc.lineAt(from);
    const lineText = line.text;
    const lineIndent = (lineText.match(/^\s*/) ?? [''])[0];
    const startsWithComment = /^\s*\/\//.test(lineText);
    const commentPrefix = startsWithComment ? '' : `${lineIndent}// `;
    const insertText = `${commentPrefix}${keyword}${config.template}`;
    const replaceFrom = startsWithComment ? from : line.from;

    const placeholderFrom = commentPrefix.length + keyword.length;
    const placeholderMatch = findPlaceholderRange(insertText, placeholderFrom);
    const selection = placeholderMatch
        ? EditorSelection.range(replaceFrom + placeholderMatch.from, replaceFrom + placeholderMatch.to)
        : EditorSelection.cursor(replaceFrom + insertText.length);

    view.dispatch({
        changes: {
            from: replaceFrom,
            to,
            insert: insertText,
        },
        selection,
        scrollIntoView: true,
        annotations: pickedCompletion.of(completion),
    });
}

function buildKeywordCompletionThemeRules(): Record<string, Record<string, string>> {
    const rules: Record<string, Record<string, string>> = {};
    for (const keyword in resolvedKeywords) {
        const config = resolvedKeywords[keyword];
        if (!config) {
            continue;
        }
        const completionStyle = toStyleSpec(config.style);
        if (!Object.keys(completionStyle).length) {
            continue;
        }
        const labelSelector = `.cm-tooltip-autocomplete li.${config.completionClass} .cm-completionLabel`;
        const matchedSelector = `.cm-tooltip-autocomplete li.${config.completionClass} .cm-completionMatchedText`;
        rules[labelSelector] = completionStyle;
        rules[matchedSelector] = completionStyle;
    }
    return rules;
}

function isKeywordAutocompleteContext(beforeAt: string, lineText: string): boolean {
    if (/^\s*$/.test(beforeAt) && /^\s*@?\w*\s*$/.test(lineText)) {
        return true;
    }

    const commentIndex = beforeAt.indexOf('//');
    if (commentIndex < 0) {
        return false;
    }

    const contentBeforeComment = beforeAt.slice(0, commentIndex);
    return /^\s*$/.test(contentBeforeComment);
}

function findPlaceholderRange(text: string, fromOffset: number): { from: number; to: number } | null {
    const textAfterFrom = text.slice(fromOffset);
    const placeholder = textAfterFrom.match(placeholderPattern);
    if (!placeholder || placeholder.index == null) {
        return null;
    }
    const from = fromOffset + placeholder.index;
    return {
        from,
        to: from + placeholder[0].length,
    };
}

function toClassName(keyword: string): string {
    return keyword.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function toStyleSpec(style: string | undefined): Record<string, string> {
    if (!style) {
        return {};
    }

    const spec: Record<string, string> = {};
    const declarations = style.split(';');
    for (const declaration of declarations) {
        const separatorIndex = declaration.indexOf(':');
        if (separatorIndex < 0) {
            continue;
        }
        const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
        const value = declaration.slice(separatorIndex + 1).trim();
        if (!value) {
            continue;
        }

        if (property === 'color') {
            spec.color = value;
        } else if (property === 'font-style') {
            spec.fontStyle = value;
        } else if (property === 'font-weight') {
            spec.fontWeight = value;
        }
    }

    return spec;
}

function toStyleVariables(style: string | undefined, prefix: string): string {
    if (!style) {
        return '';
    }

    const declarations = style.split(';');
    const variables: string[] = [];
    for (const declaration of declarations) {
        const separatorIndex = declaration.indexOf(':');
        if (separatorIndex < 0) {
            continue;
        }
        const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
        const value = declaration.slice(separatorIndex + 1).trim();
        if (!value) {
            continue;
        }

        if (property === 'color') {
            variables.push(`${prefix}-color: ${value};`);
        } else if (property === 'font-style') {
            variables.push(`${prefix}-font-style: ${value};`);
        } else if (property === 'font-weight') {
            variables.push(`${prefix}-font-weight: ${value};`);
        }
    }

    return variables.join(' ');
}
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

:deep(.al-code-keyword-mark),
:deep(.al-code-keyword-mark *) {
    color: var(--al-code-keyword-color, inherit) !important;
    font-style: var(--al-code-keyword-font-style, inherit) !important;
    font-weight: var(--al-code-keyword-font-weight, inherit) !important;
}

:deep(.al-code-keyword-tail),
:deep(.al-code-keyword-tail *) {
    color: var(--al-code-keyword-tail-color, inherit) !important;
    font-style: var(--al-code-keyword-tail-font-style, inherit) !important;
    font-weight: var(--al-code-keyword-tail-font-weight, inherit) !important;
}
</style>