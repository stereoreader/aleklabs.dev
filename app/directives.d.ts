
declare module 'vue' {
    interface GlobalDirectives {
        vTransitionName: typeof import('../app/utils/v-transition-name').vTransitionName;
    }
}

export {};