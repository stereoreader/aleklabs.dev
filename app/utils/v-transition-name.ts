import type { Directive } from 'vue';
import { viewTransitionName } from './common';

const currentTransitionNames = new Set<string>;

export const vTransitionName: Directive<HTMLElement, [string, string] | string> = {
    mounted(el, binding) {
        el.style.viewTransitionName = Array.isArray(binding.value) ? viewTransitionName(...binding.value) : binding.value;
    },
}

export const vTransitionTarget: Directive<HTMLElement, [string, string]> = {
    mounted(el, binding) {
        const name = viewTransitionName(...binding.value);
        el.style.viewTransitionName = name;
    },
}

let pendingSourceEl: HTMLElement | null = null;

const elems = new Map<HTMLElement, string>;

export const vTransitionSource: Directive<HTMLElement, [string, string]> = {
    unmounted(el) {
        elems.delete(el);
    },
    mounted(el, binding, vnodes) {

        const name = viewTransitionName(...binding.value);

        elems.set(el, name);



        el.addEventListener('click', onClick, { capture: true });
        function onClick(e: MouseEvent) {

            if (
                e.defaultPrevented ||
                e.button !== 0 ||
                e.metaKey || e.altKey || e.ctrlKey || e.shiftKey ||
                /\b_blank\b/i.test(el.getAttribute('target') ?? '')
            ) return;

            pendingSourceEl = el;

            const related: HTMLElement[] = [el];

            for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
                if (elems.has(ancestor)) related.push(ancestor);
            }

            for (const candidate of elems.keys()) {
                if (candidate !== el && el.contains(candidate)) related.push(candidate);
            }

            related.forEach(candidate => {
                const candidateName = elems.get(candidate);

                if (candidateName) candidate.style.viewTransitionName = candidateName;
            });

            //currentTransitionNames.add(name);

            const nuxtApp = useNuxtApp();

            const off = nuxtApp.hook('page:view-transition:start', transition => {
                if (pendingSourceEl !== el) return;

                transition.finished.finally(() => {

                    off();

                    related.forEach(candidate => {
                        const candidateName = elems.get(candidate);

                        if (candidateName) delete (candidate.style as any).viewTransitionName;
                    });

                    //currentTransitionNames.delete(name)
                    if (pendingSourceEl === el) pendingSourceEl = null;
                });
            });

        }

    },
}


function getAncestors(element: HTMLElement, selector: string): HTMLElement[] {
    const ancestors: HTMLElement[] = [];

    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.matches(selector)) ancestors.push(ancestor);
    }

    return ancestors;
}
