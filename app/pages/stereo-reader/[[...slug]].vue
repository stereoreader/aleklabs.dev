<script setup lang="ts">
definePageMeta({
    layout: false
});

const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug : route.params.slug ? [route.params.slug] : [];
const parts = slug.flatMap(part => part.split('/')).filter(Boolean);

const joined = parts.join('/');
const targetPath = !parts.length
    ? '/stereobv-workshop'
    : parts[0] === 'app' || parts[0] === 'app-beta'
        ? `/stereobv-workshop/${joined}/`
        : `/stereobv-workshop/${joined}`;
const queryIndex = route.fullPath.indexOf('?');
const query = queryIndex >= 0 ? route.fullPath.slice(queryIndex) : '';
const target = targetPath + query;

useHead({
    meta: [
        { 'http-equiv': 'refresh', content: `0; url=${target}` },
        { name: 'robots', content: 'noindex' }
    ],
    script: [{
        innerHTML: `location.replace(${JSON.stringify(target)} + location.hash)`,
        tagPosition: 'head'
    }]
});
</script>

<template>
    <a :href="target">StereoBV Workshop</a>
</template>
