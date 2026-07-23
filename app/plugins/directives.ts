import { vTransitionName } from '@/utils/v-transition-name';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('transition-name', vTransitionName);
});