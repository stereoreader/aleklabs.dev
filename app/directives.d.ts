
declare module 'vue' {
    interface GlobalDirectives {
        vTransitionName: typeof import('../app/utils/v-transition-name').vTransitionName;
        vResizeHeight: typeof import('../app/utils/v-resize-height').vResizeHeight;
        vTransitionSource: typeof import('../app/utils/v-transition-name').vTransitionSource;
        vTransitionTarget: typeof import('../app/utils/v-transition-name').vTransitionTarget;
    }
}

export {};