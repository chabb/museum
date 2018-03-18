/**
 *
 *  App entry point
 *
 * @author Francois Chabbey
 *
 */

// lib imports
import * as d3 from 'd3'; // webstorm complains
// src imports

import {GuardedPolygon} from './guardedPolygon';
import {tutorialSteps} from './introSteps';
import {PolygonDrawingTool} from './polygonDrawingTool';
import {PolygonGuardTool} from './polyonGuardTool';
import {PolygonsListComponent} from './polygonList';
import {buggy, combShape, combShape3, combShape4, hell, shape2, shape3, square, triangle} from './polygons';
import {drawTriangle} from './tutoTriangle';
import {ready, HTML_SVG_CONST, findTriangleCenter, trianglePath} from './util';

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
        let padding = 50;
        let targetWidth = (w - padding * 2) / 2;
        let targetHeight = (targetWidth * ratio) / 2;
        // matrix transformation or changing the viewport
        // would be a better way, especially if we want to manage resizing
        let scaleX = d3.scaleLinear().domain([0, basePolygon.getMaxX()])
            .range([w / 2 - targetWidth, w / 2 + targetWidth]);
        let scaleY = d3.scaleLinear().domain([0,basePolygon.getMaxY()])
            .range([h / 2 - targetHeight, h / 2 + targetHeight]);
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
    tuto.skipCallback = () => {
        tuto._unMount();
        list.show();
        d3.select('.intro-navigation').classed('hidden', true);
    };
    tuto.mount('.next', '.previous', '.skip');

    tuto.start();
    list.hide();
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
    public skipCallback: Function;

    constructor() {

    }

    public mount(nextSelector, previousSelector, skipSelector) {
        d3.select(nextSelector).on('click', () => this.goToNextStep());
        d3.select(previousSelector).on('click', () => this.goToPreviousStep());
        d3.select(skipSelector).on('click', () => this.skipCallback());
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
            .style(HTML_SVG_CONST.opacity, 0.1).on('end', () => {
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
    // refactor
    let node: Element = document.getElementById('drawing-canvas');
    let basePolygon = list.polygons[0];
    let points = basePolygon.getPoints();
    let scaledPoint = [];
    let bbox = node.getBoundingClientRect();
    let w = bbox.width;
    let h = bbox.height;
    let ratio = h / w;
    let padding = 50;
    let targetWidth = (w - padding * 2) / 2;
    let targetHeight = (targetWidth * ratio) / 2;
    // matrix transformation or changing the viewport
    // would be a better way, especially if we want to manage resizing
    let scaleX = d3.scaleLinear().domain([0, basePolygon.getMaxX()])
        .range([w / 2 - targetWidth, w / 2 + targetWidth]);
    let scaleY = d3.scaleLinear().domain([0,basePolygon.getMaxY()])
        .range([h / 2 - targetHeight, h / 2 + targetHeight]);
    for (let i = 0; i < points.length / 2; i++) {
        scaledPoint.push(scaleX(points[i * 2]));
        scaledPoint.push(scaleY(points[i * 2 + 1]));
    }
    let polygon = new GuardedPolygon(scaledPoint);
    guardTool.polygon = polygon;
    guardTool.mount(document.getElementById('drawing-canvas'), true);
    d3.select('#drawing-canvas').append('circle')
        .attr('cx', scaledPoint[0])
        .attr('cy', scaledPoint[1])
        .attr('r', 10)
        .attr('fill', 'red')
        .attr('stroke', 'black')

    let center = findTriangleCenter([[scaledPoint[0], scaledPoint[1]]
        ,[scaledPoint[2], scaledPoint[3]],
        [scaledPoint[4], scaledPoint[5]]
    ]);
    let path =  d3.select('#drawing-canvas').append('path');
    trianglePath([center[0], center[1]], scaledPoint[0], scaledPoint[1], 10, path);
    center = findTriangleCenter([[scaledPoint[4], scaledPoint[5]]
        ,[scaledPoint[6], scaledPoint[7]],
        [scaledPoint[0], scaledPoint[1]]
    ]);
    path =  d3.select('#drawing-canvas').append('path');
    trianglePath([center[0], center[1]], scaledPoint[0], scaledPoint[1], 10, path);
    d3.select('#drawing-canvas').selectAll('polygon')
        .transition()
        .delay(300)
        .duration(800)
        .attr('fill', 'red')
};

let fifthStep = () => {
    // three-colored triangle
    // clean everything, redraw
};

let sixthStep = () => {

};

