const canvas = document.querySelector('#heartbeat');
const parent = canvas.parentElement;
canvas.width = parent.clientWidth;
canvas.height = parent.clientHeight;

let off;
let activeLink = null;

for (const link of parent.querySelectorAll('a')) {
    link.addEventListener('pointerenter', () => {
        off?.();
        activeLink = link;
        off = drawHeartBeat(canvas, getLinkCenter(link));
    });

    link.addEventListener('pointerleave', () => {
        if (activeLink !== link) {
            return;
        }

        off?.();
        off = null;
        activeLink = null;
    });
}

function drawHeartBeat(canvas, origin) {
    const bpm = getHeartbeatBpm(parent);
    const beatWidth = 100; // width between beats in pixels

    const pointColor = '#ff0000'; // color of the moving point
    const pointRadius = 2;
    const pointBlur = 2; // blur of the point in pixels
    const pointOpacity = 1; // 0..1

    const lineColor = '#ff7700';
    const lineThickness = 1;
    const lineBlur = 1;
    const lineOpacity = 0.5; // 0..1

    const linePositionFromBottom = 0.35; // 0..1, where 0.5 is vertical center
    const amplitude = 0.6; // 0..1, relative canvas height

    const trailLength = 260; // pixels
    const trailAlphaMin = 0.18;
    const trailAlphaMax = 1;

    const wrapGap = 20; // prevents drawing a line across right-to-left wrap
    const pixelRatio = window.devicePixelRatio || 1;
    const pixelsPerSecond = beatWidth * bpm / 60;
    const startX = origin?.x ?? 0;

    const ctx = canvas.getContext('2d');
    const points = [];

    let frameId = 0;
    let startTime = performance.now();
    let lastCssWidth = 0;
    let lastCssHeight = 0;
    let stopped = false;

    resize();
    drawPoint(startX, getHeartbeatY(0, canvas.height / pixelRatio));

    frameId = requestAnimationFrame(drawFrame);

    return function stop() {
        stopped = true;
        cancelAnimationFrame(frameId);
        ctx.clearRect(0, 0, lastCssWidth, lastCssHeight);
    };

    function drawFrame(time) {
        if (stopped) {
            return;
        }

        resize();

        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;
        const elapsed = (time - startTime) / 1000;
        const distance = elapsed * pixelsPerSecond;
        const x = (startX + distance) % width;
        const y = getHeartbeatY(distance, height);

        if (points.length > 0 && x < points[points.length - 1].x) {
            points.length = 0;
        }

        points.push({ x, y });

        while (points.length > 0 && x - points[0].x > trailLength) {
            points.shift();
        }

        clearFrame(width, height);
        drawTrail(x);
        drawPoint(x, y);

        frameId = requestAnimationFrame(drawFrame);
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const cssWidth = Math.max(1, rect.width || canvas.clientWidth || canvas.width);
        const cssHeight = Math.max(1, rect.height || canvas.clientHeight || canvas.height);

        if (cssWidth === lastCssWidth && cssHeight === lastCssHeight) {
            return;
        }

        lastCssWidth = cssWidth;
        lastCssHeight = cssHeight;

        canvas.width = Math.round(cssWidth * pixelRatio);
        canvas.height = Math.round(cssHeight * pixelRatio);

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function clearFrame(width, height) {
        ctx.clearRect(0, 0, width, height);
    }

    function drawTrail(currentX) {
        if (points.length < 2) {
            return;
        }

        ctx.save();
        ctx.lineWidth = lineThickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = lineBlur;

        for (let i = 1; i < points.length; i++) {
            const previous = points[i - 1];
            const next = points[i];

            if (Math.abs(next.x - previous.x) > wrapGap) {
                continue;
            }

            const distanceBehind = currentX - next.x;
            const t = Math.max(0, Math.min(1, 1 - distanceBehind / trailLength));
            const alpha = trailAlphaMin + (trailAlphaMax - trailAlphaMin) * t;
            const segmentOpacity = alpha * lineOpacity;

            ctx.strokeStyle = withOpacity(lineColor, segmentOpacity);
            ctx.shadowColor = withOpacity(lineColor, segmentOpacity);
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawPoint(x, y) {
        ctx.save();
        ctx.fillStyle = withOpacity(pointColor, pointOpacity);
        ctx.shadowColor = withOpacity(pointColor, pointOpacity);
        ctx.shadowBlur = pointBlur;

        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function getHeartbeatY(distance, height) {
        const phase = ((distance % beatWidth) + beatWidth) % beatWidth;
        const base = height * (1 - clamp01(linePositionFromBottom));
        const amp = height * amplitude;
        const p = phase / beatWidth;

        let v = 0;

        if (p < 0.08) {
            v = 0;
        } else if (p < 0.16) {
            v = -0.14 * pulse((p - 0.08) / 0.08);
        } else if (p < 0.22) {
            v = 0;
        } else if (p < 0.26) {
            v = 0.28 * ((p - 0.22) / 0.04);
        } else if (p < 0.30) {
            v = 0.28 - 1.45 * ((p - 0.26) / 0.04);
        } else if (p < 0.34) {
            v = -1.17 + 1.45 * ((p - 0.30) / 0.04);
        } else if (p < 0.48) {
            v = 0;
        } else if (p < 0.72) {
            v = -0.32 * pulse((p - 0.48) / 0.24);
        } else {
            v = 0;
        }

        return base + v * amp;
    }

    function pulse(t) {
        return Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
    }
}

function getLinkCenter(link) {
    const canvasRect = canvas.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    return {
        x: linkRect.left - canvasRect.left + linkRect.width / 2,
        y: linkRect.top - canvasRect.top + linkRect.height / 2
    };
}

function getHeartbeatBpm(element) {
    const bpm = Number.parseFloat(getComputedStyle(element).getPropertyValue('--heartbeat-bpm'));
    return Number.isFinite(bpm) && bpm > 0 ? bpm : 75;
}

function withOpacity(color, opacity) {
    const alpha = Math.max(0, Math.min(1, opacity));
    const hex = color.startsWith('#') ? color.slice(1) : null;

    if (!hex) {
        return color;
    }

    const normalizedHex = hex.length === 3
        ? hex.split('').map((char) => char + char).join('')
        : hex;

    if (normalizedHex.length !== 6) {
        return color;
    }

    const r = Number.parseInt(normalizedHex.slice(0, 2), 16);
    const g = Number.parseInt(normalizedHex.slice(2, 4), 16);
    const b = Number.parseInt(normalizedHex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
