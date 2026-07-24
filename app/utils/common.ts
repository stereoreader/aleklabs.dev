export function viewTransitionName(prefix: string, suffix: string) {
    return prefix.replace(/[^\d\w]+/g, '-').replace(/^-+|-+$/g, '') + '-' + suffix;
}