<script setup lang="ts">
defineProps<{
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


</script>

<template>
    <div class="wrapper">
        <a class="card" :class="{ 'card--without-image': !imageSrc, down: isDown }" :href ref="$card"
            @pointermove="push"
            @pointerleave="rotate = '0', pushZ = '0'">
            <img v-if="imageSrc" class="thumb" :src="imageSrc" :alt="title">
            <div>
                <h3 class="title">{{ title }}</h3>
                <p class="description">
                    <slot />
                </p>
            </div>
        </a>
    </div>
</template>

<style scoped lang="scss">
@mixin mobile {
    @media (max-width: 680px) {
        @content
    }
}

.wrapper {
    perspective: 800px;

}

.card {

    --card-padding: 16px;
    --transition-duration: .2s;

    transform: rotateX(v-bind(rotate)) translateZ(v-bind(pushZ));
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

            opacity: calc(.01 + v-bind(opacity));
        }

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
