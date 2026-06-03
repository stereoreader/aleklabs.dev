(async () => {
    try {
        const response = await fetch(new URL('./screen.gif', import.meta.url));

        if (!response.ok) {
            throw new Error('Failed to load cover background image');
        }

        const buffer = await response.arrayBuffer();
        const type = response.headers.get('content-type') ?? 'image/gif';

        self.postMessage({
            buffer,
            type
        }, [buffer]);
    } catch (error) {
        self.postMessage({
            error: error instanceof Error ? error.message : 'Failed to load cover background image'
        });
    }
})();
