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

import Point2D from "./Point2D.js";

/**
 * @class A label that has a content, a Point2D as an anchor, two offset values in CSS pixels,
 * an alignment, a baseline and a rotation.
 */
export default class Label {
    /**
     * @param {String} content - The String that this Label should display.
     * @param {Point2D} anchor - A Point2D that defines relative to where exactly the text should be placed.
     * @param {number} offsetX - Offset in x-direction (of the text) in CSS pixels.
     * @param {number} offsetY - Offset in y-direction (of the text) in CSS pixels.
     * @param {String} alignment - Best options: _"left"_ or _"right"_.
     * @param {String} baseline - Best options: _"top"_ or _"bottom"_.
     * @param {number} rotation - The rotation (in radians) that should be applied to the text.
     * You may need to adjust the offsets accordingly.
     */
    constructor(content = "", anchor = new Point2D(), offsetX = 0, offsetY = 0, alignment = null, baseline = null, rotation = 0) {
        this.content = content;
        this.anchor = anchor;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.alignment = alignment;
        this.baseline = baseline;
        this.rotation = rotation;

        if(this.alignment == null) {
            this.alignment = "right";
        }
        if(this.baseline == null) {
            this.baseline = "top";
        }
    }

    /**
     * Transforms the Label from coordinate system units to viewport units aka CSS pixels.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns A new Label with its anchor transformed to viewport coordinates.
     */
    toViewport(bottomLeftPoint = new Point2D(0,0), visibleWidth = 1, visibleHeight = 1, canvasWidth = 1, canvasHeight = 1) {
        return new Label(this.content, this.anchor.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight), this.offsetX, this.offsetY, this.alignment, this.baseline, this.rotation);
    }
}