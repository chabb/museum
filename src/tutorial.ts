/**
 *
 * Modelize a tutorial with multiple steps
 * and callbacks that execute at each steps
 *
 *
 */


import {HTML_SVG_CONST} from './util';
import * as d3 from "d3";

export class Tutorial {
    public stepsText: string[] = [];
    public stepsCallback: Function[] = [];

    public currentStep = 0;
    public _unMount: Function;
    public skipCallback: Function;

    public mounted: boolean;

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
        };
        this.mounted = true;
    }

    public unmount() {
        this._unMount();
        this.mounted = false;
    }

    public start() {
        this.currentStep = 0;
        this.executeStep(this.currentStep);
    }

    public goToNextStep() {
        if (this.currentStep === this.stepsCallback.length - 1) {
            return;
        }
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

        d3.select('.nav-title').html(`Step ${this.currentStep + 1} of ${this.stepsText.length}`);
    }
}