const element = document.querySelector('.logo') as HTMLDivElement;

setInterval(() => {
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

    const duration = random(40, 180);

    setTimeout(resetEffect, duration);

}, 120);

function resetEffect() {
    element.style.filter = '';
    element.style.transform = '';
    element.style.opacity = '';
}

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}