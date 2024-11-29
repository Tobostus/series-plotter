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
 * @class A two-dimensional line defined by its two endpoints (Point2Ds).
 */
export default class Line2D {
    /**
     * @param {Point2D} startPoint - One endpoint of the line.
     * @param {Point2D} endPoint - The other endpoint of the line.
     */
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    /**
     * Transforms the Line2D from coordinate system units to viewport units aka CSS pixels.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns A new Line2D that was transformed to viewport coordinates.
     */
    toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight) {
        return new Line2D(this.startPoint.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight), this.endPoint.toViewport(bottomLeftPoint, visibleWidth, visibleHeight, canvasWidth, canvasHeight));
    }

    /**
     * Checks if the Line2D's bounding box and that of the canvas overlap. Is used on Line2Ds that
     * have already been mapped with **toViewport()**.
     * @param {number} canvasWidth - How wide the canvas is (in CSS pixels).
     * @param {number} canvasHeight - How tall the canvas is (in CSS pixels).
     * @returns _false_ if there is no intersection, _true_ if there is.
     */
    isVisible(canvasWidth, canvasHeight) {
        const minX = Math.min(this.startPoint.x, this.endPoint.x);
        const maxX = Math.max(this.startPoint.x, this.endPoint.x);
        const minY = Math.min(this.startPoint.y, this.endPoint.y);
        const maxY = Math.max(this.startPoint.y, this.endPoint.y);

        if(maxX < 0 || maxY < 0) {
            return false;
        }
        if(minX > canvasWidth || minY > canvasHeight) {
            return false;
        }
        return true;
    }
}