import * as d3 from "d3";

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
        .attr('fill', 'white')
        .attr('stroke', 'black')
}

export let HTML_SVG_CONST = {
    svg: 'svg',
    fillOpacity: 'fill-opacity',
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
};

export function getScaledPointsFromBounding(polygon, bbox, verticalPadding, horizontalPadding) {
    let scaledPoint = [];
    let points = polygon.getPoints();
    let w = bbox.width;
    let h = bbox.height;
    let targetWidth = (w - horizontalPadding * 2) / 2;
    let targetHeight = (h - verticalPadding * 2) / 2;
    // matrix transformation or changing the viewport
    // would be a better way, especially if we want to manage resizing
    let scaleX = d3.scaleLinear().domain([0, polygon.getMaxX()])
        .range([w / 2 - targetWidth, w / 2 + targetWidth]);
    let scaleY = d3.scaleLinear().domain([0, polygon.getMaxY()])
        .range([h / 2 - targetHeight, h / 2 + targetHeight]);
    for (let i = 0; i < points.length / 2; i++) {
        scaledPoint.push(scaleX(points[i * 2]));
        scaledPoint.push(scaleY(points[i * 2 + 1]));
    }
    return scaledPoint;
}