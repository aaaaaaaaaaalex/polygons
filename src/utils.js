function pointsToStr(points) {
    return points.map(p => `${p.x},${p.y}`).join(' ');
}

export function randPolygons(count = 5) {
    const list = [];
    for (let i = 0; i < count; i++) {
        const vx = 3 + Math.floor(Math.random() * 6);
        const cx = 100 + Math.random() * 800;
        const cy = 40 + Math.random() * 320;
        const r = 20 + Math.random() * 60;
        const points = [];
        for (let j = 0; j < vx; j++) {
            const ang = (j / vx) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const rad = r * (0.6 + Math.random() * 0.8);
            points.push({ x: Math.floor(cx + Math.cos(ang) * rad), y: Math.floor(cy + Math.sin(ang) * rad) });
        }
        const poly = {
            id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            points,
            pointsStr: pointsToStr(points),
            fill: '#940025',
            stroke: '#FFF'
        };
        list.push(poly);
    }
    return list;
}

export function isInZone(e, rect) {
    return e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
}
