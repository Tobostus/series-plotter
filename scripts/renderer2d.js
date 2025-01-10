// This program visualizes mathematical series in a browser.
// Copyright (C) 2024-2025  Tobias Straube

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { addAndSetVariables, getImportedVariables } from "./file_io.js";
import Point2D from "./classes/Point2D.js";
import Line2D from "./classes/Line2D.js";
import Label from "./classes/Label.js";
import CoordinateSystem from "./classes/CoordinateSystem.js";
import { isVariableOfType,
    updateNRange, getCurrentMinN, getCurrentMaxN, getMouseDown, isTouchDown,
    getInputSeriesColorsHex, getInputSeriesIsVisible, canvasWidth, canvasHeight, getSeriesType,
    getVisualizationType as getVisualizationTypeFromUI,
    setCurrentNTo, getXResolution } from "./uiupdater.js";
import { getNumericValue } from "./parser.js";

const canvas2D = document.getElementById('canvas2D');
const canvasContext = canvas2D.getContext('2d');

canvasContext.font = getComputedStyle(document.documentElement).getPropertyValue('font');
canvasContext.textBaseline = "top";
canvasContext.textAlign = "end";
canvasContext.textAlign = "end";

// every other value is already implicitly provided through the UI
const listOfNumbersToSave = ["frame", "bottomLeftPoint.y", "visibleHeight"];

let amountOfFrames = 100;
let startingFrame = 0;
let transitionDuration = 180;
let stillStandingDuration = 60;

let animated = false;
let updateOnChange = true;
let visibleWidth = 50;
let visibleHeight = 50;
let setsOfPoints = [];
let points = [];
let lines = [];
let frame = -1;
let animationStep = 0;
let waitingStep = 0;

let spatialConnectionLines = true;
let downScaling = true;
let interpolation = true;
let enableCoordinateSystem = true;

let nStepSize = 1;
let lastRenderedFrame = 0;

let currentNApproximation = 0;
let currentNApproximationIsWhole = true;

let oldDistance = 0;

// initialize these by calling initialize()
let bottomLeftPoint = null;
let coordinateSystem = null;
let oldMousePosition = null;

let scales = [];
for(let i = 0; i < 5; i++) {
    const magnitude = Math.pow(10, i);
    for(let j of [1, 2, 3, 5]) {
        scales.push(j * magnitude);
        if(scales[scales.length - 1] === 10000) {
            scales.push(15000);
        }
        if(scales[scales.length - 1] === 30000) {
            scales.push(40000);
        }
    }
}

export function handleMouseMoveEvent(event) {
    if(!getMouseDown() || animated) {
        return;
    }

    scrollCoordinateSystem(new Point2D(event.clientX, event.clientY));
}

export function handleTouchMoveEvent(event) {
    if(!isTouchDown() || animated) {
        return;
    }
    event.preventDefault();
    document.getElementById("canvas-wrapper").classList.add('active');
    
    if(event.touches.length === 1) {

        scrollCoordinateSystem(new Point2D(event.changedTouches[0].clientX, event.changedTouches[0].clientY));

    } else if(event.touches.length === 2) {
        const finger1 = new Point2D(event.touches[0].clientX, event.touches[0].clientY);
        const finger2 = new Point2D(event.touches[1].clientX, event.touches[1].clientY);

        const bounds = document.getElementById("canvas-wrapper").getBoundingClientRect();

        const averagePosition = finger1.weightedAverageWith(finger2, 0.5)
            .translate(null, -bounds.left, - canvasHeight - bounds.top);

        if(oldDistance === 0) {
            setOldDistance(finger1.distanceTo(finger2));
            return;
        }
        
        scrollCoordinateSystem(averagePosition);

        let newDistance = finger1.distanceTo(finger2);

        const factor = oldDistance / newDistance;
        let factorX = factor;
        let factorY = factor;

        switch(getOrientation(finger1, finger2)) {
            case "horizontal":
                factorY = 1;
            break;
            case "vertical":
                factorX = 1;
            break;
        }

        scaleCoordinateSystem(averagePosition, factorX, factorY);

        setOldDistance(newDistance);
    }
}

export function handleWheelEvent(event) {
    if(animated) {
        return;
    }

    event.preventDefault();

    const bounds = document.getElementById("canvas-wrapper").getBoundingClientRect();

    const factor = Math.pow(1.05, Math.sign(event.deltaY)*2);
    const center = new Point2D(event.clientX - bounds.left, event.clientY - bounds.top - canvasHeight);

    let factorX = factor;
    let factorY = factor;
    if(event.ctrlKey) {
        factorX = 1;
    }
    if(event.shiftKey) {
        factorY = 1;
    }
    scaleCoordinateSystem(center, factorX, factorY);
}

/**
 * Initializes some variables that could not be initialized at load.
 */
export function initialize() {
    bottomLeftPoint = new Point2D(-10, -10);
    coordinateSystem = new CoordinateSystem(5, 5, true);
    oldMousePosition = new Point2D(0, 0);
}

/**
 * Passes all variables that need to be saved on to file_io.js.
 */
export function prepareXMLExport() {
    for(let variable of listOfNumbersToSave) {
        addAndSetVariables([variable, eval(variable)]);
    }
}

/**
 * Checks if the imported values are of the correct type for all variables
 * that are used in this module.
 * @returns _0_ if there is no problem, _-1_ if a type doesn't match.
 */
function checkTypesOfImportedVariables(variables) {
    for(let num of listOfNumbersToSave) {
        if(!isVariableOfType(variables[num], "number")) {
            return -1;
        }
    }
    return 0;
}

/**
 * Gets the data loaded from XML from file_io.js and applies it.
 */
export function applySettingsFromXML(rendering) {

    const variables = getImportedVariables();

    // check if at least the types are correct
    if(checkTypesOfImportedVariables(variables) === -1) {
        console.error("Da hat wohl jemand an der exportierten Datei rumgespielt.");
        return;
    }

    if(startingFrame <= variables["frame"] && variables["frame"] < startingFrame + amountOfFrames) {
        frame = variables["frame"];
    } else {
        frame = startingFrame;
    }

    // visibleWidth has already been set by the values in uiupdater, thus we want to keep it how it is
    recenterCoordinateSystem(bottomLeftPoint.x, variables["bottomLeftPoint.y"], visibleWidth, variables["visibleHeight"], rendering);
}

/**
 * Resets the animation cycle so that it doesn't resume in the middle of interpolated frames.
 */
function resetAnimationCycle() {
    animationStep = 0;
    waitingStep = 0;
}

/**
 * Sets the current **frame** used for calculation of the animation, usually meaning **frame** = **n**;
 * @param {number} newFrame - The new value of frame.
 * @param {boolean} sliderUpdate - If this method is called from an update to the slider, set **sliderUpdate** to _true_.
 * @param {boolean} recalculate - If the current frames should be recalculated.
 * Otherwise, there would be a one-off-error when called from elsewhere.
 */
export function setFrame(newFrame, sliderUpdate = false, recalculate = true) {
    frame = newFrame;
    if(getVisualizationType() === "temporal") {
        if(recalculate) {
            recalculateCurrentFrames(sliderUpdate);
        }
        resetAnimationCycle();
    }
}

/**
 * Draws a Point2D with a certain radius on the canvas.
 * @param {Point2D} point - The Point2D to be drawn.
 * @param {number} radius - How large it will be displayed (in CSS pixels), default is _4_.
 */
function drawPoint2D(point, radius = 4) {
    if(point === null) {
        return;
    }
    const viewportPoint = point.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight);
    if(!viewportPoint.isVisible(canvasWidth, canvasHeight)) {
        return;
    }
    canvasContext.beginPath();
    canvasContext.arc(viewportPoint.x, viewportPoint.y, radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = viewportPoint.color;
    canvasContext.fill();
}

/**
 * Draws a Line2D with a certain radius on the canvas.
 * @param {Line2D} line - The Line2D to be drawn.
 * @param {number} thickness - How thick the line will be (in CSS pixels), default is _2_.
 */
function drawLine2D(line, thickness = 2) {
    if(line === null) {
        return;
    }

    const viewportLine = line.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight);
    const viewportStartPoint = viewportLine.startPoint;
    const viewportEndPoint = viewportLine.endPoint;

    if(!viewportLine.isVisible(canvasWidth, canvasHeight)) {
        return;
    }

    /*
    *   maybe we'll have to remove the gradient or make it optional or make colors depend on the
    *   point array / drawPoints method if this is too computationally intensive
    */
    if(!(viewportStartPoint.color === viewportEndPoint.color)) {
        const gradient = canvasContext.createLinearGradient(viewportStartPoint.x, viewportStartPoint.y, 
            viewportEndPoint.x, viewportEndPoint.y);
        gradient.addColorStop(0, viewportStartPoint.color);
        gradient.addColorStop(1, viewportEndPoint.color);
        canvasContext.strokeStyle = gradient;
    } else {
        canvasContext.strokeStyle = viewportStartPoint.color;
    }

    canvasContext.lineWidth = thickness;
    canvasContext.beginPath();
    canvasContext.moveTo(viewportStartPoint.x, viewportStartPoint.y);
    canvasContext.lineTo(viewportEndPoint.x, viewportEndPoint.y);
    canvasContext.stroke();
}

/**
 * Draws all Point2Ds in an array of Point2Ds.
 * @param {Point2D[]} points - An array of Point2Ds to be drawn.
 */
function drawPoints2D(points = []) {
    for(let point of points) {
        drawPoint2D(point);
    }
}

/**
 * Draws all Line2Ds in an array of Line2Ds.
 * @param {Line2D[]} lines - An array of Line2Ds to be drawn.
 */
function drawLines2D(lines = []) {
    for(let line of lines) {
        drawLine2D(line);
    }
}

/**
 * Draws all Point2Ds in any array in this array of Point2Ds.
 * @param {Point2D[][]} setsOfPoints - An array of arrays of Point2Ds to be drawn.
 */
function drawSetsOfPoints2D(setsOfPoints = []) {
    for(let points of setsOfPoints) {
        drawPoints2D(points);
    }
}

/**
 * Draws a Label on the canvas.
 * @param {Label} label - The label to be drawn.
 */
function drawLabel(label) {
    if(label === null) {
        return;
    }
    const viewPortLabel = label.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight);
    if(!viewPortLabel.anchor.isVisible(canvasWidth, canvasHeight)) {
        return;
    }
    canvasContext.fillStyle = viewPortLabel.anchor.color;
    canvasContext.textAlign = viewPortLabel.alignment;
    canvasContext.textBaseline = viewPortLabel.baseline;

    if(viewPortLabel.rotation === 0) {
        canvasContext.fillText(viewPortLabel.content,
            viewPortLabel.anchor.x + viewPortLabel.offsetX, viewPortLabel.anchor.y + viewPortLabel.offsetY);
    } else {
        canvasContext.save();
        canvasContext.translate(viewPortLabel.anchor.x, viewPortLabel.anchor.y);
        canvasContext.rotate(viewPortLabel.rotation);
        canvasContext.fillText(viewPortLabel.content,
            viewPortLabel.offsetY + 2, viewPortLabel.offsetX + 5);
        canvasContext.restore();
    }
}

/**
 * Draws all Labels in the array of Labels.
 * @param {Label[]} labels - An array of Labels to be drawn.
 */
function drawLabels(labels = []) {
    for(let label of labels) {
        drawLabel(label);
    }
}

/**
 * Clears the entire canvas.
 */
function clearCanvas2D() {
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
}

/**
 * Updates the UI with the new values for n.
 */
function updateNRangeInUI() {
    updateNRange(bottomLeftPoint.x, bottomLeftPoint.x + visibleWidth);
}

/**
 * Recenters the coordinate system to standard values.
 * @param {number} bottomLeftX - New x value of bottomLeftPoint.
 * @param {number} bottomLeftY - New y value of bottomLeftPoint.
 * @param {number} width - New visible width of the coordinate system.
 * @param {number} height - New visible height of the coordinate system.
 * @param {boolean} rendering - Wether we are already (re)rendering.
 */
export function recenterCoordinateSystem(bottomLeftX = -10, bottomLeftY = -10, width = 50, height = 50, rendering = true) {
    bottomLeftPoint = new Point2D(bottomLeftX, bottomLeftY);
    const factorX = width / visibleWidth;
    const factorY = height / visibleHeight;
    scaleCoordinateSystem(new Point2D(), factorX, factorY, rendering);
    updateNRangeInUI();
    if(rendering) {
        recalculateCoordinateSystemAndRedraw();
    }
}

/**
 * Calculates the currently desired **nStepSize** depending on the visible width on screen
 * and if **downScaling** is set to _true_. The standard value for **nStepSize** is _1_.
 * However, this can quickly lead to slowed down rendering if there is one Point2D
 * for each visible value of n if the visible width is too large.
 */
function calculateNStepSize() {
    if(!downScaling || visibleWidth < 1000) {
        nStepSize = 1;
        return;
    }
    nStepSize = Math.floor(visibleWidth / 500);
}

/**
 * Sets the range in x that should be visible on the screen.
 * @param {number} minX - New minimum value for x.
 * @param {number} maxX - New maximum value for x.
 * @param {boolean} rendering - If the scene should be rerendered.
 */
export function setXRange(minX, maxX, rendering = true) {
    if(maxX <= minX + 1) {
        console.error("Der kleinste Wert für n darf nicht größer sein als der größte. "
            + "Die Differenz zwischen den Grenzen muss außerdem mindestens 2 betragen.");
        return;
    }
    const scaleFactorX = (maxX - minX) / visibleWidth;
    scaleCoordinateSystem(new Point2D(), scaleFactorX, 1, rendering);
    bottomLeftPoint.x = minX;
    updateNRangeInUI();
}

/**
 * Sets **spatialConnectionLines** to **setTo**.
 * @param {boolean} setTo - If _true_, the CoordinateSystem will render Lines2D connecting
 * adjacent Points2D, e.g. those for x=_n_ and x=_n+1_.
 */
export function setConnectionLines(setTo) {
    spatialConnectionLines = setTo;
}

/**
 * Sets **downScaling** to **setTo**.
 * @param {boolean} setTo - If _true_, the CoordinateSystem will render fewer points
 * if too many would be visible for each n.
 */
export function setDownScaling(setTo) {
    downScaling = setTo;
}

/**
 * Sets **interpolation** to **setTo**.
 * @param {boolean} setTo - If _true_, the CoordinateSystem's animation will use linear
 * interpolation to show where a certain point is moving when n increases to n+1.
 */
export function setInterpolation(setTo) {
    interpolation = setTo;
}

/**
 * Sets **enableCoordinateSystem** to **setTo**.
 * @param {boolean} setTo - If _true_, the coordinate system will be drawn, if _false_, the background will be plain.
 */
export function setEnableCoordinateSystem(setTo) {
    enableCoordinateSystem = setTo;
}

/**
 * Propagates updates to the **activeColor**. Is called when the Dark Mode Toggle is pressed.
 */
export function updateMainColor() {
    coordinateSystem = new CoordinateSystem(coordinateSystem.stepSizeX, coordinateSystem.stepSizeY,
        coordinateSystem.enableGridLines);
    recalculateCoordinateSystem();
}

/**
 * @returns What kind of visualization style should be used, e.g. "spatial" or "temporal".
 */
function getVisualizationType() {
    if(getVisualizationTypeFromUI() == "visualization-temporal") {
        return "temporal";
    }
    return "spatial";
}

/**
 * Calculates all Point2Ds and Line2Ds that should be displayed on the canvas and then draws them
 * and the coordinate system on it.
 * @param {number} frame - Which frame of the animation is currently displayed.
 * @param {boolean} redrawing - If this method should draw the new frame itself, default is _true_.
 */
function render2D(frame = 0, redrawing = true) {
    if(frame < startingFrame) return;
    calculateNStepSize();
    calculatePoints2D(frame, nStepSize);
    calculateLines2D(getVisualizationType());
    if(redrawing) {
        redraw(false);
    }
}

/**
 * Interpolates linearly between two arrays of Point2Ds and saves the result in **points**.
 * @param {number} inbetween - Determines how close the interpolated Point2Ds should be to the
 * second array - _0_ means on top of the first array, _1_ means on top of the second array.
 */
function interpolatePoints2D(inbetween = 0.5) {
    /*
    *   maybe interpolate differently, not always linearly?
    */
    if(setsOfPoints.length < 2) {
        return;
    }
    points = [];
    const amountOfPoints = Math.min(setsOfPoints[0].length, setsOfPoints[1].length);
    for(let index = 0; index < amountOfPoints; index++) {
        if(setsOfPoints[0][index] === null || setsOfPoints[1][index] === null) {
            points.push(null);
            continue;
        }
        points.push(setsOfPoints[0][index].weightedAverageWith(setsOfPoints[1][index], inbetween));
    }
}

/**
 * Calls **interpolatePoints2D()** and then draws the calculated Points on the canvas.
 * @param {number} inbetween - Determines how close the interpolated points should be to the second
 * array in **setsOfPoints**: _0_ means on top of the first array, _1_ means on top of the second array.
 */
function interpolateAnimation(inbetween = 0.5) {
    interpolatePoints2D(inbetween);
    redraw();
}

/**
 * Calls **getSeriesType()** to decide what should be visible on the x axis.
 * @returns _"natural"_ or _"real"_, depending on what should be shown on the x axis.
 */
function getCurrentXAxisName() {
    if(getSeriesType() === "series-real-numbers") {
        return "natural";
    }
    if(getSeriesType() === "series-real-functions") {
        return "real";
    }
    return "";
}

/**
 * Notifies the coordinate system that there has been a change in visibility.
 */
function recalculateCoordinateSystem() {
    coordinateSystem.setChanged();
    coordinateSystem.setXAxisName(getCurrentXAxisName());
    updateNRangeInUI();
}

/**
 * Notifies the coordinate system that there has been a change in visibility. Then redraws the
 * current frame with new measures.
 */
export function recalculateCoordinateSystemAndRedraw() {
    coordinateSystem.setChanged();
    coordinateSystem.setXAxisName(getCurrentXAxisName());
    if(getVisualizationType() === "temporal") {
        recalculateCurrentFrames();
        drawAnimation(false);
        return;
    }
    redraw();
    updateNRangeInUI();
}

/**
 * Clears the canvas and then draws the current coordinate system, points and lines on the canvas.
 * @param {boolean | null} forceRecalculation - If null, this method only recalculates the points and lines iff
 * **updateOnChange** is _true_ and the visualization type is _"spatial"_. If set to _true_, it forces a recalculation,
 * if set to _false_, it prevents a recalculation.
 */
export function redraw(forceRecalculation = null) {
    if(forceRecalculation || forceRecalculation === null && (updateOnChange && getVisualizationType() == "spatial")) {
        calculateNStepSize();
        calculatePoints2D(frame, nStepSize);
        calculateLines2D(getVisualizationType());
    }
    clearCanvas2D();
    drawCoordinateSystem();
    drawLines2D(lines);
    drawPoints2D(points);
}

/**
 * Draws all parts of the coordinate system on the canvas iff **enableCoordinateSystem** is _true_.
 */
function drawCoordinateSystem() {
    if(!enableCoordinateSystem) {
        return;
    }
    drawLines2D(coordinateSystem.getLinesToDraw(bottomLeftPoint, visibleWidth, visibleHeight));
    drawPoints2D(coordinateSystem.getPointsToDraw());
    drawLabels(coordinateSystem.getLabelsToDraw(bottomLeftPoint, visibleWidth, visibleHeight));
}

/**
 * Sets values for **startingFrame** and **amountOfFrames** using the interval [**min**, **max**].
 * @param {number} min - The smallest number that **frame** should become in an animation cycle (frame usually describes n).
 * @param {number} max - The biggest number that **frame** should become in an animation cycle (frame usually describes n).
 */
export function setFrameRange(min, max) {
    startingFrame = min;
    amountOfFrames = max - min + 1;
}

/**
 * Increments **frame** by one with respect to **amountOfFrame** und **startingFrame**.
 * @returns _true_ if there has been an overflow this iteration, _false_ otherwise.
 */
function nextFrame() {
    const oldFrame = frame;
    frame = startingFrame + (frame - startingFrame + 1) % amountOfFrames;
    return frame < oldFrame;
}

/**
 * Increments **animationStep** by one with respect to **transitionDuration**. 
 */
function incrementAnimationStep() {
    animationStep = (animationStep + 1) % transitionDuration;
}

/**
 * Increments **waitingStep** by one with respect to **stillStandingDuration**. 
 */
function incrementWaitingStep() {
    waitingStep = (waitingStep + 1) % stillStandingDuration;
}

/**
 * Draws the next animation frame, or alternatively forces a proper redraw iff **incrementCounters** is set to _false_.
 */
function drawAnimation(incrementCounters = true) {

    if(animationStep === transitionDuration-1) {
        incrementWaitingStep();
        if(waitingStep === Math.round(stillStandingDuration/2)
            || (waitingStep < Math.round(stillStandingDuration/2) && !incrementCounters)) {
            if(nextFrame()) {
                render2D(frame);
                nextFrame();
            }
            render2D(frame);
        }
        if(!incrementCounters) {
            waitingStep = 0;
        }
        if(waitingStep === 0) {
            animationStep = 0;
        }
    }

    if(waitingStep === 0 || !incrementCounters) {
        const inbetween = interpolation ? animationStep/(transitionDuration - 1) : 0;
        interpolateAnimation(inbetween);
        if(incrementCounters) {
            incrementAnimationStep();
            if(animationStep === 0) {
                incrementWaitingStep();
            }
        }
    }

    if(!interpolation) {
        currentNApproximation = frame;
        currentNApproximationIsWhole = true;
    } else {
        currentNApproximationIsWhole = (animationStep === 0 || animationStep === transitionDuration-1);
        currentNApproximation = currentNApproximationIsWhole ? frame : (frame + animationStep / (transitionDuration-1));
        if(animationStep === transitionDuration-1 && waitingStep < Math.round(stillStandingDuration/2)) {
            currentNApproximation = frame + 1;
        }
    }

    setCurrentNTo((currentNApproximation-1).toFixed(2), !currentNApproximationIsWhole);
}

/**
 * If **animated** is _true_, this method draws a current (new or interpolated) frame and then calls
 * itself with **window.requestAnimationFrame(animate)**.
 */
function animate() {
    if(!animated) {
        return;
    }

    drawAnimation(true);

    window.requestAnimationFrame(animate);
}

/**
 * Calculate the current frame(s) again with respect to the new viewport.
 * @param {boolean} sliderUpdate - If this method is called from an update to the slider, set **sliderUpdate** to _true_.
 * Otherwise, there would be a one-off-error when called from elsewhere.
 */
function recalculateCurrentFrames(sliderUpdate = false) {
    frame = sliderUpdate ? Math.max(startingFrame-1, frame-1) : Math.max(startingFrame-1, frame-2);
    setsOfPoints = [];
    while(setsOfPoints.length < 2) {
        // if the first recalculated frame is the last one that should be shown, we make it
        // draw the line (vector) to the next (out of bounds) frame, but then reset **frame** to startingFrame
        if(frame === startingFrame + amountOfFrames - 1) {
            render2D(startingFrame + amountOfFrames, false);
            nextFrame();
            continue;
        }
        nextFrame();
        render2D(frame, false);
    }
}

/**
 * Sets **animated** to _true_, calculates the first two frames (if there aren't yet two frames
 * precalculated) and then calls **animate()** to start the animation loop.
 */
export function startAnimation() {
    animated = true;
    updateNRangeInUI();
    recalculateCurrentFrames();
    animate();
}

/**
 * Sets **updateOnChange** to _true_ and calculates the frame.
 */
export function startRenderingWithoutAnimation() {
    updateOnChange = true;
    updateNRangeInUI();
    render2D(0);
}

/**
 * Sets **animated** to _false_.
 */
export function stopAnimation() {
    animated = false;
}

/**
 * Sets the animation duration, more specifically **transitionDuration** and **stillStandingDuration**.
 */
export function setAnimationDuration(duration, waitPercentage = 0.25) {

    if(duration < 0 || waitPercentage < 0 || waitPercentage > 1) {
        return;
    }

    transitionDuration = Math.max(2, Math.round(duration * (1 - waitPercentage)));
    stillStandingDuration = Math.max(2, Math.round(duration * waitPercentage));

    resetAnimationCycle();
}

/**
 * @param {number} frame - An input value.
 * @returns An arbitrary color (as hex code) based on an input value.
 */
function getColor(frame) {
    const colorOption = frame % 3;
    switch(colorOption) {
        case 0:
            return '#00FFFF';
        case 1:
            return '#FF00FF';
        case 2:
            return '#FFFF00';
        default:
            return '#FF0000';
    }
}

/**
 * Makes sure that there are always at most (or if possible, exactly) two arrays of Point2Ds in
 * **setsOfPoints** to be used for interpolation.
 */
function saveCurrentTwoFrames() {
    if(setsOfPoints.length >= 2) {
        setsOfPoints.splice(0, setsOfPoints.length - 1);
    }
    setsOfPoints.push(points);
    points = setsOfPoints[0];
}

/**
 * Calls the parser.js function getNumericValue to obtain the coordinates of a point.
 * @param {number} i - Index of the series that should be evaluated.
 * @param {number} x - Value of x, either real (a number) or complex (an array of two numbers).
 * @param {number} n - Value of n, the natural number of the series' member.
 * @param {String} color - A string that contains the hexadecimal representation of the desired color. 
 * @param {String} xAxis - Set to "x" iff the x axis shows real values x, otherwise it is assumed that
 * the x axis shows the natural numbers for n.
 * @returns _true_ if a value exists, _false_ if the input for the series does not make sense
 * and thus calculation should be stopped.
 */
function callParserToCalculatePoint2D(i = 0, x = 0, n = 1, color, xAxis = "x") {
    const value = getNumericValue(i, x, n);
    if(value === null) {
        return false;
    }
    if(!isNaN(value)) {
        if(xAxis !== "x") {
            x = n;
        }
        points.push(new Point2D(x, value, color));
    }
    return true;
}

/**
 * @returns true if n actually means a natural number, and false if the value behind n
 * refers to a real number (such when the x axis shows x instead of n).
 */
function isNNonNegative() {
    if(getSeriesType() == "series-real-functions") {
        return false;
    }
    return true;
}

/**
 * Calls **callParserToCalculatePoint2D()** depending on the type of series at hand,
 * e.g. _"series-real-functions"_.
 * @param {number} i - Index of the series that should be evaluated.
 * @param {number} x - Value of x, either real (a number) or complex (an array of two numbers).
 * @param {number} frame - Usually means n, the natural number that **frame** is counting.
 * @param {String} color - A string that contains the hexadecimal representation of the desired color. 
 * @returns Same as **callParserToCalculatePoint2D()**.
 */
function callParserAccordingToCurrentSeriesType(i = 0, x = 0, frame, color) {
    if(getSeriesType() === "series-real-functions") {
        return callParserToCalculatePoint2D(i, x, frame, color, "x");
    }
    // getSeriesType() === "series-real-numbers"
    return callParserToCalculatePoint2D(i, 0, x, color, "n");
}

/**
 * Calculates the Point2Ds for a certain frame of the animation and saves them in **points**.
 * @param {number} frame - Which frame should be calculated. 
 * @param {number} stepSize - How many units on the x axis two points should be apart. 
 */
function calculatePoints2D(frame = 0, stepSize = 1) {

    if(animated && lastRenderedFrame === frame) {
        return;
    }

    lastRenderedFrame = frame;

    points = [];
    const startingValue = isNNonNegative() ? Math.max(getCurrentMinN() - 1, 0) : getCurrentMinN() - 1;

    // if the series type is "series-real-functions", **stepSize** will be overridden
    // with the user input for "x-resolution"
    if(getSeriesType() == "series-real-functions") {
        stepSize = getXResolution();
    }

    const colors = getInputSeriesColorsHex();
    const isVisible = getInputSeriesIsVisible();

    for(let i = 0; i < colors.length; i++) {
        if(!isVisible[i]) {
            continue;
        }

        // going from 0 to the right
        for(let x = Math.max(startingValue, 0); x <= getCurrentMaxN() + 1; x += stepSize) {
            if(!callParserAccordingToCurrentSeriesType(i, x, frame, colors[i])) {
                break;
            }
        }

        // going from 0 to the left (only applies if nNonNegative == _true_)
        for(let x = Math.min(0, getCurrentMaxN()); x >= startingValue; x -= stepSize) {
            // we only want the point at zero once, the loop above already calculates this
            if(x === 0) {
                continue;
            }
            if(!callParserAccordingToCurrentSeriesType(i, x, frame, colors[i])) {
                break;
            }
        }

        // push null as a delimiter
        points.push(null);
    }
    
    if(getVisualizationType() === "temporal") {
        saveCurrentTwoFrames();
    }
}

/**
 * Calculates the Lines between the Point2Ds of the current two frames of animation
 * (in **setsOfPoints**).
 */
function calculateLines2D(typeOfConnection = "temporal") {

    if(typeOfConnection === "spatial") {

        lines = [];

        if(!spatialConnectionLines) {
            return;
        }

        for(let index = 0; index < points.length-1; index++) {
            if(points[index] === null || points[index+1] === null) {
                continue;
            }
            lines.push(new Line2D(points[index], points[index+1]));
        }
        return;
    }

    // typeOfConnection === "temporal"

    if(setsOfPoints.length < 2) {
        lines = [];
        return;
    }
    lines = [];

    if(!spatialConnectionLines) {
        return;
    }

    const amountOfPoints = Math.min(setsOfPoints[0].length, setsOfPoints[1].length);
    for(let index = 0; index < amountOfPoints; index++) {
        if(setsOfPoints[0][index] === null || setsOfPoints[1][index] === null) {
            continue;
        }
        lines.push(new Line2D(setsOfPoints[0][index], setsOfPoints[1][index]));
    }
}

/**
 * Saves the current position the user's mouse in **oldMousePosition**.
 * @param {number} mouseX0 - The current x-coordinate of the mouse.
 * @param {number} mouseY0 - The current y-coordinate of the mouse.
 */
export function setCurrentMousePosition(mouseX0, mouseY0) {
    oldMousePosition = new Point2D(mouseX0, mouseY0);
}

/**
 * Checks if the visualization is currently set to _"temporal"_ and if so, recalculates
 * the current frames instead of just redrawing what's already been calculated.
 */
export function updateViewWithRespectToAnimationProgress() {
    updateNRangeInUI();
    
    if(getVisualizationType() === "temporal") {
        recalculateCurrentFrames();
        drawAnimation(false);
        setCurrentNTo((currentNApproximation-1).toFixed(2), !currentNApproximationIsWhole);
    } else {
        redraw();
    }
}

/**
 * Moves the visible part of the frame with the user's mouse, if the mouse button is held down.
 * @param {Point2D} newMousePosition - The current global position of the mouse.
 */
function scrollCoordinateSystem(newMousePosition) {
    if(newMousePosition.equals(oldMousePosition)) {
        return;
    }

    const moveBy = new Point2D(oldMousePosition.x - newMousePosition.x, oldMousePosition.y - newMousePosition.y)
        .toCoordinateSystemWithoutTranslation(visibleWidth, visibleHeight, canvasWidth, canvasHeight);

    bottomLeftPoint = bottomLeftPoint.translate(moveBy);

    updateNRangeInUI();

    recalculateCoordinateSystemAndRedraw();

    oldMousePosition = newMousePosition;
}

/**
 * Remembers how far the two fingers were apart when they were last registered the screen, saves it
 * in **oldDistance**.
 * @param {number} newDistance 
 */
export function setOldDistance(newDistance) {
    oldDistance = newDistance;
}

/**
 * Approximates the orientation of an imaginary line between two Point2Ds. A line is counted as
 * "horizontal" or "vertical" if the aspect ratio of the corresponding right triangle is less than 1/4.
 * @param {Point2D} startPoint - One Point2D (endpoint) of the imaginary line.
 * @param {Point2D} endPoint - The other Point2D (endpoint) of the imaginary line.
 * @returns "horizontal", "vertical" or "diagonal" depending on the approximate orientation
 * of the imaginary line between the two Point2Ds.
 */
function getOrientation(startPoint, endPoint) {
    const dx = Math.abs(endPoint.x - startPoint.x);
    const dy = Math.abs(endPoint.y - startPoint.y);
    if(4*dy < dx) {
        return "horizontal";
    }
    if(4*dx < dy) {
        return "vertical";
    }
    return "diagonal";
}

/**
 * Determines what resolution the coordinate system should be set to if ten segments would mean a
 * segment each **value** units.
 * @param {number} value - The value to be approximated.
 * @returns The best matching scale.
 */
function getClosestMagnitude(value) {
    let i = 0;
    for(i = 0; i < scales.length - 1; i++) {
        if(Math.abs(scales[i] - value) < Math.abs(scales[i+1] - value)) {
            break;
        }
    }
    return scales[i];
}

/**
 * Scales the coordinate system by **factorX** and **factorY** with the point at **center** fixed.
 * @param {Point2D} center - The fixed center of the scaling (in CSS pixels).
 * @param {number} factorX - The factor with which the x-axis should be scaled.
 * @param {number} factorY - The factor with which the y-axis should be scaled.
 * @param {boolean} rendering - If the scene should be rerendered.
 */
function scaleCoordinateSystem(center, factorX, factorY, rendering = true) {
    let tmp = bottomLeftPoint.translate(center
        .toCoordinateSystemWithoutTranslation(visibleWidth, visibleHeight, canvasWidth, canvasHeight));

    let scaleX = null;
    let scaleY = null;

    if(visibleWidth * factorX < 500000) {
        visibleWidth = visibleWidth * factorX;
        scaleX = getClosestMagnitude(visibleWidth / 10);
    }
    if(visibleHeight * factorY < 500000) {
        visibleHeight = visibleHeight * factorY;
        scaleY = getClosestMagnitude(visibleHeight / 10);
    }

    coordinateSystem.setResolution(scaleX, scaleY);

    bottomLeftPoint = tmp.translate(center
        .toCoordinateSystemWithoutTranslation(-visibleWidth, -visibleHeight, canvasWidth, canvasHeight));

    if(rendering) {
        updateViewWithRespectToAnimationProgress();
    }
}