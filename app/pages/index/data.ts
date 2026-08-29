export async function useHomeData() {
    const {data} = await useAsyncData('home', async () => {
        const [{ articles: articles }, { articles: experience }] = await Promise.all([import('@pages/articles/articles'), import('@pages/experience/articles')]);
        const filter = (article: typeof articles[number]) => ({
            slug: article.slug,
            description: article.description,
            coverUrl: article.coverUrl,
            title: article.title
        });

        return { articles: articles.map(filter), experience: experience.map(filter) };
    });
    return data.value!;
}