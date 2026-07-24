import {gsap} from 'gsap';

export default defineNuxtPlugin(nuxtApp => {
    // nuxtApp.hook('page:view-transition:start', transition => {
    //     const wasPaused = gsap.globalTimeline.paused();

    //     gsap.globalTimeline.pause();

    //     void transition.finished.finally(() => {
    //         if (!wasPaused) gsap.globalTimeline.resume();
    //     }).catch(() => undefined);
    // });
});