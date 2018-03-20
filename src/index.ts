/**
 *
 *  App entry point
 *
 * @author Francois Chabbey
 *
 */

// lib imports
import * as d3 from 'd3';
// src imports
import {GuardedPolygon} from './guardedPolygon';
import {tutorialSteps} from './introSteps';
import {switchNavbarToMuseum} from './navbar';
import {PolygonDrawingTool} from './polygonDrawingTool';
import {PolygonGuardTool} from './polyonGuardTool';
import {PolygonsListComponent} from './polygonList';
import {buggy, combShape, combShape3, combShape4, hell, shape2, shape3, square, triangle} from './polygons';
import {Tutorial} from './tutorial';
import {drawTriangle} from './tutoTriangle';
import {ready, HTML_SVG_CONST, findTriangleCenter, trianglePath, getScaledPointsFromBounding} from './util';



ready(main);

let guardTool: PolygonGuardTool, tool, list, tuto;

function main() {

    guardTool = new PolygonGuardTool();
    let node: Element = document.getElementById('drawing-canvas');
    tool = new  PolygonDrawingTool(node);

    let polygons =  [
        new GuardedPolygon(square),
        new GuardedPolygon(square),
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

        if (itemNumber === 0) {
          tool.mount();
        } else {
            let basePolygon = polygons[itemNumber];
            let scaledPoint = getScaledPointsFromBounding(basePolygon,
                node.getBoundingClientRect(),
                25,
                25);
            let polygon = new GuardedPolygon(scaledPoint);
            guardTool.unmount();
            switchToGuardMode(polygon);
            guardTool.updateGuardSection();
        }

    };

    tool.onDrawingDoneCallback = (points) => {
        let polygon = new GuardedPolygon(points);
        list.hide();
        switchToGuardMode(polygon);
    };
    //tool.mount();

    tuto = new Tutorial();
    tuto.stepsText = tutorialSteps;
    tuto.stepsCallback  = [
        firstStep,
        secondStep,
        thirdStep,
        fourthStep,
        fifthStep,
        sixthStep,
        seventhStep,
        () => {}
    ];
    tuto.skipCallback = () => {
        tuto._unMount();
        d3.select('.intro-navigation').classed('hidden', true);
        switchToMuseumMode();
        switchNavbarToMuseum();
    };
    tuto.mount('.next', '.previous', '.skip');

    tuto.start();
    list.hide();
}



function switchToGuardMode(polygon) {
    //list.hide(); // bad naming => unmount
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

    let guardsNumber = Math.floor(guardTool.polygon.getPoints().length /  ( 2 * 3));
    d3.select('.intro-content').html(`Try to use at most ${guardsNumber} guards`);
    guardTool.mount(document.getElementById('drawing-canvas'));
}

function switchToMuseumMode() {
    // unmount event
    list.show();
    d3.select('.solve').on('click', null);
    d3.select('.try-another').on('click', null);
    guardTool.unmount();
    d3.select('.actions-tools').classed('hidden', true);
    d3.select('.toolbar-header').html('Pick a museum');
    d3.select('.intro-content').html('');
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
    let basePolygon = list.polygons[1];
    let scaledPoint = getScaledPointsFromBounding(basePolygon,
        node.getBoundingClientRect(),
        10,
        10);
    let polygon = new GuardedPolygon(scaledPoint);
    guardTool.polygon = polygon;
    guardTool.mount(document.getElementById('drawing-canvas'), true);
    d3.select('#drawing-canvas').append('circle')
        .attr(HTML_SVG_CONST.cx, scaledPoint[0])
        .attr(HTML_SVG_CONST.cy, scaledPoint[1])
        .attr(HTML_SVG_CONST.r, 10)
        .attr(HTML_SVG_CONST.fill, 'red')
        .attr(HTML_SVG_CONST.stroke, 'black');

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
        .attr(HTML_SVG_CONST, 'red')
};

let fifthStep = () => {
    guardTool.unmount();
    let node: Element = document.getElementById('drawing-canvas');
    let basePolygon = list.polygons[2];
    let scaledPoint = getScaledPointsFromBounding(basePolygon,
        node.getBoundingClientRect(),
        25,
        25);
    let polygon = new GuardedPolygon(scaledPoint);
    guardTool.polygon = polygon;
    guardTool.mount(document.getElementById('drawing-canvas'), true);
    let svg = d3.select('#drawing-canvas')
    svg.append('circle')
        .attr(HTML_SVG_CONST.cx, scaledPoint[0])
        .attr(HTML_SVG_CONST.cy, scaledPoint[1])
        .attr(HTML_SVG_CONST.r, 10)
        .attr(HTML_SVG_CONST.fill, 'red')
        .attr(HTML_SVG_CONST.stroke, 'black');
    svg.append('circle')
        .attr(HTML_SVG_CONST.cx, scaledPoint[2])
        .attr(HTML_SVG_CONST.cy, scaledPoint[3])
        .attr(HTML_SVG_CONST.r, 10)
        .attr(HTML_SVG_CONST.fill, 'green')
        .attr(HTML_SVG_CONST.fill, 'black');
    svg.append('circle')
        .attr(HTML_SVG_CONST.cx, scaledPoint[4])
        .attr(HTML_SVG_CONST.cy, scaledPoint[5])
        .attr(HTML_SVG_CONST.r, 10)
        .attr(HTML_SVG_CONST.fill, 'blue')
        .attr(HTML_SVG_CONST.stroke, 'black')
};

let sixthStep = () => {
    setTimeout(() => {
        let node: Element = document.getElementById('drawing-canvas');
        let basePolygon = list.polygons[0];
        let scaledPoint = getScaledPointsFromBounding(basePolygon,
            node.getBoundingClientRect(),
            25,
            25);
        let polygon = new GuardedPolygon(scaledPoint);
        guardTool.polygon = polygon;
        guardTool.mount(document.getElementById('drawing-canvas'), false);
        let steps = polygon.solve();
        guardTool.solve(steps);
    }, 400);
};

let seventhStep = () => {
    setTimeout(() => {
        let node: Element = document.getElementById('drawing-canvas');
        let basePolygon = list.polygons[2];
        let scaledPoint = getScaledPointsFromBounding(basePolygon,
            node.getBoundingClientRect(),
            25,
            25);
        let polygon = new GuardedPolygon(scaledPoint);
        guardTool.polygon = polygon;
        guardTool.mount(document.getElementById('drawing-canvas'), false);
        let steps = polygon.solve();
        guardTool.solve(steps);
    }, 400);
};


