import * as transitions from '@/utils/v-transition-name';

export default defineNuxtPlugin((nuxtApp) => {
    for (const name in transitions) {
        const normal = directiveNameToCssName(name);
        debugger;
        nuxtApp.vueApp.directive(normal, (transitions as any)[name]);
    }
});

function directiveNameToCssName(name: string): string {
    return name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`).replace('v-', '');
}