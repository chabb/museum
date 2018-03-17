import {Polygon} from './polygon';

import earcut from 'earcut';


class Triangle  {

    public points: number[] = [];
    public guarded: boolean = false;
    public belongingPolygon: TriangulatedPolygon;

    constructor(polygon: TriangulatedPolygon) {
        this.belongingPolygon = polygon;
    }

    public addVertexIndex(vertexIdx: number) {
        if (vertexIdx >= this.belongingPolygon.getNumberOfPoints()) {
            console.error('vertex not in polygon')
        } else if (this.points.length === 3) {
            console.error('triangle is already built')
        } else {
            this.points.push(vertexIdx);
        }
    }
    public includes(vertexId: number): boolean {
        return this.points.indexOf(vertexId) > -1;
    }
}


export class TriangulatedPolygon extends Polygon {

    private triangles: number[] = [];

    protected setOfTriangles: Set<Triangle>;
    protected vertixIdxToTriangles: Set<Triangle>[] = [];
    protected vertexIdxToOrderedTriangles: Array<Array<Triangle>> = [];
    protected numTriangles = 0;


    constructor(points: number[]) {
        super(points);
        this.triangulate();
    }

    private triangulate() {

        let triangles: number[] = earcut(this.points);
        let setOfTriangles = new Set();
        let triangle: Triangle;

        let vertexIdxToTriangles = triangles.reduce((acc: Set<Triangle>[],
            triangleVertex: number,
            vertexIndex: number) => {
            if (!acc[triangleVertex]) {
                acc[triangleVertex] = new Set();
            }
            if (vertexIndex % 3 === 0) {
                triangle = new Triangle(this);
            }
            // if we have a common vertex, put at front of array,
            // otherwise, put at end
            triangle.addVertexIndex(triangleVertex);
            acc[triangleVertex].add(triangle);
            setOfTriangles.add(triangle);
            return acc;
        }, []);

        let vertexIdxToOrderedTriangles:Array<Triangle>[] = [];

        vertexIdxToTriangles.forEach((triangles, idx) => {

            console.log('WILL CHECK', idx, triangles);
            // we need to change the order of triangle, so we always start
            // with a triangle that have a common segment, this will
            // ensure we always choose a triangle that is already 2-colored
            let commons: Triangle[] = [];
            let commonWithOlderVertix: Triangle[] = [];
            let remains: Triangle[] = [];
            // we want to process the triangle that has a common vertix with
            // the edge created by the preceding vertix
            let processedTriangle = 0;
            triangles.forEach((triangle) => {
                if ( triangle.includes(idx) && triangle.includes(idx -1)) {
                    commonWithOlderVertix.push(triangle);
                    commons = commons.concat(triangle);
                    console.log(triangle, idx, idx -1, commons);

                } else if (idx  == 0 && processedTriangle === 0) {
                    commonWithOlderVertix.push(triangle);
                    commons = commons.concat(triangle);
                }
                else {
                    remains.push(triangle);
                }
                processedTriangle++;
            });
            console.log('find ', commons);


            // we use recursion to sort the remaining triangles, as soon as we
            // a triangle that has a common edge, we remove it and put it on
            // our list of triangle to process
            let finalOrder: Triangle[] = [];
            function checkTriangle(triangles: Array<Triangle>, order: Array<Triangle>) {
                console.log('--', triangles, remains);
                if (triangles.length === 0) {
                    return;
                } else if (triangles.length === 1) {
                    order.push(triangles[0]);
                    return;
                }
                remains  = [];
                triangles.forEach(triangle => {
                    let hasVertixWithPastTriangle = commons.some(lastTriangle => {
                        let commonVertex = 0;
                        triangle.points.forEach(vertex => {
                            if (lastTriangle.includes(vertex)) {
                                commonVertex = commonVertex + 1;
                            }
                        });
                        return commonVertex > 1;
                    });

                    if (hasVertixWithPastTriangle) {
                        order.push(triangle);
                        console.log('find ', triangle);
                        commons = commons.concat(triangle);
                    } else {
                        remains.push(triangle);
                        //commons = commons.concat(triangle);
                    }
                });
                checkTriangle(remains, order);
            }
            checkTriangle(remains, finalOrder);
            let orderedTriangles = commonWithOlderVertix.concat(finalOrder);
            vertexIdxToOrderedTriangles[idx] = orderedTriangles;
        });
        this.triangles = triangles;
        this.numTriangles = triangles.length / 3;
        this.vertexIdxToOrderedTriangles = vertexIdxToOrderedTriangles;
        this.vertixIdxToTriangles = vertexIdxToTriangles;
        this.setOfTriangles = setOfTriangles;
    }
}

