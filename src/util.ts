/**
 *  Utility methods
 *
 *
 */


export function ready(fn: any) {
    if ((<any>document).attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

type Point = [number, number];

export function findTriangleCenter(triangle: [Point, Point, Point]): Point {
    let centerX = ((triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3);
    let centerY = ((triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3);
    return [centerX, centerY];
}


export function dividePoint(p1, p2, ratio) {
    let invRatio = 1 - ratio;
    return p1 * invRatio + p2 * ratio;
}

export function trianglePath(xy, cx, cy, radius, path) {
    let x = xy[0] - cx;
    let y = xy[1] - cy;
    let dist = Math.sqrt(x * x + y * y);

    // tan = opp / adj
    // The angle that the line [(0,0);(x,y)] forms with the x-axis in a Cartesian coordinate system
    // the trick is to make cx, cy the reference coordinate, and then rotate the flat arrow we draw
    let angle = Math.atan2(y, x) / Math.PI * 180;
    path.attr('d', 'M0,0 L' + [
        0, radius,
        dist - radius, radius / 4,
        dist - radius, radius,
        dist, 0,
        dist - radius, -radius,
        dist - radius, -radius / 4,
        0, -radius
    ] + 'z')
        .attr('transform', 'translate(' + [cx, cy] + ') rotate(' + angle + ')')
        .attr('fill', 'none')
        .attr('stroke', 'black')
}

export let HTML_SVG_CONST = {
    svg: 'svg',
    opacity: 'opacity',
    polygon: 'polygon',
    width: 'width',
    height: 'height',
    fill: 'fill',
    r: 'r',
    g: 'g',
    cx: 'cx',
    cy: 'cy',
    filter: 'filter',
    click: 'click',
    x1: 'x1',
    x2: 'x2',
    y1: 'y1',
    y2: 'y2',
    stroke: 'stroke',
    strokeWidth: 'stroke-width',
    klass: 'class'
}