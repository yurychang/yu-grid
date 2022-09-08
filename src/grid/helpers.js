export function getItemContentSize(cols, containerSize, gap) {
    return containerSize - gap * (cols - 1);
}

export function parseAxis(axis) {
    return [
        axis[0], // startLine
        axis[1] - axis[0], // span
    ];
}

export function getAxisSize(span, width, gap) {
    return span * width + (span - 1) * gap;
}

export function getAxisOffset(start, width, gap) {
    return start * width + start * gap;
}

export function getPlacementOnAxis(axis, colWidth, gap) {
    const [start, span] = parseAxis(axis);
    return [
        getAxisOffset(start, colWidth, gap),
        getAxisSize(span, colWidth, gap),
    ];
}
