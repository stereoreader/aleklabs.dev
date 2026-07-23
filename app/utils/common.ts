export function viewTransitionName(prefix: string, suffix: string) {
    const out= prefix.replace(/[^\d\w]+/g, '-').replace(/^-+|-+$/g, '') + '-' + suffix;
    console.log(out);
    return out;
}