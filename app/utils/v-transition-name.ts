import type { Directive } from 'vue';
import { viewTransitionName } from './common';

export const vTransitionName: Directive<HTMLElement, [string, string] | string> = {
    mounted(el, binding) {
        el.style.viewTransitionName = Array.isArray(binding.value) ? viewTransitionName(...binding.value) : binding.value;
    },
}

export const vTransitionTarget: Directive<HTMLElement, string> = {
    mounted(el, binding) {
        const $route = useRoute();
        el.style.viewTransitionName = viewTransitionName($route.fullPath, binding.value);
    },
}

export const vTransitionSource: Directive<HTMLElement, [string, string]> = {
    mounted(el, binding) {
        el.classList.add('v-transition-source');
        el.addEventListener('pointerdown', () => {
            [...(el.querySelectorAll('v-transtion-source') as unknown as HTMLElement[]), el].forEach(el => el.style.viewTransitionName = viewTransitionName(...binding.value));
        });
    },
}