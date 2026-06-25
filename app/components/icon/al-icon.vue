<script setup lang="ts">

const icons = import.meta.glob('./icons/*.svg', { eager: true, query: '?raw' }) as Record<string, { default: string }>;

const { size: propSize = 28, icon, scale = 1 } = defineProps<{
    icon?: string,
    size?: number | string
    scale?: number,
}>();

const size = computed(() => {
    let out = propSize;
    if (parseInt(out.toString()).toString() === out.toString()) out += 'px';
    return `calc(var(--icon-size, ${out}) * ${scale})`;
});

const html = computed(() => {
    let sub = 'var(--icon-color, var(--text-color, var(--app-color)))';
    let found = icons[`./icons/${icon}.svg`];
    if (!found) {
        sub = 'red';
        found = icons[`./icons/error.svg`];
    }
    if (!found) throw new Error('No error.svg icon found');
    return transformSvg(found.default, sub);

    function transformSvg(svg: string, color: string): string {
        let out = svg;
        const svgStart = out.indexOf('<svg');
        const svgEnd = out.lastIndexOf('</svg>');

        if (svgStart >= 0 && svgEnd >= 0) {
            out = out.slice(svgStart, svgEnd + 6);
        }

        out = out.replace(/<svg\b([^>]*)>/i, (match, attrs: string) => {
            const cleanedAttrs = attrs
                .replace(/\swidth=(["']).*?\1/i, '')
                .replace(/\sheight=(["']).*?\1/i, '');

            return `<svg${cleanedAttrs}>`;
        });

        out = out.replace(/\s(fill|stroke|stop-color)=(["'])([^"']*)\2/gi, (match, name: string, quote: string, value: string) => {
            if (value.trim().toLowerCase() === 'none') return match;
            return ` ${name}=${quote}${color}${quote}`;
        });

        out = out.replace(/\sstyle=(["'])(.*?)\1/gi, (match, quote: string, style: string) => {
            const transformedStyle = style
                .replace(/(^|;)\s*fill\s*:\s*([^;]+)/gi, (styleMatch, prefix: string, value: string) => value.trim().toLowerCase() === 'none' ? styleMatch : `${prefix}fill: ${color}`)
                .replace(/(^|;)\s*stroke\s*:\s*([^;]+)/gi, (styleMatch, prefix: string, value: string) => value.trim().toLowerCase() === 'none' ? styleMatch : `${prefix}stroke: ${color}`)
                .replace(/(^|;)\s*stop-color\s*:\s*([^;]+)/gi, (styleMatch, prefix: string, value: string) => value.trim().toLowerCase() === 'none' ? styleMatch : `${prefix}stop-color: ${color}`);

            return ` style=${quote}${transformedStyle}${quote}`;
        });

        return out;
    }
});

</script>
<template>
    <span class="al-icon" v-if="icon && icon !== 'none'" :style="`width:${size};height:${size}`"
        v-html="html"></span>
    <span v-else-if="icon === 'none'"
        :style="`width:${size};height:${size}`">
    </span>
</template>

<style lang="scss" scoped>
span {
    display: inline-flex;
}

svg {
    object-fit: contain;
    width: 100%;
}
</style>
