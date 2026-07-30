export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.server || to.path !== '/' || from.path === '/' || window.history.state?.back !== '/') {
        return;
    }

    const router = useRouter();

    setTimeout(() => {
        router.back();
    });

    return abortNavigation();
});
