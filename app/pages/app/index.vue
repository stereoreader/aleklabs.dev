<script setup lang="ts">
const targetUrl = 'https://aleklabs.dev/stereo-reader/app/';

useHead({
    title: 'Redirecting...',
    link: [
        {
            rel: 'canonical',
            href: targetUrl
        }
    ],
    meta: [
        {
            'http-equiv': 'refresh',
            content: `0; url=${targetUrl}`
        }
    ]
});

await navigateTo(targetUrl, {
    external: true,
    redirectCode: 301
});
</script>

<template>
    <p>
        Redirecting to
        <a :href="targetUrl">{{ targetUrl }}</a>.
    </p>
</template>