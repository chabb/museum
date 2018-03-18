/**
 *
 *  App entry point
 *
 *
 */

// lib imports
import * as d3 from 'd3'; // webstorm complains
// src imports

import {GuardedPolygon} from './guardedPolygon';
import {PolygonDrawingTool} from './polygonDrawingTool';
import {PolygonGuardTool} from './polyonGuardTool';
import {PolygonsListComponent} from './polygonList';
import {ready, HTML_SVG_CONST} from './util';
import {buggy, combShape, combShape3, combShape4, hell, shape2, shape3, square, triangle} from './polygons';
import {drawTriangle} from './tutoTriangle';



ready(main);

let guardTool: PolygonGuardTool, tool, list, tuto;

function main() {

    guardTool = new PolygonGuardTool();
    let node: Element = document.getElementById('drawing-canvas');
    tool = new  PolygonDrawingTool(node);

    let polygons =  [new GuardedPolygon(square),
        new GuardedPolygon(triangle),
        new GuardedPolygon(shape2),
        new GuardedPolygon(shape3),
        new GuardedPolygon(combShape),
        new GuardedPolygon(combShape3),
        new GuardedPolygon(combShape4),
        new GuardedPolygon(hell),
        new GuardedPolygon(buggy),
    ];
    console.log(document.getElementsByClassName('shapes-preview')[0]);
    list = new PolygonsListComponent(
        'red', 'black');
    list.mountNode = document.getElementsByClassName('shapes-preview')[0];
    list.polygons = polygons;
    list.render();
    list.onSelectedItemCallback = (itemNumber: number) => {
        let basePolygon = polygons[itemNumber];
        let points = basePolygon.getPoints();
        let scaledPoint = [];
        let bbox = node.getBoundingClientRect();
        let w = bbox.width;
        let h = bbox.height;
        let ratio = h / w;
        let targetWidth = 400;
        let targetHeight = targetWidth * ratio;
        // matrix transformation or changing the viewport
        // would be a better way, especially if we want to manage resizing
        let scaleX = d3.scaleLinear().domain([0, basePolygon.getMaxX()]).range([w / 2 - targetWidth, w / 2 + targetWidth]);
        let scaleY = d3.scaleLinear().domain([0,basePolygon.getMaxY()]).range([h / 2 - targetHeight, h / 2 + targetHeight]);
        for (let i = 0; i < points.length / 2; i++) {
            scaledPoint.push(scaleX(points[i * 2]));
            scaledPoint.push(scaleY(points[i * 2 + 1]));
        }
        let polygon = new GuardedPolygon(scaledPoint);
        switchToGuardMode(polygon);
    };

    tool.onDrawingDoneCallback = (points) => {
        let polygon = new GuardedPolygon(points);
        list.hide();
        switchToGuardMode(polygon);
    };
    //tool.mount();

    tuto = new Tutorial();
    tuto.stepsText = tutorialSteps;
    tuto.stepsCallback  = [ firstStep, secondStep, thirdStep, fourthStep, fifthStep, sixthStep];
    tuto.mount('.next', '.preview', '.skip');
    tuto.start();
}



function switchToGuardMode(polygon) {
    list.hide(); // bad naming => unmount
    tool.hide();
    d3.select('.actions-tools').classed('hidden', false);
    d3.select('.toolbar-header').html('Put guard or ask the architect to help you');


    guardTool.polygon = polygon;
    // make a class
    d3.select('.solve').on('click', function() {
        // move to
        let steps = polygon.solve();
        guardTool.solve(steps);
        guardTool.checkSolved();
    });
    d3.select('.try_another').on('click', function(){
       switchToMuseumMode();
    });

    guardTool.mount(document.getElementById('drawing-canvas'));
}

function switchToMuseumMode() {
    // unmount event
    list.show();
    tool.mount();
    d3.select('.solve').on('click', null);
    d3.select('.try-another').on('click', null);
    guardTool.unmount();
    d3.select('.actions-tools').classed('hidden', true);
    d3.select('.toolbar-header').html('SELECT A GORGONZOLA');
}

export class Tutorial {
    public stepsText: string[] = [];
    public stepsCallback: Function[] = [];

    public currentStep = 0;
    public _unMount: Function;


    constructor() {

    }

    public mount(nextSelector, previousSelector, skipSelector) {
        d3.select(nextSelector).on('click', () => this.goToNextStep());
        d3.select(previousSelector).on('click', () => this.goToPreviousStep());
        this._unMount = () => {
            d3.select(nextSelector).on('click', null);
            d3.select(previousSelector).on('click', null);
            d3.select(skipSelector).on('click', null);
            d3.select('#drawing-canvas').html('');
            d3.select('.intro-content').html('');
        }
    }

    public unmount() {
        this._unMount();
    }

    public start() {
        this.currentStep = 0;
        this.executeStep(this.currentStep);
    }

    public goToNextStep() {
        this.currentStep++;
        this.executeStep(this.currentStep);
    }

    public goToPreviousStep() {
        if (this.currentStep === 0) {
            return;
        }
        this.currentStep--;
        this.executeStep(this.currentStep);
    }

    private executeStep(step: number) {
        // do something nicer
        d3.select('.intro-content')
            .transition()
            .duration(500)
            .style(HTML_SVG_CONST.opacity, 0).on('end', () => {
                d3.select('.intro-content').html(
                    this.stepsText[step]
                ).transition()
                    .duration(500)
                    .style(HTML_SVG_CONST.opacity, 1);
        });

        // we introduced tight-coupling there
        d3.select('#drawing-canvas').html('');
        this.stepsCallback[step]();
    }
}

// this part is quite ad-hoc and sketchy, I rushed it a little
let firstStep = () => {
    // simple triangle
    let baseSelection = d3.select('#drawing-canvas');
    let triangles = [
        shape2.slice(0, 6),
    ];
    drawTriangle(triangles, baseSelection);
};

let secondStep = () => {
    // square
    let baseSelection = d3.select('#drawing-canvas');
    let triangles = [
        shape2.slice(0, 6),
        [square[0], square[1], square[6], square[7], square[4], square[5]]
    ];
    drawTriangle(triangles, baseSelection);
};

let thirdStep = () => {
    // any polygon
    let baseSelection = d3.select('#drawing-canvas');
    let triangles = [
        shape2.slice(0, 6),
        [shape2[0], shape2[1], shape2[10], shape2[11], shape2[8], shape2[9]],
        [shape2[4], shape2[5], shape2[6], shape2[7],shape2[8], shape2[9]]
    ];
    drawTriangle(triangles, baseSelection);
};

let fourthStep = () => {
    // square with guard on two triangle
};

let fifthStep = () => {
    // three-colored triangle
};

let sixthStep = () => {

};




// Ideally we should have string.ts file that exposes strings, this file would be generated when the user load
// the app, but this is out of the scope of this project

let tutorialSteps = [
    'How many guards do we need for guarding a museum ? This looks like a complex problem, but we can try to approach' +
    'the solution with some simple intuitions. Let\'s look at a triangle. We can see that we only need one guard. The ' +
    ' guard can see all points in the triangle',
    'Let\'s try the same the thing with a square; if we look at this square, we see that we can split it into two triangles. ' +
    'So we can say that we need at most two guards, one for each triangle. ',
    'And if we look at any arbitrary polygon, it seems that we can break it into multiple triangles. And actually this is a proven fact.' +
    ' So we have a first intuition that if a shape can be broken into n triangles, then we need at most n guards',
    ' Now if we go back to our square, we can see that if we place a guard at the right place, then two triangles will be guarded,' +
        'So we have an intuition that if we place a guard at one vertex, then it will guard all the triangles that use this vertex ' +
       'We can use this knowledge to have less guard',
    ' If we go back to our triangle, what we want is to have only one guard for it. We know the guard will be positioned on one' +
    ' vertex. We can assign a different color to each vertex, red for the guard, green and blue for he others',
    ' Now, if we have multiple triangles, we want to keep this coloring scheme, so we will minimize the number of guards',
    ' So the trick is to start with the first vertex, put one guard, then put the two other colors, and then colorize triangles' +
        ' that share the a common edge with the triangle we just colorize',
    ' Now think about it where do we put our colors ? On every vertices, so we have n vertices to color. That means that' +
    ' the addition of the red vertex, the blue vertex, the green vertex should equal the number of vertix. ' +
    ' Now our goal is to minimize the number of red vertex, so we can safely write r < g, r < b' +
        ' With that it mind, suppose that r/3 would be greather that n. Then g and b would be greather than n/3. But then' +
        ' r + g + b would be greater than n. So we can say that r is at most n/3, and so we have an upper bound of n/3 for' +
    ' the number of guards',
    ' Now you can try to colorize some museum to convince yourself'
];

