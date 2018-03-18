import {dividePoint, findTriangleCenter, HTML_SVG_CONST, trianglePath} from './util';
import * as d3 from "d3";

export function drawTriangle(triangles: number[][], baseSelection: any) {
    let node = baseSelection.node();
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    triangles.forEach(triangle => {
        let points = [
            [triangle[0], triangle[1]],
            [triangle[2], triangle[3]],
            [triangle[4], triangle[5]]];

        points.forEach(point => {
            if (maxX < point[0]) {
                maxX = point[0];
            }
            if (maxY < point[1]) {
                maxY = point[1];
            }
        });
    });

    triangles.forEach(triangle => {
        let points:[[number, number], [number, number], [number, number]] = [
            [triangle[0], triangle[1]],
            [triangle[2], triangle[3]],
            [triangle[4], triangle[5]]];
        let center = findTriangleCenter(points);
        let scaledPoint = [];
        let bbox = node.getBoundingClientRect();
        let w = bbox.width;
        let h = bbox.height;
        let ratio = h / w;
        let padding = 50;
        let targetWidth = (w - (padding * 2)) / 2;
        let targetHeight = (targetWidth * ratio) / 2;
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
        let shortPoints = scaledPoint.map((scaledPoint, idx) => {
            let centerIndex = idx % 2 === 0 ? 0 : 1
            return dividePoint(center[centerIndex], scaledPoint, ratio);
        });
        let path = baseSelection.append('path');
        trianglePath([shortPoints[0], shortPoints[1]], center[0], center[1], 10, path);
        path = baseSelection.append('path');
        trianglePath([shortPoints[2], shortPoints[3]], center[0], center[1], 10, path);
        path = baseSelection.append('path');
        trianglePath([shortPoints[4], shortPoints[5]], center[0], center[1], 10, path);

        let halfPoints = [];
        for (let i = 0; i < scaledPoint.length / 2; i++) {
            let nextPoint = (i + 1) * 2 % 6;
            halfPoints.push(
                dividePoint(scaledPoint[i * 2], scaledPoint[nextPoint], 0.5),
                dividePoint(scaledPoint[i * 2 + 1], scaledPoint[nextPoint + 1], 0.5)
            );
        }
        halfPoints = halfPoints.map((halfPoint, idx) => {
            let centerIndex = idx % 2 === 0 ? 0 : 1;
            return dividePoint(center[centerIndex], halfPoint, ratio);
        });
        path = baseSelection.append('path');
        trianglePath([halfPoints[0], halfPoints[1]], center[0], center[1], 10, path);
        path = baseSelection.append('path');
        trianglePath([halfPoints[2], halfPoints[3]], center[0], center[1], 10, path);
        path = baseSelection.append('path');
        trianglePath([halfPoints[4], halfPoints[5]], center[0], center[1], 10, path);

        baseSelection.append('circle')
            .attr(HTML_SVG_CONST.cx, center[0])
            .attr(HTML_SVG_CONST.cy, center[1])
            .attr(HTML_SVG_CONST.r, 10)
            .attr(HTML_SVG_CONST.stroke, 'black')
            .style(HTML_SVG_CONST.fill, 'red');

        // we could add a mouse listener so the user can move the guard to prove that the guard can always look
        // in any direction in the triangle
    })
}
