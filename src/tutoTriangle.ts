import {dividePoint, findTriangleCenter, HTML_SVG_CONST, trianglePath} from './util';
import * as d3 from "d3";

export function drawTriangle(triangle: number[], baseSelection: any) {
    let node = baseSelection.node();
    let points:[[number, number], [number, number], [number, number]] = [
        [triangle[0], triangle[1]],
        [triangle[2], triangle[3]],
        [triangle[4], triangle[5]]];
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    points.forEach(point => {
        if (maxX < point[0]) {
            maxX = point[0];
        }
        if (maxY < point[1]) {
            maxY = point[1];
        }
    });
    let center = findTriangleCenter(points);
    let scaledPoint = [];
    let bbox = node.getBoundingClientRect();
    let w = bbox.width;
    let h = bbox.height;
    let ratio = h / w;
    let targetWidth = 400;
    let targetHeight = targetWidth * ratio;
// matrix transformation or changing the viewport
// would be a better way, especially if we want to manage resizing
    let scaleX = d3.scaleLinear().domain([0, maxX]).range([w / 2 - targetWidth, w / 2 + targetWidth]);
    let scaleY = d3.scaleLinear().domain([0, maxY]).range([h / 2 - targetHeight, h / 2 + targetHeight]);
    for (let i = 0; i < triangle.length / 2; i++) {
        scaledPoint.push(scaleX(triangle[i * 2]));
        scaledPoint.push(scaleY(triangle[i * 2 + 1]));
    }
    center = [scaleX(center[0]), scaleY(center[1])];
    baseSelection
        .selectAll('.triangles')
        .data([scaledPoint])
        .enter()
        .append(HTML_SVG_CONST.polygon)
        .attr('points', d => d)
        .attr(HTML_SVG_CONST.stroke, 'black')
        .style(HTML_SVG_CONST.fill, '#33FFFF');

    ratio = 0.8;
// the arrow can get out of the triangle, so we just take a part of the triangle
    scaledPoint = scaledPoint.map(scaledPoint => {
        let centerIndex = scaledPoint % 2 === 0 ? 0 : 1
        return dividePoint(center[centerIndex], scaledPoint, ratio);
    });
    let path = baseSelection.append('path');
    trianglePath([scaledPoint[0], scaledPoint[1]], center[0], center[1], 10, path);
    path = baseSelection.append('path');
    trianglePath([scaledPoint[2], scaledPoint[3]], center[0], center[1], 10, path);
    path = baseSelection.append('path');
    trianglePath([scaledPoint[4], scaledPoint[5]], center[0], center[1], 10, path);
    baseSelection.append('circle')
        .attr(HTML_SVG_CONST.cx, center[0])
        .attr(HTML_SVG_CONST.cy, center[1])
        .attr(HTML_SVG_CONST.r, 10)
        .attr(HTML_SVG_CONST.stroke, 'black')
        .style(HTML_SVG_CONST.fill, '#33FFFF');

    // we could add mouse listener so the user can move the guard to prove that the guard can always look
    // in any direction in the triangle
}
