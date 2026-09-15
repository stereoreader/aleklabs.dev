const locales = import.meta.glob(['./??.*.ts', './??.ts']);
export const supportedLocales = new Set(['de', 'en', 'es', 'fr', 'he', 'it', 'ru']);

const translationsByLocale: Record<string, Record<string, string>> = {};

const cache: Record<string, string> = reactive({});

export const activeLocale = ref('en');

export async function loadLang(_locale?: string) {

    let locale = _locale?.split('-')[0].toLocaleLowerCase();

    if (!locale || !supportedLocales.has(locale)) {
        locale = 'en';
    }

    activeLocale.value = locale;

    if (translationsByLocale[locale]) return;

    const translations: Record<string, string> = {};
    const keys = Object.keys(locales).filter(key => key.includes(locale + '.'));
    for (const path of keys) {
        const { default: loaded } = await (locales[path as keyof typeof locales] as Function)();
        for (const key in loaded) {
            if (key in translations) {
                console.error(`Translation key "${key}" already exists: "${translations[key]}" (adding "${loaded[key]}" from ${path})`);
                continue;
            }
            translations[key] = loaded[key];
        }
    }
    translationsByLocale[locale] = translations;
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const prefixes = ['Open', 'Close', 'Turn on', 'Turn off', 'Show'];
const prefixRegex = new RegExp(`^(${prefixes.map(escapeRegex).join('|')})\\s+`, 'i');

export function $t(key: string): string {
    if (!key) return '';
    const locale = resolveLocale();
    const cacheKey = locale + ':' + key;
    const cached = cache[cacheKey];
    if (cached) return cached;
    const translations = translationsByLocale[locale] ?? {};
    const lower = key.toLocaleLowerCase();
    let found = translations[lower];
    if (!found) {
        found = translations[key];
    }
    if (found) {
        if (key[0].toUpperCase() === key[0]) {
            found = found[0].toLocaleUpperCase() + found.slice(1);
        }
        cache[cacheKey] = found;
        return found;
    }

    const match = key.match(prefixRegex);
    if (match) {
        const prefix = match[1];
        const rest = key.slice(prefix.length).trimStart();
        const result = $t(prefix) + ' ' + $t(rest);
        cache[cacheKey] = result;
        return result;
    }

    cache[cacheKey] = key;
    return key;

    function resolveLocale(): string {

        try {
            const slug = useRoute().params.slug;
            const parts = (Array.isArray(slug) ? slug : slug ? [slug] : []).flatMap(part => String(part).split('/')).filter(Boolean);
            const first = parts[0];
            if (first && first.length === 2 && supportedLocales.has(first)) return first;
            return 'en';
        } catch {
            return activeLocale.value;
        }
    }
}
