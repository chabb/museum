import * as d3 from 'd3';
import {GuardedPolygon} from './guardedPolygon';
import {HTML_SVG_CONST} from './util';

export class PolygonsListComponent {

    public polygons: GuardedPolygon[];
    public mountNode: Element;
    public fillColor: string;
    public strokeColor: string;

    public onSelectedItemCallback: Function;

    private selectedPolygon: GuardedPolygon;
    private itemWidth: number = 100;
    private itemHeight: number = 60;

    constructor(fillColor: string, strokeColor:string) {
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
    }

    // just draw line and stuff
    public clear() {
        this.mountNode.innerHTML = '';
    }

    public render() {
        // we should put a render somewhere
        let scaleX = d3.scaleLinear().range([0, this.itemWidth]);
        let scaleY = d3.scaleLinear().range([0, this.itemHeight]);
        console.log('SHHEEE', this.mountNode);
        let svg = d3.select(this.mountNode)
            .selectAll(HTML_SVG_CONST.svg)
            .data(this.polygons)
            .enter()
            .append(HTML_SVG_CONST.svg)
            .attr(HTML_SVG_CONST.width, this.itemWidth)
            .attr(HTML_SVG_CONST.height, this.itemHeight)
            .append("polygon")
            .attr('points', (d: any, i: number) => {
                let _p = d.getPoints();
                let domainX = this.polygons[i].getMaxX();
                let domainY = this.polygons[i].getMaxY();
                scaleX.domain([0, domainX]);
                scaleY.domain([0, domainY]);
                let points = [];
                for (let j = 0; j < _p.length / 2; j++) {
                    points.push(scaleX(_p[j * 2]));
                    points.push(scaleY(_p[j * 2 + 1]));
                }
                return points;
            })
            .attr(HTML_SVG_CONST.stroke, this.strokeColor)
            .attr(HTML_SVG_CONST.fill, this.fillColor)
            .classed('polygon-overview', true)
            .on('click', (d:GuardedPolygon, i: number) => {
                this.selectedPolygon = d;
                this.onSelectedItemCallback(i);
            });
    }
    public hide() {
        d3.select(this.mountNode)
            .classed('hidden', true);
        d3.select('.toolbar-header')
            .classed('hidden', true);
    }
    public show() {
        d3.select(this.mountNode)
            .classed('hidden', false);
        d3.select('.toolbar-header')
            .classed('hidden', false);
    }
}
