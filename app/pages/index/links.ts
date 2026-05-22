type Cleanup = () => void;

type Point = {
    x: number;
    y: number;
};

const DEFAULT_BPM = 75;
const noop: Cleanup = () => {};

export function mountHeartbeatLinks(): Cleanup {
    const canvas = document.querySelector<HTMLCanvasElement>('#heartbeat');
    const parent = canvas?.parentElement;

    if (!canvas || !parent) {
        return noop;
    }

    let stopActiveBeat: Cleanup | null = null;
    let activeLink: HTMLAnchorElement | null = null;

    const controller = new AbortController();
    const links = parent.querySelectorAll<HTMLAnchorElement>('a');

    for (const link of links) {
        link.addEventListener('pointerenter', () => {
            stopActiveBeat?.();
            activeLink = link;
            stopActiveBeat = drawHeartbeat(canvas, parent, getLinkCenter(canvas, link));
        }, { signal: controller.signal });

        link.addEventListener('pointerleave', () => {
            if (activeLink !== link) {
                return;
            }

            stopActiveBeat?.();
            stopActiveBeat = null;
            activeLink = null;
        }, { signal: controller.signal });
    }

    return () => {
        controller.abort();
        stopActiveBeat?.();
        stopActiveBeat = null;
        activeLink = null;
    };
}

function drawHeartbeat(
    canvas: HTMLCanvasElement,
    parent: HTMLElement,
    origin: Point
): Cleanup {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return noop;
    }

    const context = ctx;

    const bpm = getHeartbeatBpm(parent);
    const beatWidth = 100;

    const pointColor = '#ff0000';
    const pointRadius = 2;
    const pointBlur = 2;
    const pointOpacity = 1;

    const lineColor = '#ff7700';
    const lineThickness = 1;
    const lineBlur = 1;
    const lineOpacity = 0.5;

    const linePositionFromBottom = 0.35;
    const amplitude = 0.6;

    const trailLength = 260;
    const trailAlphaMin = 0.18;
    const trailAlphaMax = 1;

    const wrapGap = 20;
    const pixelRatio = window.devicePixelRatio || 1;
    const pixelsPerSecond = beatWidth * bpm / 60;
    const startX = origin.x;

    const points: Point[] = [];

    let frameId = 0;
    const startTime = performance.now();
    let lastCssWidth = 0;
    let lastCssHeight = 0;
    let stopped = false;

    resize();
    drawPoint(startX, getHeartbeatY(0, canvas.height / pixelRatio));

    frameId = requestAnimationFrame(drawFrame);

    return () => {
        stopped = true;
        cancelAnimationFrame(frameId);
        context.clearRect(0, 0, lastCssWidth, lastCssHeight);
    };

    function drawFrame(time: number) {
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

        const lastPoint = points.at(-1);

        if (lastPoint && x < lastPoint.x) {
            points.length = 0;
        }

        points.push({ x, y });

        while (points[0] && x - points[0].x > trailLength) {
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

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function clearFrame(width: number, height: number) {
        context.clearRect(0, 0, width, height);
    }

    function drawTrail(currentX: number) {
        if (points.length < 2) {
            return;
        }

        context.save();
        context.lineWidth = lineThickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.shadowBlur = lineBlur;

        for (let i = 1; i < points.length; i++) {
            const previous = points[i - 1];
            const next = points[i];

            if (!previous || !next) {
                continue;
            }

            if (Math.abs(next.x - previous.x) > wrapGap) {
                continue;
            }

            const distanceBehind = currentX - next.x;
            const t = clamp01(1 - distanceBehind / trailLength);
            const alpha = trailAlphaMin + (trailAlphaMax - trailAlphaMin) * t;
            const segmentOpacity = alpha * lineOpacity;

            context.strokeStyle = withOpacity(lineColor, segmentOpacity);
            context.shadowColor = withOpacity(lineColor, segmentOpacity);
            context.beginPath();
            context.moveTo(previous.x, previous.y);
            context.lineTo(next.x, next.y);
            context.stroke();
        }

        context.restore();
    }

    function drawPoint(x: number, y: number) {
        context.save();
        context.fillStyle = withOpacity(pointColor, pointOpacity);
        context.shadowColor = withOpacity(pointColor, pointOpacity);
        context.shadowBlur = pointBlur;

        context.beginPath();
        context.arc(x, y, pointRadius, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }

    function getHeartbeatY(distance: number, height: number) {
        const phase = ((distance % beatWidth) + beatWidth) % beatWidth;
        const base = height * (1 - clamp01(linePositionFromBottom));
        const amp = height * amplitude;
        const progress = phase / beatWidth;

        let value = 0;

        if (progress < 0.08) {
            value = 0;
        } else if (progress < 0.16) {
            value = -0.14 * pulse((progress - 0.08) / 0.08);
        } else if (progress < 0.22) {
            value = 0;
        } else if (progress < 0.26) {
            value = 0.28 * ((progress - 0.22) / 0.04);
        } else if (progress < 0.30) {
            value = 0.28 - 1.45 * ((progress - 0.26) / 0.04);
        } else if (progress < 0.34) {
            value = -1.17 + 1.45 * ((progress - 0.30) / 0.04);
        } else if (progress < 0.48) {
            value = 0;
        } else if (progress < 0.72) {
            value = -0.32 * pulse((progress - 0.48) / 0.24);
        }

        return base + value * amp;
    }
}

function getLinkCenter(
    canvas: HTMLCanvasElement,
    link: HTMLAnchorElement
): Point {
    const canvasRect = canvas.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    return {
        x: linkRect.left - canvasRect.left + linkRect.width / 2,
        y: linkRect.top - canvasRect.top + linkRect.height / 2
    };
}

function getHeartbeatBpm(element: HTMLElement) {
    const bpm = Number.parseFloat(getComputedStyle(element).getPropertyValue('--heartbeat-bpm'));
    return Number.isFinite(bpm) && bpm > 0 ? bpm : DEFAULT_BPM;
}

function withOpacity(color: string, opacity: number) {
    const alpha = clamp01(opacity);
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

function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
}

function pulse(value: number) {
    return Math.sin(Math.PI * clamp01(value));
}
