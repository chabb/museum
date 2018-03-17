export class Polygon {

    protected points: number[];
    private numberOfPoints: number;
    private maxX: number = Number.NEGATIVE_INFINITY;
    private maxY: number = Number.NEGATIVE_INFINITY;

    public constructor(points: number[]){
        this.points = points;
        this.numberOfPoints = points.length;

        for (let i = 0;i < points.length / 2; i++){
            if(points[i * 2]  > this.maxX ) {
                this.maxX = points[i * 2];
            }
            if(points[i * 2 + 1] > this.maxY) {
                this.maxY = points[i * 2 + 1];
            }
        }
    }

    public getNumberOfPoints(): number {
        return this.numberOfPoints;
    }

    public getMaxX(): number {
        return this.maxX;
    }

    public getMaxY(): number {
        return this.maxY;
    }

    public getPoints(): number[] {
        return this.points;
    }

}
