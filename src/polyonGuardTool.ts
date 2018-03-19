import * as d3 from 'd3';
import cssEscape from 'css.escape';
import {GuardedPolygon} from './guardedPolygon';
import {HTML_SVG_CONST} from './util';

export class PolygonGuardTool {

    public polygon: GuardedPolygon;
    public vizGroup: any;
    public triangleGroup: any;
    public circleGroup: any;
    public guardGroup: any;

    private svg: any;

    constructor(polygon?: GuardedPolygon) {
        this.polygon = polygon;
    }

    public mount(baseNode: HTMLElement, bypassCircle = false) {
        let svg = d3.select(baseNode).append(HTML_SVG_CONST.svg)
            .attr(HTML_SVG_CONST.height, 1000)
            .attr(HTML_SVG_CONST.width, 2000);
        this.vizGroup = svg.append(HTML_SVG_CONST.g);
        this.triangleGroup = svg.append(HTML_SVG_CONST.g).attr(HTML_SVG_CONST.klass, 'triangles');
        this.circleGroup = svg.append(HTML_SVG_CONST.g).attr(HTML_SVG_CONST.klass, 'polygon_circles');
        // we should have decoupled this part as it's outside the intended DOM node

        this.guardGroup = d3.select('.actions-tools .guards');

        this.svg = svg;
        this.drawPolygon();
        if (!bypassCircle) {
            this.drawCircles();
        }
        this.drawTriangles();
    }

    public unmount() {
        this.svg && this.svg.remove();
        this.svg = null;
    }

    public solve(flattenedSteps: any[]) {
        let self = this;
        if (flattenedSteps.length > 0) {
            getTransition(0, null);
        }

        function getTransitionForStep(_step, currentTransition) {
            let circle = self.circleGroup.select(`#circle-${_step.vertexIndex}`);
            currentTransition = circle.transition()
                .duration(500)
                .attr(HTML_SVG_CONST.r, 20)
                .transition()
                .duration(400)
                .attr(HTML_SVG_CONST.r, 10);
            circle.transition("color")
                .duration(900)
                .attr(HTML_SVG_CONST.fill,  _step.color);
            if (_step.color === 'red') {
                let triangles = (<any>self.polygon).vertexIdxToOrderedTriangles[_step.vertexIndex];
                triangles.forEach(triangle => {
                    let shape: number[] = triangle.belongingPolygon.getPoints();
                    let d = triangle.points.reduce((acc, vertexIdx) => {
                        acc.push(shape[vertexIdx * 2], shape[vertexIdx * 2 + 1]);
                        return acc;
                    }, []);
                    let selector = cssEscape(`triangle-${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}${d[5]}`);
                    self.triangleGroup.select(`#${selector}`)
                        .transition()
                        .delay(100)
                        .duration(800)
                        .attr(HTML_SVG_CONST.fill, '#FF0000')
                        .attr(HTML_SVG_CONST.fillOpacity, 0.1);
                });
            }
            return currentTransition;
        }

        function getTransition(step, currentTransition) {
            if (step >= flattenedSteps.length - 1) {
                return;
            }
            let _step = flattenedSteps[step];
            console.log('color', _step.color);
            if (!currentTransition) {
                currentTransition = getTransitionForStep(_step, currentTransition);
            }
            currentTransition.on('end', function() {
                step = step + 1;
                _step = flattenedSteps[step];
                let nextTransition = getTransitionForStep(_step, currentTransition);
                getTransition(step, nextTransition)
            })
        }
    }

    public checkSolved() {
        let selection = d3.select('.complete');
        if (this.polygon.isSolved()) {
            // do some amazing tstuff
            selection.html(`Got it, you used ${this.polygon.getNumberOfGuards()} guards`);
        } else {
            selection.html('NOT SOLVED !');
        }
    }

    public updateGuardSection() {
        let guards = [];
        for (let i = 0; i < this.polygon.getNumberOfPoints() / 2; i++) {
            if (this.polygon.isVertixGuarded(i)) {
                guards[i] = 1;
            } else {
                guards[i] = 0;
            }
        }
        let guardSelection = this.guardGroup
            .selectAll('.guard')
            .data(guards);
        let enterSelection = guardSelection.enter()
            .append('div')
            .classed('guard', true)
            .on('click', (d, i) => {
                if (d === 0) {
                    return;
                }
                let node = this.circleGroup.select(`circle#circle-${i}`);
                this.circleClick(null, d, node._groups[0][0])
            });
        guardSelection
            .merge(enterSelection)
            .classed('active', (d) => { return d === 1;})
            .classed('passive', (d) => { return d === 0;});

        guardSelection.exit()
            .remove();
    }

    private updeGuardOnNode(node, vertexIndex) {
        // not very efficient, we can have addGuard return a boolean and pass it
        console.log('UPDATE GUARD', vertexIndex);
        let guarded = this.polygon.guardPosition.has(vertexIndex);
        d3.select(node)
            .transition()
            .duration(200)
            .attr('r', 20)
            .transition('fillguard')
            .attr('fill', guarded ? 'red' : 'blue')
            .duration(100)
            .attr('r', 5);
    }

    private drawCircles() {
        let points = this.polygon.getPoints();
        let p = [];

        for (let i = 0; i < points.length / 2; i++) {
            p.push([points[i * 2], points[i * 2 + 1]]);
        }
        console.log('--- new circle', p);

        let circles = this.circleGroup.selectAll('.circles')
            .data(p);

        let self = this;
        let enterSelection = circles.enter()
            .append('circle')
            .attr(HTML_SVG_CONST.r, 4)
            .attr(HTML_SVG_CONST.fill, 'blue')
            .attr(HTML_SVG_CONST.stroke, '#000')
            .attr('is-handle', 'true')
            .attr('class', 'circles')
            .attr('id', (d, i) => `circle-${i}`)
            .style('cursor', 'pointer')
            .on('click', function(d,i) {
                self.circleClick(d, i, this)
            })
            .on('mouseenter', function(d){
                console.log('-------sadsdsad');
                d3.select(this).transition()
                    .duration(100)
                    .attr('r', 10);
            })
            .on('mouseout', function(d){
                d3.select(this).transition('overmouseout')
                    .duration(80)
                    .attr('r', 4);
            });


        circles.merge(enterSelection)
            .attr(HTML_SVG_CONST.cx, d => d[0])
            .attr(HTML_SVG_CONST.cy, d => d[1]);

        circles.exit().remove();
    }

    private drawPolygon() {
        //svg.select('g.drawPoly').remove();
        let points = this.polygon.getPoints();
        this.vizGroup.select('polygon').remove();
        this.vizGroup.append('polygon')
            .attr('points', points)
            .attr(HTML_SVG_CONST.stroke, 'black')
            .style(HTML_SVG_CONST.fill, 'none');

    }


    private circleClick(coordinates, vertexIndex, node) {
        this.polygon.addGuard(vertexIndex);
        this.updeGuardOnNode(node, vertexIndex);
        this.drawTriangles();
        this.updateGuardSection()
        this.checkSolved();
    }

    // this is a bit ugly, as we do not reuse the API defined in the tool
    private drawTriangles() {
        // we can drop vertex that are part of the polygons
        let triangles = [];

        let striangles = (<any>this.polygon).setOfTriangles;
        // let's put that eagerly
        striangles.forEach(triangle => {
            let points = triangle.points.reduce((acc, vertexIdx) => {
                // it's nice when thing plug in naturally together :)
                acc.push(triangle.belongingPolygon.getPoints()[vertexIdx * 2],
                    triangle.belongingPolygon.getPoints()[vertexIdx * 2 + 1]);
                return acc;
            }, []);
            triangles.push(points);
            points.guarded = triangle.guarded; // a bit ugly
        });

        console.log('NEW TRIANGLE', triangles);

        let selection = this.triangleGroup.selectAll('.draw-triangles')
            .data(triangles);

        let selectionEnter = selection
            .enter()
            .append('polygon')
            .attr('id', (d, i) => `triangle-${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}${d[5]}`)
            .attr('class', 'draw-triangles');

        selection.merge(selectionEnter)
            .attr('points', d => d)
            .attr(HTML_SVG_CONST.stroke, 'black')
            .attr(HTML_SVG_CONST.fill, d => d.guarded ? 'red' : 'green')
            .attr(HTML_SVG_CONST.fillOpacity, 0.1);

        selection.exit().remove();
    }
}
