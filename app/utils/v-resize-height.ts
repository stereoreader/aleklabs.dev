import type { Directive } from 'vue';

type ResizeHeightCallback = (height: number) => void;

type StoreItem = {
    observer: ResizeObserver;
    cb: ResizeHeightCallback;
    lastHeight: number | null;
};

const store = new WeakMap<Element, StoreItem>();

/**
 * v-resize-height
 * Usage:
 * <div v-resize-height="onHeightChange"></div>
 *
 * The binding value must be a function: (entry, height) => void
 */
export const vResizeHeight: Directive<HTMLElement, ResizeHeightCallback> = {
    mounted(el, binding) {
        const cb = binding.value;
        const item: StoreItem = {
            observer: new ResizeObserver(() => {
                const height = el.offsetHeight;
                if (item.lastHeight === null || Math.round(height) !== Math.round(item.lastHeight)) {
                    item.lastHeight = height;
                    item.cb(height);
                }
            }),
            cb,
            lastHeight: null,
        };

        store.set(el, item);
        item.observer.observe(el);
    },

    updated(el, binding) {
        const item = store.get(el);
        if (!item) return;

        const newCb = binding.value;
        if (typeof newCb === 'function' && newCb !== item.cb) {
            item.cb = newCb;
        }
    },

    unmounted(el) {
        const item = store.get(el);
        if (!item) return;
        item.observer.disconnect();
        store.delete(el);
    },
};

export default vResizeHeight;
