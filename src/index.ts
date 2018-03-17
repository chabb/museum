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
import {ready} from './util';
import {buggy, combShape, combShape3, combShape4, hell, shape2, shape3, square, triangle} from './polygons';

ready(main);

let guardTool: PolygonGuardTool, tool, list;

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
        // matrix transformation would be a better way
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
    tool.mount();
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


// Ideally we should have string.ts file that exposes strings, this file would be generated when the user load
// the app, but this is out of the scope of this project