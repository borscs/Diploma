
export function drawSegment(context, [mx, my], [tx, ty], color) {
    context.beginPath()
    context.moveTo(mx, my)
    context.lineTo(tx, ty)
    context.lineWidth = 5
    context.strokeStyle = color
    context.stroke()
}

export function drawPoint(context, x, y, r, color) {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}
