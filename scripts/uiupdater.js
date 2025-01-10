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

const sliderIntervals = [100, 190, 280, 370, 460];
const intervalScales = [0.01, 0.1, 1, 10, 100];

import { addAndSetVariables, addAndSetSeries, exportXML, importXML,
    getImportedVariables, clearAllVariables, getImportedSeries, clearAllSeries } from "./file_io.js";
import { applySettingsFromXML as applySettingsFromXMLRenderer2D, prepareXMLExport as prepareXMLExportRenderer2D,
    setConnectionLines as setConnectionLines2D, setDownScaling as setDownScaling2D,
    setInterpolation as setInterpolation2D,
    initialize as initializeRenderer2D, redraw as redraw2D,
    startAnimation as startAnimation2D, stopAnimation as stopAnimation2D, startRenderingWithoutAnimation as startRenderingWithoutAnimation2D,
    setCurrentMousePosition as setCurrentMousePosition2D, setXRange as setXRange2D, setOldDistance as setOldDistance2D,
    updateMainColor as updateMainColor2D,
    recenterCoordinateSystem as recenterCoordinateSystem2D,
    recalculateCoordinateSystemAndRedraw as recalculateCoordinateSystemAndRedraw2D,
    setFrame as setFrame2D, setFrameRange as setFrameRange2D,
    setAnimationDuration as setAnimationDuration2D,
    updateViewWithRespectToAnimationProgress as updateViewWithRespectToAnimationProgress2D, 
    setEnableCoordinateSystem as setEnableCoordinateSystem2D,
    handleMouseMoveEvent as handleMouseMoveEvent2D, handleTouchMoveEvent as handleTouchMoveEvent2D,
    handleWheelEvent as handleWheelEvent2D } from "./renderer2d.js";
import { processInput } from "./parser.js";

const canvas2D = document.getElementById('canvas2D');
const canvasGL = document.getElementById('canvasGL');

export const canvasWidth = canvas2D.width;
export const canvasHeight = canvas2D.height;

export let clickableColor = getComputedStyle(document.body).getPropertyValue('--clickable-color');
export let activeColor = getComputedStyle(document.body).getPropertyValue('--active-color');
export let nColor = getComputedStyle(document.body).getPropertyValue('--n-color');

const pauseButton = document.getElementById('pause-button');
const renderButton = document.getElementById('render-button');
const canvasOverlay = document.getElementById('canvas-overlay');
const canvasWrapper = document.getElementById('canvas-wrapper');

const seriesSelector = document.getElementById("series-selector");
const visualizationSelector = document.getElementById("visualization-selector");
    
const optionSpatial = visualizationSelector.options[0];
const optionTemporal = visualizationSelector.options[1];

const nSymbolForSpatialRange = document.getElementById("n-symbol");
const nTemporalRange = document.getElementById("n-temporal-range");
const currentNSlider = document.getElementById("current-n");
const currentNLabel = document.getElementById("current-n-label");

const darkModeToggle = document.getElementById('dark-mode-toggle');

const firstSeries = document.getElementById('first-series');
const firstSeriesColor = document.getElementById('first-series-color');
const firstSeriesHide = document.getElementById('first-series-hide');
const firstSeriesDelete = document.getElementById('first-series-delete');

const listOfSeries = document.getElementById('list-of-series');
const addSeriesButton = document.getElementById('add-series');

const spatialConnectionLinesOption = document.getElementById('spatial-connection-lines');
const loweringResolutionOption = document.getElementById("lowering-resolution");
const loweringResolutionOptionWrapper = document.getElementById("lowering-resolution-wrapper");
const interpolationOption = document.getElementById('interpolation');
const interpolationOptionWrapper = document.getElementById('interpolation-option-wrapper');
const coordinateSystemToggle = document.getElementById('coordinate-system-toggle');

const xResolutionSlider = document.getElementById('x-resolution-slider');
const xResolutionSliderLabel = document.getElementById('x-resolution-slider-label');
const xResolutionSliderWrapper = document.getElementById('x-resolution-slider-wrapper');

const animationDurationSlider = document.getElementById('animation-duration-slider');
const animationDurationSliderLabel = document.getElementById('animation-duration-slider-label');
const animationDurationSliderWrapper = document.getElementById('animation-duration-slider-wrapper');

const minNField = document.getElementById("min-n");
const maxNField = document.getElementById("max-n");

const minNTemporalField = document.getElementById("min-n-temporal");
const maxNTemporalField = document.getElementById("max-n-temporal");

const importButton = document.getElementById("import");
const importInput = document.getElementById("import-hidden");
const exportButton = document.getElementById("export");

const playDarkModeImage = "images/play_dark_mode.png";
const playLightModeImage = "images/play_light_mode.png";
const pauseDarkModeImage = "images/pause_dark_mode.png";
const pauseLightModeImage = "images/pause_light_mode.png";

const showDarkModeImage = "images/show_dark_mode.png";
const showLightModeImage = "images/show_light_mode.png";
const hideDarkModeImage = "images/hide_dark_mode.png";
const hideLightModeImage = "images/hide_light_mode.png";

const deleteDarkModeImage = "images/delete_dark_mode.png";
const deleteLightModeImage = "images/delete_light_mode.png";
const darkModeToggleDarkModeImage = "images/dark_mode_toggle_dark_mode.png";
const darkModeToggleLightModeImage = "images/dark_mode_toggle_light_mode.png";

const htmlElement = "htmlelement";

/**
 *  What visualizations are currently allowed, e.g. the list at index _0_
 *  represents series of real numbers, an inner entry of _0_ means spatial
 *  viualization is enabled for that type of series.
 */
const allowedVisualizations = [[0],[1]];

const listOfNumbersToSave = ["seriesSelector.selectedIndex", "visualizationSelector.selectedIndex",
    "currentMinN", "currentMaxN"];

const listOfBooleansToSave = ["spatialConnectionLinesOption.checked", "loweringResolutionOption.checked",
    "interpolationOption.checked", "coordinateSystemToggle.checked"];

const listOfNumsAsStringsToSave = ["minNTemporalField.value", "maxNTemporalField.value",
    "currentNSlider.min", "currentNSlider.max", "currentNSlider.value",
    "xResolutionSlider.value", "animationDurationSlider.value"];

let firstEverToggle = true;
let rendering = false;
let animating = false;
let in2D = true;

let mouseDown = false;
let touchDown = false;
let mouseX0 = 0;
let mouseY0 = 0;

let lastClickTime = null;

let currentMinN = 0;
let currentMaxN = 100;

initialize();

/**
 * Adds all event listeners to buttons and other input methods.
 */
function addEventListeners() {
    darkModeToggle.addEventListener('click', toggleDarkMode);

    firstSeries.addEventListener('blur', useNewInput);
    firstSeriesHide.addEventListener('click', function() { swapHideButtonImage(this); });
    firstSeriesDelete.addEventListener('click', function() { deleteParentContainer(this); });
    
    addSeriesButton.addEventListener('click', addEntry);
    
    renderButton.addEventListener('click', toggleRendering);
    
    minNField.addEventListener('blur', setNewNRange);
    maxNField.addEventListener('blur', setNewNRange);
    addEnterListener(minNField, setNewNRange);
    addEnterListener(maxNField, setNewNRange);
    
    minNTemporalField.addEventListener('blur', setNewNTemporalRange);
    maxNTemporalField.addEventListener('blur', setNewNTemporalRange);
    addEnterListener(minNTemporalField, setNewNTemporalRange);
    addEnterListener(maxNTemporalField, setNewNTemporalRange);
    
    spatialConnectionLinesOption.addEventListener('click', function() { toggleSpatialConnectionLines(this); });
    loweringResolutionOption.addEventListener('click', function() { toggleDownScaling(this); });
    interpolationOption.addEventListener('click', function() { toggleInterpolation(this); } );
    coordinateSystemToggle.addEventListener('click', function() { toggleEnableCoordinateSystem(this); });
    xResolutionSlider.addEventListener('input', setXResolution )
    animationDurationSlider.addEventListener('input', setAnimationDuration )

    document.addEventListener("keydown", glowUp);

    document.addEventListener("touchstart", function(event) {
        if(!rendering) {
            return;
        }

        const touch0ClientX = event.touches[0].clientX;
        const touch0ClientY = event.touches[0].clientY;

        if(isTouchOutsideCanvasWrapper(touch0ClientX, touch0ClientY)) {
            setTouchDown(false);
            return;
        }

        setTouchDown(true);

        if(event.touches.length === 1) {
            setCurrentMousePosition2D(touch0ClientX, touch0ClientY);
        } else if(event.touches.length === 2) {
            const touch1ClientX = event.touches[1].clientX;
            const touch1ClientY = event.touches[1].clientY;

            if(isTouchOutsideCanvasWrapper(touch1ClientX, touch1ClientY)) {
                setTouchDown(false);
                return;
            }

            const bounds = canvasWrapper.getBoundingClientRect();
            const averageRelativePositionX = touch0ClientX/2 + touch1ClientX/2 - bounds.left;
            const averageRelativePositionY = touch0ClientY/2 + touch1ClientY/2 - canvasHeight - bounds.top;

            setCurrentMousePosition2D(averageRelativePositionX, averageRelativePositionY);
            setOldDistance2D(Math.sqrt(Math.pow(touch0ClientX - touch1ClientX, 2) 
                + Math.pow(touch0ClientY - touch1ClientY, 2)));

        } else {
            setTouchDown(false);
        }

        if(touchDown) {
            canvasWrapper.classList.add('active');
        }
    });

    document.addEventListener("touchend", function(event) {
        if(!rendering) {
            return;
        }

        if(event.touches.length === 1) {
            const touch0ClientX = event.touches[0].clientX;
            const touch0ClientY = event.touches[0].clientY;
            if(!isTouchOutsideCanvasWrapper(touch0ClientX, touch0ClientY)) {
                setCurrentMousePosition2D(touch0ClientX, touch0ClientY);
            }
        }
        setTouchDown(false);
        canvasWrapper.classList.remove('active');
    });

    canvasWrapper.addEventListener("mousedown", function(event) {
        if(!rendering) {
            return;
        }

        mouseDown = true;
        mouseX0 = event.clientX;
        mouseY0 = event.clientY;
        setCurrentMousePosition2D(mouseX0, mouseY0);
    });

    canvasWrapper.addEventListener("mouseup", function(event) {
        if(!rendering) {
            return;
        }

        mouseDown = false;
        if(firstEverToggle) {
            return;
        }

        // click
        if(Math.abs(mouseX0 - event.clientX) < 2 && Math.abs(mouseY0 - event.clientY) < 2) {
            const now = getCurrentTime();
            if(lastClickTime) {
                const timePassed = now - lastClickTime;
                if(timePassed < 300 && timePassed > 0) {
                    recenterView();
                }
            }
            toggleAnimating();
            lastClickTime = getCurrentTime();
        }
    });

    seriesSelector.addEventListener("change", function() {
        updateUIForTypeOfSeries(seriesSelector.selectedIndex);
        updateVisualizationStyle();
    });

    // binding to functions in renderer2d.js
    canvasWrapper.addEventListener("mousemove", function(event) { if(rendering) { handleMouseMoveEvent2D(event); } });
    canvasWrapper.addEventListener("touchmove", function(event) { if(rendering) { handleTouchMoveEvent2D(event); } });
    canvasWrapper.addEventListener("wheel", function(event) { if(rendering) { handleWheelEvent2D(event); } });

    currentNSlider.addEventListener("input", updateCurrentN);

    visualizationSelector.addEventListener("change", updateVisualizationStyle);

    addEnterListener(firstSeries, useNewInput);
    firstSeriesColor.addEventListener("change", function() {
        useNewInput();
    });

    importButton.addEventListener("click", function() { importInput.value = null; });
    importInput.addEventListener("change", function(event) {
        clearAllVariables();
        clearAllSeries();
        importXML(event.target.files[0])
            .then(msg => {
                console.log(msg);
                applySettingsFromXML();
            })
            .catch(error => {
                clearAllVariables();
                clearAllSeries();
                console.error(error);
            });
    });
    exportButton.addEventListener("click", function() {
        prepareXMLExport();
        exportXML();
    });

    window.addEventListener("beforeunload", function(event) {
        // Warning if you try to reload or leave the page
        event.preventDefault();
    });
}

/**
 * Initializes all necessary variables.
 */
function initialize() {
    
    /*
    *   For better use with a Tablet
    */
    if (document.documentElement.clientWidth > 1000) { 
        document.querySelector("meta[name=viewport]").setAttribute("content", 
            "initial-scale=0.85, maximum-scale=0.85, user-scalable=0");
    }

    // initialization of the input fields and sliders
    seriesSelector.selectedIndex = 0;
    visualizationSelector.selectedIndex = 0;

    minNTemporalField.value = "0";
    maxNTemporalField.value = "50";
    currentNSlider.min = "-10";
    currentNSlider.max = "40";
    currentNSlider.value = "0";

    xResolutionSlider.value = "100";
    animationDurationSlider.value = "120";

    spatialConnectionLinesOption.checked = true;
    loweringResolutionOption.checked = true;
    interpolationOption.checked = true;
    coordinateSystemToggle.checked = true;

    updateNRange(-10, 40);

    addEventListeners();

    initializeRenderer2D();

    propagateAllChangesInTheUI();
}

/**
 * Applies all changes to the corresponding variables.
 */
function propagateAllChangesInTheUI() {
    setNewNTemporalRange();
    setNewNRange();
    setXResolution();
    setAnimationDuration();
    toggleSpatialConnectionLines(spatialConnectionLinesOption);
    toggleDownScaling(loweringResolutionOption);
    toggleInterpolation(interpolationOption);
    toggleEnableCoordinateSystem(coordinateSystemToggle);
    useNewInput();
    updateVisualizationStyle();
}

/**
 * Passes all variables that need to be saved on to file_io.js.
 */
function prepareXMLExport() {

    clearAllVariables();
    clearAllSeries();

    for(let variable of listOfBooleansToSave.concat(listOfNumbersToSave).concat(listOfNumsAsStringsToSave)) {
        addAndSetVariables([variable, eval(variable)]);
    }

    const series = getInputSeries();
    const colors = getInputSeriesColorsHex();
    const isVisible = getInputSeriesIsVisible();
    for(let index in series) {
        addAndSetSeries([series[index], colors[index], isVisible[index]]);
    }

    prepareXMLExportRenderer2D();
}

/**
 * @param {any} variable - The variable to be typechecked.
 * @param {String} type - The type it is supposed to be.
 * @returns _true_ if variable is of type **type**, _false_ otherwise.
 */
export function isVariableOfType(variable, type) {
    return typeof(variable) === type;
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
    for(let bool of listOfBooleansToSave) {
        if(!isVariableOfType(variables[bool], "boolean")) {
            return -1;
        }
    }
    for(let str of listOfNumsAsStringsToSave) {
        if(!isVariableOfType(variables[str], "string")) {
            return -1;
        }
        if(isNaN(Number(variables[str]))) {
            return -1;
        }
    }

    return 0;
}

/**
 * Gets the data loaded from XML from file_io.js and applies it.
 */
function applySettingsFromXML() {

    const variables = getImportedVariables();

    // check if at least the types are correct
    if(checkTypesOfImportedVariables(variables) === -1) {
        console.error("Da hat wohl jemand an der exportierten Datei rumgespielt.");
        return;
    }
    
    // make sure it's in the right range and an allowed combination
    const seriesIndex = Math.max(0, Math.min(seriesSelector.childElementCount-1,
        variables["seriesSelector.selectedIndex"]));
    updateUIForTypeOfSeries(seriesIndex);
    const visualizationIndex = variables["visualizationSelector.selectedIndex"];
    visualizationSelector.selectedIndex = allowedVisualizations[seriesIndex].includes(visualizationIndex) ?
        visualizationIndex : allowedVisualizations[seriesIndex][0];
    
    // uses the loaded values and applies them directly
    // this might need further error checking in a later version
    for(let str of listOfNumsAsStringsToSave) {
        eval(str + " = variables[\"" + str + "\"];");
    }
    for(let bool of listOfBooleansToSave) {
        eval(bool + " = variables[\"" + bool + "\"];");
    }

    updateNRange(variables["currentMinN"], variables["currentMaxN"]);

    const series = getImportedSeries();
    let listOfSeriesColors = getInputSeriesChild(0, htmlElement);
    let listOfSeriesInputs = getInputSeriesChild(1, htmlElement);
    let listOfSeriesIsVisible = getInputSeriesIsVisible();

    let index;
    for(index = 0; index < series.length; index++) {
        let textField = listOfSeriesInputs[index];
        let colorPicker = listOfSeriesColors[index];
        let wasVisibleBefore = listOfSeriesIsVisible[index];
        if(textField) {
            textField.value = series[index][0];
            colorPicker.value = series[index][1];
            if(wasVisibleBefore ^ series[index][2]) {
                swapHideButtonImage(getInputSeriesChild(2, htmlElement)[index]);   
            }
        } else {
            addEntry(false);
            listOfSeriesColors = getInputSeriesChild(0, htmlElement);
            listOfSeriesInputs = getInputSeriesChild(1, htmlElement);
            listOfSeriesIsVisible = getInputSeriesIsVisible();
            index--;
        }
    }

    index++;
    while(listOfSeries.childElementCount > index || (series.length == 0 && listOfSeries.childElementCount > 0)) {
        listOfSeries.removeChild(listOfSeries.lastChild);
    }

    propagateAllChangesInTheUI();
    
    applySettingsFromXMLRenderer2D(rendering);
}

/**
 * This function updates the UI depending on what type of series you select. It uses **allowedVisualizations**
 * to determine which visualization style should be enabled and which disabled.
 * @param {number} index - _0_ means series of real numbers, _1_ means series of real functions.
 */
function updateUIForTypeOfSeries(index) {

    seriesSelector.selectedIndex = index;
    optionSpatial.disabled = !allowedVisualizations[index].includes(0);
    optionTemporal.disabled = !allowedVisualizations[index].includes(1);

    visualizationSelector.selectedIndex = allowedVisualizations[index][0];

    const isRealNumbers = index === 0;

    currentNSlider.hidden = isRealNumbers;
    if(isRealNumbers) {
        nTemporalRange.classList.add("hidden");
        interpolationOptionWrapper.classList.add("hidden");
        xResolutionSliderWrapper.classList.add("hidden");
        animationDurationSliderWrapper.classList.add("hidden");
        loweringResolutionOptionWrapper.classList.remove("hidden");
        nSymbolForSpatialRange.innerHTML = nSymbolForSpatialRange.innerHTML.replace(";x&",";n&");
        return;
    }

    // series of real functions, not real numbers
    nTemporalRange.classList.remove("hidden");
    interpolationOptionWrapper.classList.remove("hidden");
    xResolutionSliderWrapper.classList.remove("hidden");
    animationDurationSliderWrapper.classList.remove("hidden");
    loweringResolutionOptionWrapper.classList.add("hidden");
    nSymbolForSpatialRange.innerHTML = nSymbolForSpatialRange.innerHTML.replace(";n&",";x&");
}

/**
 * @returns **mouseDown** 
 */
export function getMouseDown() {
    return mouseDown;
}

/**
 * @returns **touchDown** 
 */
export function isTouchDown() {
    return touchDown;
}

/**
 * @returns **currentMinN** 
 */
export function getCurrentMinN() {
    return currentMinN;
}

/**
 * @returns **currentMaxN** 
 */
export function getCurrentMaxN() {
    return currentMaxN;
}

/**
 * @param {number} n - Converts this number to a formatted string and puts it in the content of **currentNLabel**.
 * @param {boolean} highlighted - If set to _true_, the color of the label will be **nColor**, otherwise
 * it will be the **activeColor**.
 */
function setCurrentNLabelTo(n, highlighted=false) {
    currentNLabel.innerHTML = "n&nbsp;=&nbsp;" + Number(n).toFixed(2);
    currentNLabel.style.color = highlighted ? nColor : null;
}

/**
 * Updates the current frame in renderer2d.js.
 */
function updateCurrentN() {
    const frame = Number(currentNSlider.value);
    setCurrentNLabelTo(frame);
    setFrame2D(frame, true, rendering);
    if(rendering) {
        redraw2D(false);
    }
}

/**
 * @param {number} n - Sets the **currentNSlider** to this new value of **n**.
 * @param {boolean} highlighted - If set to _true_, the color of the label will be **nColor**, otherwise
 * it will be the **activeColor**.
 */
export function setCurrentNTo(n=0, highlighted=false) {
    currentNSlider.value = n;
    setCurrentNLabelTo(n, highlighted);
}

/**
 * Toggles from Light Mode to Dark Mode and vice versa. Calls all methods
 * to properly update the colors.
 */
function toggleDarkMode() {
    const darkMode = document.documentElement.className == 'light';
    document.documentElement.className = darkMode ? 'dark' : 'light';
    setDarkModeToggleIcon(darkMode);
    setPauseButtonIcon(rendering, darkMode);
    updateMainColors();
    const hideButtonImages = getInputSeriesChild(2, htmlElement);
    for(let image of hideButtonImages) {
        setHideButtonImageToTheme(image, darkMode);
    }
    const deleteButtonImages = getInputSeriesChild(3, htmlElement);
    for(let image of deleteButtonImages) {
        setDeleteButtonImageToTheme(image, darkMode);
    }
    if(rendering) {
        redraw2D();
    }
}

/**
 * Updates the **activeColor** to be in sync with the **--active-color** defined in the CSS root.
 * Is called when the Dark Mode Toggle is pressed.
 */
function updateMainColors() {
    activeColor = getComputedStyle(document.body).getPropertyValue('--active-color');
    clickableColor = getComputedStyle(document.body).getPropertyValue('--clickable-color');
    updateMainColor2D();
}

/**
 * Sets the current icon of the dark mode toggle button in the top right corner of the view.
 * @param {boolean} darkMode - If _true_, the color of the icon will be lighter.
 */
function setDarkModeToggleIcon(darkMode) {
    darkModeToggle.src = darkMode ? darkModeToggleDarkModeImage : darkModeToggleLightModeImage;
}

/**
 * Sets the current icon of the play/pause button in the top left corner of the canvas.
 * @param {boolean} paused - If _true_, the icon will display ">", otherwise "||".
 * @param {boolean} darkMode - If _true_, the color of the icon will be lighter.
 */
function setPauseButtonIcon(paused = true, darkMode = true) {
    if(darkMode) {
        pauseButton.src = paused ? playDarkModeImage : pauseDarkModeImage;
        return;
    }
    pauseButton.src = paused ? playLightModeImage : pauseLightModeImage;
}

/**
 * @returns _true_ iff you have selected "visualization-temporal" on the right drop-down selector.
 */
function isAnimated() {
    return visualizationSelector.selectedIndex === 1;
}

/**
 * Toggles the global boolean **animating**, or sets it to **setTo** if **setTo** is not _null_.
 * @param {boolean} setTo - If _null_, this method toggles **animating**, otherwise **animating** is set to this.
 * @returns _true_ if **animating** was set or toggled, or _false_ if **isAnimated()** returns _false_.
 */
function toggleAnimating(setTo = null) {
    if(!isAnimated()) {
        pauseButton.hidden = true;
        currentNLabel.hidden = true;
        animating = false;
        return false;
    }
    pauseButton.hidden = false;
    currentNLabel.hidden = false;

    if(setTo === null) {
        animating = !animating;
    } else {
        animating = setTo;
    }

    const darkMode = document.documentElement.className != 'light';
    if(animating) {
        canvas2D.classList.add('animating');
        canvasGL.classList.add('animating');
    } else {
        canvas2D.classList.remove('animating');
        canvasGL.classList.remove('animating');
    }
    setPauseButtonIcon(!animating, darkMode);

    if(animating) {
        disableInput(true);
        startAnimation2D();
        return true;
    }
    
    disableInput(false);
    stopAnimation2D();
    return true;
}

/**
 * Disables or enables user input. Inputs are disabled during animation.
 * @param {boolean} disabled - If set to _true_, all relevant input fields are disabled. If set to
 * _false_, te inputs are reenabled.
 */
function disableInput(disabled = true) {
    maxNTemporalField.disabled = disabled;
    minNTemporalField.disabled = disabled;
    currentNSlider.disabled = disabled;

    const inputFields = getInputSeriesChild(1, htmlElement);
    for(let element of inputFields) {
        element.disabled = disabled;
    }
}

/**
 * Toggles the boolean **rendering**, and hides the overlay on top of the canvas
 * the first time it's called.
 * Then, depending on **in2D**, a method in either renderer2d.js or renderer3d.js is called
 * to actually draw something on the canvas.
 */
function toggleRendering() {
    rendering = !rendering;
    if(firstEverToggle) {
        renderButton.hidden = true;
        canvasOverlay.hidden = true;
        firstEverToggle = false;
        useNewInput();
    }
    if(in2D) {
        if(!toggleAnimating()) {
            startRenderingWithoutAnimation2D();
        }
        return;
    }
    render3D(); // does not exist yet
    return;
}

/**
 * Calls the method **processInput()** in parser.js to notify it to process the
 * currently input series of the list. If **rendering** is set to _true_, this
 * method also calls **redraw()** to redraw the current frame.
 */
function useNewInput() {
    processInput();
    if(rendering) {
        updateViewWithRespectToAnimationProgress2D();
    }
}

/**
 * Adds a new HTML element to **list-of-series** and gives it focus.
 */
function addEntry(focus = true) {
    const entry = document.createElement("li");
    const darkMode = document.documentElement.className != 'light';

    const colorPicker = document.createElement("input");
    colorPicker.setAttribute("type","color");
    colorPicker.setAttribute("class","rounded-border");
    colorPicker.setAttribute("value","#808080");
    colorPicker.addEventListener("change", useNewInput);

    const textField = document.createElement("input");
    textField.setAttribute("type","text");
    textField.setAttribute("class","input-text");
    textField.setAttribute("value","");
    textField.addEventListener("blur", useNewInput);

    const hideButton = document.createElement("img");
    hideButton.setAttribute("class","icon clickable");
    if(darkMode) {
        hideButton.setAttribute("src", showDarkModeImage);
    } else {
        hideButton.setAttribute("src", showLightModeImage);
    }
    hideButton.addEventListener('click', function() { swapHideButtonImage(this); });

    const deleteButton = document.createElement("img");
    deleteButton.setAttribute("class","icon delete-button clickable");
    if(darkMode) {
        deleteButton.setAttribute("src", deleteDarkModeImage);
    } else {
        deleteButton.setAttribute("src", deleteLightModeImage);
    }
    deleteButton.addEventListener('click', function() { deleteParentContainer(this); });

    addEnterListener(textField, useNewInput);

    entry.appendChild(colorPicker);
    entry.appendChild(textField);
    entry.appendChild(hideButton);
    entry.appendChild(deleteButton);

    listOfSeries.append(entry);

    if(focus) {
        textField.focus();   
    }
}

/**
 * Deletes the parent container of **child** and calls **useNewInput()**.
 * @param {HTMLElement} child - The child whose parent container gets deleted.
 */
function deleteParentContainer(child) {
    const parent = child.parentNode;
    parent.remove();
    useNewInput();
}

/**
 * Man, what a glow up.
 * @param {KeyboardEvent} event - **event.key** contains the key that was just pressed, e.g. "g".
 */
function glowUp(event) {
    if(event.key != "g") {
        return;
    }
    const main = document.getElementsByTagName('main');
    main[0].classList.toggle('glow-up');
    darkModeToggle.classList.toggle('glow-up');
}

/**
 * Calls **recenterCoordinateSystem()** in renderer2d.js.
 */
function recenterView() {
    recenterCoordinateSystem2D();
}

/**
 * @returns The current time in ms.
 */
function getCurrentTime() {
    return new Date().getTime();
}

/**
 * Sets **touchDown** to **value**. _true_ means the user is currently using a touch screen to interact.
 * @param {boolean} value - Either _true_ or _false_.
 */
function setTouchDown(value = true) {
    touchDown = value;
    /*
    *  If you want to debug the touch operations, then remove the "//" down below:
    */
    // if(touchDown) {
    //     document.body.style.backgroundColor = "green";
    // } else {
    //     document.body.style.backgroundColor = "red";
    // }
}

/**
 * @param {number} touchClientX - The x coordinate of the touch in clientX units.
 * @param {number} touchClientY - The y coordinate of the touch in clientY units.
 * @returns _true_ iff the touch was inside the **canvas-wrapper** element.
 */
function isTouchOutsideCanvasWrapper(touchClientX, touchClientY) {
    const bounds = canvasWrapper.getBoundingClientRect();
    return touchClientX < bounds.left || touchClientX > bounds.right || touchClientY < bounds.top || touchClientY > bounds.bottom;
}

/**
 * If you select a new visulation style, e.g. temporal, then the visual layout will
 * be reset using this method.
 */
function updateVisualizationStyle() {
    if(!rendering) {
        return;
    }
    canvas2D.classList.remove('animating');
    canvasGL.classList.remove('animating');
    toggleAnimating(false);
    stopAnimation2D();
    recalculateCoordinateSystemAndRedraw2D();
}

/**
 * Rounds **minN** and **maxN** to include **minN** and **maxN** in [**minN**, **maxN**].
 * @param {number} minN - The new value to be shown as the lower bound of n (not yet rounded).
 * @param {number} maxN - The new value to be shown as the upper bound of n (not yet rounded).
 */
export function updateNRange(minN, maxN) {
    if(maxN < minN) {
        return;
    }
    currentMinN = Math.floor(minN);
    currentMaxN = Math.ceil(maxN);

    minNField.value = currentMinN;
    maxNField.value = currentMaxN;
}

/**
 * Takes the input from **minNField** and **maxNField** and sends it to renderer2d.js using
 * **setXRange()**. Also handles possible errors and logs them to the console.
 */
function setNewNRange() {
    const minN = minNField.value;
    const maxN = maxNField.value;

    const type = getVisualizationType() == "visualization-temporal" ? "x" : "n";

    if(!isWholeNumber(minN)) {
        console.error("Die eingegebene untere Grenze fuer "+type+" ist keine ganze Zahl:", minN);
        return;
    }

    if(!isWholeNumber(maxN)) {
        console.error("Die eingegebene obere Grenze fuer "+type+" ist keine ganze Zahl:", maxN);
        return;
    }

    // enable for less updates, leave disabled for easier positioning of the coordinate system
    // if(minN == currentMinN && maxN == currentMaxN) {
    //     return;
    // }

    setXRange2D(parseInt(minN), parseInt(maxN), rendering);

    if(rendering) {
        recalculateCoordinateSystemAndRedraw2D();
    }
}

/**
 * Sets the new min and max values for the slider that selects the current n.
 */
function setNewNTemporalRange() {
    if(animating) {
        minNTemporalField.value = currentNSlider.min;
        maxNTemporalField.value = currentNSlider.max;
        return;
    }
    
    const minN = minNTemporalField.value;
    const maxN = maxNTemporalField.value;

    if(!isWholeNumber(minN)) {
        console.error("Die eingegebene untere Grenze für n ist keine ganze Zahl:", minN);
        return;
    }

    if(!isWholeNumber(maxN)) {
        console.error("Die eingegebene obere Grenze für n ist keine ganze Zahl:", maxN);
        return;
    }

    const oldValue = Number(currentNSlider.value);

    const min = Number(minN);
    const max = Number(maxN);

    if(min < 0 || max < min) {
        minNTemporalField.value = currentNSlider.min;
        maxNTemporalField.value = currentNSlider.max;
        return;
    }

    currentNSlider.min = minN;
    currentNSlider.max = maxN;

    if(oldValue < min) {
        setCurrentNTo(min);
        return;
    }

    if(oldValue > max) {
        setCurrentNTo(max);
    }

    updateCurrentN();
    setFrameRange2D(min, max);
}

/**
 * Creates a "keypress" listener for **element** so that **func** is called when the user presses "Enter"
 * while the element is in focus. The default action is prevented and the element loses focus afterwards.
 * @param {HTMLElement} element - The element this key listener is bound to.
 * @param {Function} func - The function to be called when **element** has focus and the user presses "Enter".
 */
function addEnterListener(element, func) {
    element.addEventListener("keypress", function(event) {
        if(event.key === "Enter") {
            event.preventDefault();
            func();
            element.blur();
        }
    });
}

/**
 * Checks if the input String **string** is actually a whole number.
 * @param {String} string - The string to be checked.
 * @returns _true_ iff **string** matches the regex of a whole number.
 */
function isWholeNumber(string) {
    return /^-?\d+$/.test(string);
}

/**
 * @returns What kind of series is being visualized, e.g. a series of real functions as _"series-real-functions"_.
 */
export function getSeriesType() {
    return seriesSelector.value;
}

/**
 * @returns What kind of visualization should be used, e.g. _"visualization-temporal"_.
 */
export function getVisualizationType() {
    return visualizationSelector.value;
}

/**
 * This method is used to get an array of all icons to be updated in **list-of-series** (if **type** equals **htmlElement**),
 * or an array of all text fields or selected colors in **list-of-series** (if **type** is _"input"_).
 * @param {number} childNr - Which child of the elements in **list-of-series** should be collected. _0_ means Colors, _1_ means string inputs,
 * _2_ means icon of the "hidden" button.
 * @param {String} type - _"input"_ or **htmlElement**
 * @returns An array of the desired HTMLElements.
 */
function getInputSeriesChild(childNr = 1, type = "input") {
    const list = listOfSeries.getElementsByTagName("li");
    let inputSeries = [];
    for(let item of list) {
        if(type === htmlElement) {
            inputSeries.push(item.children[childNr]);
            continue;
        }
        inputSeries.push(item.getElementsByTagName(type)[childNr].value);
    }
    return inputSeries;
}

/**
 * @returns An array of the colors of each input series.
 */
export function getInputSeriesColorsHex() {
    return getInputSeriesChild(0);
}

/**
 * @returns An array of the contents of the text fields of each input series.
 */
export function getInputSeries() {
    return getInputSeriesChild(1);
}

/**
 * @returns An array of booleans that are _true_ iff the icon next to the corresponding
 * input series is the opened eye, representing "visible".
 */
export function getInputSeriesIsVisible() {
    const images = getInputSeriesChild(2, htmlElement);
    let inputSeriesIsVisible = [];
    for(let image of images) {
        const oldImage = getImageName(image);
        inputSeriesIsVisible.push((oldImage === showDarkModeImage || oldImage === showLightModeImage));
    }
    return inputSeriesIsVisible;
}

/**
 * @param {HTMLElement} image - An <img> container whose relative image path should be extracted.
 * @returns The path of the image relative to index.html.
 */
function getImageName(image) {
    const urlParts = image.src.split("/");
    return urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
}

/**
 * Calls func with parameter bool and then updates the screen.
 * @param {function} func - The function to be called with _func(bool)_.
 * @param {boolean} bool - Either _true_ or _false_.
 */
function toggleAFunction(func, bool) {
    func(bool);
    if(rendering) {
        updateViewWithRespectToAnimationProgress2D();
    }
}

/**
 * Uses **setConnectionLines()** in renderer2d.js to toggle whether
 * the lines connecting two adjacent points should be drawn.
 * @param {HTMLElement} checkBox - The checkbox input element that decides
 * if the lines should be drawn (_true_ if checked).
 */
function toggleSpatialConnectionLines(checkBox) {
    toggleAFunction(setConnectionLines2D, checkBox.checked);
}

/**
 * Uses **setDownScaling()** in renderer2d.js to toggle whether
 * fewer points should be drawn if zoomed out.
 * @param {HTMLElement} checkBox - The checkbox input element that decides
 * if the resolution should be dynamic (_true_ if checked).
 */
function toggleDownScaling(checkBox) {
    toggleAFunction(setDownScaling2D, checkBox.checked);
}

/**
 * Uses **setInterpolation()** in renderer2d.js to toggle whether the
 * animation should be interpolated linearly or just go to the next n directly.
 * @param {HTMLElement} checkBox - The checkbox input element that decides
 * if the interpolation should be active (_true_ if checked).
 */
function toggleInterpolation(checkBox) {
    toggleAFunction(setInterpolation2D, checkBox.checked);
}

/**
 * Uses **setEnableCoordinateSystem()** in renderer2d.js to toggle whether coordinate system should be drawn.
 * @param {HTMLElement} checkBox - The checkbox input element that decides
 * if the coordinate system should be drawn (_true_ if checked).
 */
function toggleEnableCoordinateSystem(checkBox) {
    toggleAFunction(setEnableCoordinateSystem2D, checkBox.checked);
}

/**
 * Sets the new resolution of x.
 */
function setXResolution() {
    xResolutionSliderLabel.children[0].innerHTML = getXResolution().toFixed(2);
    if(rendering) {
        updateViewWithRespectToAnimationProgress2D();
    }
}

/**
 * @returns The current width of a step in x direction.
 */
export function getXResolution() {
    const sliderValue = Number(xResolutionSlider.value);
    let total = 0;
    for(let index in sliderIntervals) {
        const lastBound = index > 0 ? sliderIntervals[index-1] : 0;
        if(sliderValue < sliderIntervals[index]) {
            return total + (sliderValue - lastBound) * intervalScales[index];
        }
        total += (sliderIntervals[index] - lastBound) * intervalScales[index];
    }
    return total;
}

/**
 * Sets a new time for one animation frame.
 */
function setAnimationDuration() {
    const animationDuration = getAnimationDuration();
    animationDurationSliderLabel.children[0].innerHTML = animationDuration;
    setAnimationDuration2D(animationDuration);
}

/**
 * @returns The current duration of an animation frame (_1_ equals one frame per n).
 */
function getAnimationDuration() {
    return Number(animationDurationSlider.value);
}

/**
 * Changes the image file used in an <img> container to one of the delete icons.
 * @param {HTMLElement} image - The <img> container whose "src" should be updated to the delete icon. 
 * @param {boolean} darkMode - Whether the icon should be for light or dark mode.
 */
function setDeleteButtonImageToTheme(image, darkMode = true) {
    image.src = darkMode ? deleteDarkModeImage : deleteLightModeImage;
}

/**
 * Changes the image file used in an <img> container to one of the hide or unhide icons.
 * @param {HTMLElement} image - The <img> container whose "src" should be updated to the correctly colored icon. 
 * @param {boolean} darkMode - Whether the icon should be for light or dark mode.
 */
function setHideButtonImageToTheme(image, darkMode = true) {
    const oldImage = getImageName(image);
    if(oldImage === showDarkModeImage || oldImage === showLightModeImage) {
        image.src = darkMode ? showDarkModeImage : showLightModeImage;
    }
    if(oldImage === hideDarkModeImage || oldImage === hideLightModeImage) {
        image.src = darkMode ? hideDarkModeImage : hideLightModeImage;
    }
}

/**
 * Toggles the image file used in an <img> container to one of the hide or unhide icons.
 * @param {HTMLElement} image - The <img> container whose "src" should be updated to one eye icon
 * (open eye = shown, closed eye = hidden). 
 * @param {boolean} darkMode - Whether the icon should be for light or dark mode.
 */
function setHideButtonImage(image, darkMode) {
    const oldImage = getImageName(image);
    if(darkMode) {
        image.src = oldImage == showDarkModeImage ? hideDarkModeImage : showDarkModeImage;
        return;
    }
    image.src = oldImage == showLightModeImage ? hideLightModeImage : showLightModeImage;
}

/**
 * Toggles the image file used in an <img> container to one of the hide or unhide icons.
 * Determines darkMode for **setHideButtonImage()** automatically.
 * @param {HTMLElement} image - The <img> container whose "src" should be updated to one eye icon
 * (open eye = shown, closed eye = hidden).
 */
function swapHideButtonImage(image) {
    const darkMode = document.documentElement.className != 'light';
    setHideButtonImage(image, darkMode);
    if(rendering) {
        updateViewWithRespectToAnimationProgress2D();
    }
}