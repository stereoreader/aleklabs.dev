import type { Directive } from 'vue';
import { viewTransitionName } from './common';

export const vTransitionName: Directive<HTMLElement, [string, string]> = {
    mounted(el, binding) {
        console.log(binding.value);
        el.style.viewTransitionName = viewTransitionName(...binding.value);
    },
}