/**
 *  Utility methods
 *
 *
 */


export function ready(fn: any) {
    if ((<any>document).attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

export let HTML_SVG_CONST = {
    svg: 'svg',
    width: 'width',
    height: 'height',
    fill: 'fill',
    r: 'r',
    g: 'g',
    cx: 'cx',
    cy: 'cy',
    filter: 'filter',
    click: 'click',
    x1: 'x1',
    x2: 'x2',
    y1: 'y1',
    y2: 'y2',
    stroke: 'stroke',
    strokeWidth: 'stroke-width',
    klass: 'class'
}