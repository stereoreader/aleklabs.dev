type Cleanup = () => void;

const noop: Cleanup = () => {};

export function mountLogoEffect(element: HTMLDivElement | null): Cleanup {

    if (!element) {
        return noop;
    }

    let resetTimer = 0;
    const effectTimer = window.setInterval(() => {
        const active = Math.random() < 0.05;

        if (!active) {
            resetEffect();
            return;
        }

        const blur = random(0, 3);
        const brightness = random(1, 2);
        const contrast = random(0.8, 2.5);
        const hue = random(-40, 40);

        const s = random(.2, .5);
        const translateX = random(-8 * s, 8 * s);
        const scaleY = random(1 - .1 * s, 1 + .1 * s);
        const opacity = random(0.75, 1);

        element.style.filter = [
            `blur(${blur.toFixed(2)}px)`,
            `brightness(${brightness.toFixed(2)})`,
            `contrast(${contrast.toFixed(2)})`,
            `hue-rotate(${hue.toFixed(2)}deg)`
        ].join(' ');

        element.style.transform = [
            `translateX(${translateX.toFixed(2)}px)`,
            `scaleY(${scaleY.toFixed(3)})`
        ].join(' ');

        element.style.opacity = opacity.toFixed(2);

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(resetEffect, random(40, 180));
    }, 120);

    return () => {
        window.clearInterval(effectTimer);
        window.clearTimeout(resetTimer);
        resetEffect();
    };

    function resetEffect() {

        element.style.filter = '';
        element.style.transform = '';
        element.style.opacity = '';
    }

    function random(min: number, max: number) {

        return Math.random() * (max - min) + min;
    }
}
