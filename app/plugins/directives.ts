import * as transitions from '@/utils/v-transition-name';
import { vResizeHeight } from '@/utils/v-resize-height';

export default defineNuxtPlugin((nuxtApp) => {
    for (const name in transitions) {
        const normal = directiveNameToCssName(name);
        nuxtApp.vueApp.directive(normal, (transitions as any)[name]);
    }
    nuxtApp.vueApp.directive('resize-height', vResizeHeight);
});

function directiveNameToCssName(name: string): string {
    return name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`).replace('v-', '');
}