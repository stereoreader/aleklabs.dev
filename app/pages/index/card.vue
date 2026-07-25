<script setup lang="ts">
const props = defineProps<{
    href: string,
    title: string,
    imageSrc?: string,
}>();

const rotate = ref('0');
const hoverColor = ref('#fff');
const pushZ = ref('0');

const isDown = ref(false);
const opacity = ref(0);

function push(e: PointerEvent) {
    const $card = e.currentTarget as HTMLDivElement;
    const { top, height } = $card.getBoundingClientRect();
    const pos = (e.clientY - top) / height;
    console.log(pos);
    rotate.value = (0.5 - pos) * 8 + 'deg';
    hoverColor.value = pos > .5 ? '#000' : '#fff';
    isDown.value = pos > .5;
    pushZ.value = (0.5 - Math.abs(0.5 - pos)) * -8 + 'px';
    opacity.value = (1 - pos) * .1;
}

const isPressed = ref(false);
const cardHeight = ref(0);

const $card = useTemplateRef('$card');

const aspectRatio = computed(() => {
    cardHeight.value;
    if (!$card.value) return;
    const rect = $card.value.getBoundingClientRect();
    return rect.width / rect.height;
});

</script>

<template>
    <div class="wrapper" ref="$card">
        <nuxt-link class="card" v-resize-height="height => cardHeight = height"
            :href
            :class="{
                'card--without-image': !imageSrc,
                down: isDown,
                pressed: isPressed
            }"
            @pointermove="event => push(event)"
            @pointerdown.prevent="event => (isPressed = true, push(event))"
            @pointerup="isPressed = false"
            @pointercancel="isPressed = false"
            @pointerleave="isPressed = false, rotate = '0', pushZ = '0'">
            <img v-if="imageSrc" class="thumb" :src="imageSrc" :alt="title">
            <div>
                <h3 class="title">{{ title }}</h3>
                <p class="description">
                    <slot />
                </p>
            </div>
            <div class="hover-border"></div>
        </nuxt-link>
    </div>
</template>

<style scoped lang="scss">
@mixin mobile {
    @media (max-width: 680px) {
        @content
    }
}

.wrapper {
    user-select: none;
    perspective: 800px;

}

@property --angle {
    syntax: "<angle>";
    initial-value: 0turn;
    inherits: false;
}

.card {

    -webkit-tap-highlight-color: transparent !important;

    --push-rotate: 1;
    --push-z: 1;

    --card-padding: 16px;
    --transition-duration: .2s;

    transform: rotateX(calc(var(--push-rotate) * v-bind(rotate))) translateZ(calc(var(--push-z) * v-bind(pushZ)));
    transition: transform var(--transition-duration);
    position: relative;
    display: flex;
    gap: calc(2 * var(--card-padding));
    min-height: 150px;
    padding: var(--card-padding);
    border-radius: var(--border-radius);
    background: var(--panel);
    color: inherit;
    text-decoration: none;
    overflow: hidden;

    &.pressed {
        --push-rotate: 2;
        --push-z: 2;
    }

    @include mobile {
        flex-flow: column;
    }

    &.card--without-image {
        grid-template-columns: 1fr;
    }


    &:after {

        content: '';
        inset: 0;
        display: block;
        position: absolute;
        pointer-events: none;
        transition: opacity var(--transition-duration);


        //transition: opacity 300ms, background-color 300ms;

        opacity: 0;
        background-color: white;

        //box-shadow: inset 0 0 16px rgba(#fff, .1);
        //border-radius: var(--border-radius);
    }


    .hover-border {
        display: none;
    }

    &.pressed,
    &:hover,
    &:focus-visible {
        background: var(--panel-hover);
        outline: none;
        box-shadow: 0 0 48px rgba(255, 255, 255, .05);
        transition: none;

        // &.down {
        //     &:after {
        //         background-color: black;
        //         opacity: calc(.3 + v-bind(opacity));
        //     }
        // }

        &:after {
            transition: none;
            opacity: calc(.01 * var(--push-z) + v-bind(opacity));
        }

        .hover-border {
            display: block;
            border-radius: var(--border-radius);
            z-index: 1;
            pointer-events: none;
            position: absolute;
            inset: 0;
            border: 2px solid transparent;
            background:
                conic-gradient(from var(--angle), rgb(0, 162, 255), rgba(0, 255, 42, 0), rgba(0, 255, 42, 0), rgb(0, 162, 255)) border-box;
            mask:
                linear-gradient(#000 0 0) content-box,
                linear-gradient(#000 0 0);
            mask-composite: exclude;

            --aspect-ratio: v-bind(aspectRatio);
            --corner-angle: atan(var(--aspect-ratio));

            animation: spin 4s infinite;
        }

    }

}

@keyframes spin {
    to {
        --angle: 1turn;
    }
}

.thumb {
    margin: calc(-1 * var(--card-padding));
    margin-right: 0;
    width: 236px;
    //height: 100%;
    //height: 126px;
    object-fit: cover;
    object-position: left center;
    //border-radius: 10px;
    //background: #050506;

    @include mobile {
        width: calc(100% + 2 * var(--card-padding));
        aspect-ratio: 1000 / 420;
    }
}

.title {
    margin: 0 0 8px;
    line-height: 1.2;
    font-weight: 500;
    font-size: 22px;

}

.description {
    max-width: 560px;
    margin: 0;
    color: var(--muted);
    font-size: 14px;
}

@media (max-width: 680px) {
    main {
        width: min(100% - 24px, 920px);
        padding: 28px 0;
    }


}
</style>
