// This program visualizes mathematical series in a browser.
// Copyright (C) 2024  Tobias Straube

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

import { activeColor } from "../uiupdater.js";

/**
 * @class A two-dimensional point, or vector, that has an inherent color and can be transformed.
 */
export default class Point2D {
    /**
     * @param {number} x - The x coordinate of the represented point or vector.
     * @param {number} y - The y coordinate of the represented point or vector.
     * @param {color} color - Default will be the **--activeColor** of the CSS root.
     */
    constructor(x = 0, y = 0, color = activeColor) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    /**
     * Translates the Point2D and returns a new Point2D with the result.
     * @param {Point2D} point - If not _null_ will be interpreted as a vector and added to the Point2D it is called on.
     * @param {number} translateX - If **point** is _null_, this will be added to the x component of the Point2D instead.
     * @param {number} translateY - If **point** is _null_, this will be added to the y component of the Point2D instead. 
     * @returns A new Point2D that was moved according to the parameters.
     */
    translate(point = null, translateX = 0, translateY = 0) {
        if(!point) {
            return new Point2D(this.x + translateX, this.y + translateY, this.color);
        }
        return new Point2D(this.x + point.x, this.y + point.y, this.color);
    }

    /**
     * Scales the Point2D with respect to the origin _(0,0)_.
     * @param {number} scaleFactorX - If **scaleFactorY** is _null_, then this scaling factor will
     * be used to scale x and y symmetrically, otherwise only x is scaled by this factor.
     * @param {number} scaleFactorY - If _null_, then **scaleFactorX** will be used to scale x and y
     * symmetrically, otherwise this will determine the scale factor for the y coordinate.
     * @returns A new Point2D that is either **this*scaleFactorX** or **(this.x * scaleFactorX, this.y * scaleFactorY)**.
     */
    scale(scaleFactorX = 1, scaleFactorY = null) {
        if(!scaleFactorY) {
            return new Point2D(this.x * scaleFactorX, this.y * scaleFactorX, this.color);
        }
        return new Point2D(this.x * scaleFactorX, this.y * scaleFactorY, this.color);
    }

    /**
     * Calculates an inbetween of two Point2Ds.
     * @example
     * //returns the midpoint between A and B
     * A.weightedAverageWith(B, 0.5);
     * @param {Point2D} point - The other Point2D to average with.
     * @param {number} inbetween - Should be between _0_ and _1_, but also works with other values.
     * @returns A new Point2D calculated like: _**this** * (1-**inbetween**) + **point** * **inbetween**_.
     */
    weightedAverageWith(point = null, inbetween = 0.5) {
        /*
        *   TODO: maybe average the color as well
        */
        return new Point2D(this.x * (1-inbetween) + point.x * inbetween, this.y * (1-inbetween) + point.y * inbetween, this.color);
    }

    /**
     * Calculates the distance between two points with pythagoras using their coordinates.
     * @param {Point2D} point - The Point2D to which this will calculate the distance.
     * @returns The distance between **this** and **point**, or _0_ if **point** is _null_.
     */
    distanceTo(point = null) {
        if(!point) {
            return 0;
        }
        let dx = this.x - point.x;
        let dy = this.y - point.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Compares two Point2Ds and checks if their coordinates (and maybe also colors) are identical.
     * @param {Point2D} point - The Point2D to compare **this** with.
     * @param {boolean} strict - Set this to _true_ if the colors should also be taken into account. 
     * @returns _true_ iff the two Point2Ds have the same coordinates (and iff the **color**-attribute
     * is also the same, but this condition is only checked if **strict** is set to _true_).
     */
    equals(point = null, strict = false) {
        if(!point) {
            return false;
        }
        if(this.x !== point.x || this.y !== point.y) {
            return false;
        }
        if(strict && this.color !== point.color) {
            return false;
        }
        return true;
    }

    /**
     * Changes the inherent color of the Point2D.
     * @param {color} color - The new color of the Point2D.
     */
    setColor(color = activeColor) {
        this.color = color;
    }

    /**
     * Transforms the Point2D from coordinate system units to viewport units aka CSS pixels.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values (in coordinate
     * system units) that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns A new Point2D that was transformed to viewport coordinates, so between 0 and the
     * maximum the canvas will show, if it's visible.
     */
    toViewport(bottomLeftPoint = new Point2D(0,0), visibleWidth = 1, visibleHeight = 1, canvasWidth = 1, canvasHeight = 1) {
        const scaleFactorX = canvasWidth/visibleWidth;
        const scaleFactorY = -canvasHeight/visibleHeight;
        return this.translate(bottomLeftPoint.scale(-1)).scale(scaleFactorX, scaleFactorY).translate(null, 0, canvasHeight);
    }

    /**
     * Transforms the Point2D from viewport units aka CSS pixels to coordinate system units WITHOUT
     * translating it to the correct position.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns A new Point2D that was transformed from viewport coordinates to coordinate system coordinates.
     */
    toCoordinateSystemWithoutTranslation(visibleWidth = 1, visibleHeight = 1, canvasWidth = 1, canvasHeight = 1) {
        const scaleFactorX = visibleWidth/canvasWidth;
        const scaleFactorY = -visibleHeight/canvasHeight;
        return this.scale(scaleFactorX, scaleFactorY);
    }

    /**
     * Checks if a Point2D needs to be drawn.
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns true or false, depending on if the Point (in CSS pixels) will be visible on the canvas.
     */
    isVisible(canvasWidth = 100, canvasHeight = 100) {
        return this.x >= 0 && this.y >= 0 && this.x <= canvasWidth && this.y <= canvasHeight;
    }
}