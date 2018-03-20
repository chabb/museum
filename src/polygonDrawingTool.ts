import * as d3 from 'd3';
import {HTML_SVG_CONST} from './util';

export class PolygonDrawingTool {

    public svgNode: any;
    public points: any[] = [];
    private drawing: boolean = false;
    public onDrawingDoneCallback: (points: number[]) => void;

    public constructor(svgNode: any) {
        this.svgNode = d3.select(svgNode);
    }

    public mount() {
        let g: any, startPoint: any;

        let self = this;
        this.svgNode.on('mouseup.draw', function() {

            if (self.svgNode.select('g.drawPoly').empty()) {
                g = self.svgNode.append('g').attr(HTML_SVG_CONST.klass, 'drawPoly');
            }
            self.drawing = true;
            startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
            if (d3.event.target.hasAttribute('is-handle')) {
                self.endDrawing();
                return;
            }
            self.points.push(d3.mouse(this));
            g.select('polyline').remove();

            g.append('polyline').attr('points', self.points)
                .style('fill', 'none')
                .attr('stroke', '#000');

            for (let i = 0; i < self.points.length; i++) {
                g.append('circle')
                    .attr(HTML_SVG_CONST.cx, self.points[i][0])
                    .attr(HTML_SVG_CONST.cy, self.points[i][1])
                    .attr(HTML_SVG_CONST.r, 4)
                    .attr(HTML_SVG_CONST.fill, 'yellow')
                    .attr(HTML_SVG_CONST.stroke, '#000')
                    .attr('is-handle', 'true')
                    .style({cursor: 'pointer'});
            }
        });

        this.svgNode.on('mousemove.draw', function () {
            if (!self.drawing) return;
            let g = d3.select('g.drawPoly');
            g.select('line').remove();
            g.append('line')
                .attr(HTML_SVG_CONST.x1, startPoint[0])
                .attr(HTML_SVG_CONST.y1, startPoint[1])
                .attr(HTML_SVG_CONST.x2, d3.mouse(this)[0] + 2)
                .attr(HTML_SVG_CONST.y2, d3.mouse(this)[1])
                .attr(HTML_SVG_CONST.stroke, '#53DBF3')
                .attr(HTML_SVG_CONST.strokeWidth, 1);
        });
    }

// doneDrawing
    private endDrawing() {
        this.svgNode.select('g.drawPoly').remove();
        let flattenedPoints = Array.prototype.concat(...this.points);
        this.svgNode.on('mousemove.draw', null);
        this.svgNode.on('mouseup.draw', null);
        this.onDrawingDoneCallback(flattenedPoints);
        this.points = [];
    }

    public hide() {
        this.svgNode.select('g.drawPoly').remove();
        this.svgNode.on('mousemove.draw', null);
        this.svgNode.on('mouseup.draw', null);
    }
}