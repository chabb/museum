import {TriangulatedPolygon} from './triangulatedPolygon';

enum VertexColor {
    Red = 'red',
    Green = 'green',
    Blue = 'blue'
}

export class GuardedPolygon extends TriangulatedPolygon {

    public verticesColor:VertexColor[];
    public guardPosition: Set<number> = new Set();
    public guardedTriangle: number;
    public guardColor = VertexColor.Red;

    public constructor(points: number[]) {
        super(points);
        this.verticesColor = new Array(points.length / 2);
    }

    public isVertixGuarded(vertexIndex: number) {
        return this.verticesColor[vertexIndex] === this.guardColor;
    }

    // we dont support getting back to a predfined color
    public addGuard(vertexIndex: number) {
        if (this.isVertixGuarded(vertexIndex)) {
            this.verticesColor[vertexIndex] = undefined;
            this.guardPosition.delete(vertexIndex);
        } else {
            this.verticesColor[vertexIndex] = this.guardColor;
            this.guardPosition.add(vertexIndex);
        }
        this.updateGuardedTriangle();
    }

    public getNumberOfGuards(): number {
        return this.guardPosition.size;
    }

    public isSolved(): boolean {
        return this.guardedTriangle >= this.numTriangles;
    }

    // give back all the steps
    public solve(): any[] {
        let steps: any[] = [];
        for (let i = 0; i < this.verticesColor.length; i++ ) {
            this.colorizeVertex(i, steps);
        }
        let flattenedSteps = [];
        // flatten steps
        for (let i = 0; i < steps.length; i++) {
            let innerSteps = steps[i];
            for (let j = 0; j < innerSteps.length; j++) {
                let step = innerSteps[j];
                flattenedSteps.push(step);
            }
        }
        return flattenedSteps;
    }

    private updateGuardedTriangle() {
        this.guardedTriangle = 0;
        this.setOfTriangles.forEach(t => t.guarded = false);
        this.guardPosition.forEach(guardVertexIndex => {
            this.vertixIdxToTriangles[guardVertexIndex].forEach(triangle => {
                if (!triangle.guarded) {
                    triangle.guarded = true;
                    this.guardedTriangle++;
                }
            });
        });
    }

// This reminds me some old graph theory,
// so there might be another way to do it right
// there, we will brute-force to any vertex

// for anim, we should record 'steps', and go thru them
    private colorizeVertex(vertexIndex: number, steps: any[]) {
        if (this.verticesColor[vertexIndex]) {
            console.warn('Tried to colorize', this.verticesColor, ' at index', vertexIndex);
        }

        // color all triangles, i think we can bail out if triangle has already been colored
        this.vertexIdxToOrderedTriangles[vertexIndex].forEach((triangle, idx) =>{

            if (!triangle.guarded) {
                triangle.guarded = true;
                this.guardedTriangle++;
            } else {
                console.log('already done..');
                return;
            }
            let usedColor:{[idx: string]: number} = {};
            usedColor[VertexColor.Red] = 0;
            usedColor[VertexColor.Green] = 0;
            usedColor[VertexColor.Blue] = 0;

            let vertexToColorize: any[] = [];
            //console.log('coloring', triangle, vertexIndex, '--', idx);
            //console.log(vertex[triangle[0]], vertex[triangle[1]], vertex[triangle[2]]);

            triangle.points.forEach(vertexIndex => {
                if (!this.verticesColor[vertexIndex]) {
                    vertexToColorize.push(vertexIndex)
                } else {
                    console.log('find a color', this.verticesColor[vertexIndex], vertexIndex);
                    usedColor[this.verticesColor[vertexIndex]] = 1;
                }
            });
            let colorToUse = Object.keys(usedColor).reduce((acc, color) => {
                if (usedColor[color] === 0) {
                    acc.push(color);
                }
                return acc;
            }, []);
            let step: any[] = [];
            console.log('will use', colorToUse, 'to', vertexToColorize);
            vertexToColorize.forEach((vertexIdx, arrayIdx) => {
                this.verticesColor[vertexIdx] = colorToUse[arrayIdx];
                step.push({
                    vertexIndex: vertexIdx,
                    color: colorToUse[arrayIdx],
                    triangle: triangle
                })
            });
            console.log('STEP', step);
            if (step.length > 0) {
                steps.push(step);
            }
        })
    }
}