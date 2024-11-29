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
import Line2D from "./Line2D.js";
import Label from "./Label.js";
import { clickableColor } from "../uiupdater.js";

/**
 * A coordinate system that can be scaled and subdivided to one's liking.
 * Once initialized, you can retrieve Line2Ds, Point2D and Labels that can then be drawn to a canvas.
 */
export default class CoordinateSystem {
    /**
     * @param {number} stepSizeX - Determines after how many units in x-direction the next subdivision should be drawn.
     * @param {number} stepSizeY - Determines after how many units in y-direction the next subdivision should be drawn.
     * @param {boolean} enableGridLines - If _false_, the grid lines will not be drawn.
     */
    constructor(stepSizeX, stepSizeY, enableGridLines, xAxisName = "ℕ", yAxisName = "ℝ") {
        this.setResolution(stepSizeX, stepSizeY);
        this.origin = new Point2D();
        this.lineRadiusFactor = 1/150;
        this.arrowLengthFactor = 1/50;
        this.arrowWidthFactor = 1/100;
        this.paddingFactor = 1/100;
        this.enableGridLines = enableGridLines;

        this.xAxisName = xAxisName;
        this.yAxisName = yAxisName;

        this.changedCenterX = false;
        this.changedCenterY = false;
        this.centerX = null;
        this.centerY = null;
        this.changedGridX = false;
        this.changedGridY = false;
        this.gridSectionsX = [];
        this.gridSectionsY = [];
    }
    
    /**
     * Sets a new name for the x-Axis.
     * @param {String} newName - Either _"natural"_ or _"real"_. The corresponding symbol will then be set in this method.
     * If **newName** has a value other than those two, it will be used as the new label.
     */
    setXAxisName(newName = "natural") {
        if(newName === "natural") {
            this.xAxisName = "ℕ";
            return;
        }
        if(newName === "real") {
            this.xAxisName = "ℝ";
            return;
        }
        this.xAxisName = newName;
    }

    /**
     * Sets a new resolution and automatically recalculates its elements with the next call of the getter **getLinesToDraw()**.
     * @param {number} stepSizeX - Determines after how many units in x-direction the next subdivision should be drawn.
     * @param {number} stepSizeY - Determines after how many units in y-direction the next subdivision should be drawn.
     */
    setResolution(stepSizeX = null, stepSizeY = null) {
        if(!stepSizeX && !stepSizeY) {
            return;
        }
        if(stepSizeX > 0) {
            this.stepSizeX = stepSizeX;
        }
        if(stepSizeY > 0) {
            this.stepSizeY = stepSizeY;
        }
        this.setChanged();
    }

    /**
     * Tells the coordinate system to recalculate its elements with the next call of the getter **getLinesToDraw()**.
     * **getLinesToDraw()** should always be called when using this class.
     */
    setChanged() {
        this.changedCenterX = true;
        this.changedCenterY = true;
        this.changedGridX = true;
        this.changedGridY = true;
    }

    /**
     * Calculates where the subdivisions of the coordinate system should start in x-direction.
     * The result is saved in **this.centerX**. Only updates if **this.changedCenterX** is set to
     * _true_, or if **this.centerX** has never been set before.
     * @param {number} bottomLeftX - The smallest x-value that is still visible on the canvas (in coordinate system units).
     * @param {number} visibleWidth - The width of the canvas (in coordinate system units).
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     */
    setCenterX(bottomLeftX, visibleWidth, paddingX) {
        if(!this.changedCenterX && this.centerX) {
            return;
        }
        this.centerX = this.origin.x;
        if(this.centerX < bottomLeftX + paddingX) {
            const stepsOffset = Math.floor((bottomLeftX + paddingX - this.centerX)/this.stepSizeX);
            this.centerX = this.centerX + stepsOffset * this.stepSizeX;
        }
        if(this.centerX > bottomLeftX + visibleWidth - paddingX) {
            const stepsOffset = Math.floor((this.centerX - bottomLeftX - visibleWidth + paddingX)/this.stepSizeX);
            this.centerX = this.centerX - stepsOffset * this.stepSizeX;
        }
        this.changedCenterX = false;
    }

    /**
     * Calculates where the subdivisions of the coordinate system should start in y-direction.
     * The result is saved in **this.centerY**. Only updates if **this.changedCenterY** is set to 
     * _true_, or if **this.centerY** has never been set before.
     * @param {number} bottomLeftY - The smallest y-value that is still visible on the canvas (in coordinate system units).
     * @param {number} visibleWidth - The height of the canvas (in coordinate system units).
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     */
    setCenterY(bottomLeftY, visibleHeight, paddingY) {
        if(!this.changedCenterY && this.centerY) {
            return;
        }
        this.centerY = this.origin.y;
        if(this.centerY < bottomLeftY + paddingY) {
            const stepsOffset = Math.floor((bottomLeftY + paddingY - this.centerY)/this.stepSizeY);
            this.centerY = this.centerY + stepsOffset * this.stepSizeY;
        }
        if(this.centerY > bottomLeftY + visibleHeight - paddingY) {
            const stepsOffset = Math.floor((this.centerY - bottomLeftY - visibleHeight + paddingY)/this.stepSizeY);
            this.centerY = this.centerY - stepsOffset * this.stepSizeY;
        }
        this.changedCenterY = false;
    }

    /**
     * Precalculates the x-coordinates of all subdivisions (used for grid lines and text) and saves
     * them in the array **this.gridSectionsX**. Only updates if **this.changedGridX** is set to 
     * _true_, or if **this.gridSectionsX** has never been calculated before.
     * @param {number} minX - The smallest value of x (in coordinate system units) that can be the position of a subdivision.
     * @param {number} maxX - The biggest value of x (in coordinate system units) that can be the position of a subdivision.
     */
    setGridSectionsX(minX, maxX) {
        if(!this.changedGridX && this.gridSectionsX.length > 0) {
            return;
        }
        this.gridSectionsX = [];
        for(let x = this.centerX + this.stepSizeX; x < maxX; x += this.stepSizeX) {
            if(x==0) continue;
            this.gridSectionsX.push(x);
        }
        for(let x = this.centerX - this.stepSizeX; x >= minX; x -= this.stepSizeX) {
            if(x==0) continue;
            this.gridSectionsX.push(x);
        }
    }

    /**
     * Precalculates the y-coordinates of all subdivisions (used for grid lines and text) and saves
     * them in the array **this.gridSectionsY**. Only updates if **this.changedGridY** is set to
     * _true_, or if **this.gridSectionsY** has never been calculated before.
     * @param {number} minX - The smallest value of y (in coordinate system units) that can be the position of a subdivision.
     * @param {number} maxX - The biggest value of y (in coordinate system units) that can be the position of a subdivision.
     */
    setGridSectionsY(minY, maxY) {
        if(!this.changedGridY && this.gridSectionsY.length > 0) {
            return;
        }
        this.gridSectionsY = [];
        for(let y = this.centerY + this.stepSizeY; y < maxY; y += this.stepSizeY) {
            if(y==0) continue;
            this.gridSectionsY.push(y);
        }
        for(let y = this.centerY - this.stepSizeY; y >= minY; y -= this.stepSizeY) {
            if(y==0) continue;
            this.gridSectionsY.push(y);
        }
    }

    /**
     * Calculates all lines that are part of the x-axis.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - The width of the canvas (in coordinate system units).
     * @param {number} lineRadius - How far the subdivision lines on the x-axis should protrude in each direction.
     * @param {number} arrowLength - How long the arrow at the tip of the x-axis should be.
     * @param {number} arrowWidth - Similar to **lineRadius**: How wide the arrow at the tip of the x-axis should be in each direction.
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     * @returns An array of Line2Ds containing every part of the x-axis that needs to be drawn on the canvas.
     */
    calculateXAxis(bottomLeftPoint, visibleWidth, lineRadius, arrowLength, arrowWidth, paddingX) {
        if(this.origin.y < bottomLeftPoint.y) {
            return null;
        }
        const startOfLine = new Point2D(bottomLeftPoint.x + paddingX, this.origin.y);
        const endOfLine = new Point2D(bottomLeftPoint.x + visibleWidth - paddingX, this.origin.y);
        const leftArrowEnd = endOfLine.translate(null, -arrowLength, arrowWidth);
        const rightArrowEnd = endOfLine.translate(null, -arrowLength, -arrowWidth);

        let lines = [new Line2D(startOfLine, endOfLine), new Line2D(endOfLine, leftArrowEnd),
            new Line2D(endOfLine, rightArrowEnd), new Line2D(leftArrowEnd, rightArrowEnd)];
        
        for(let x of this.gridSectionsX) {
            lines.push(new Line2D(this.origin.translate(null, x, lineRadius),
                this.origin.translate(null, x, -lineRadius)));
        }
        return lines;
    }

    /**
     * Calculates all lines that are part of the y-axis.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleHeight - The height of the canvas (in coordinate system units).
     * @param {number} lineRadius - How far the subdivision lines on the y-axis should protrude in each direction.
     * @param {number} arrowLength - How long the arrow at the tip of the y-axis should be.
     * @param {number} arrowWidth - Similar to **lineRadius**: How wide the arrow at the tip of the y-axis should be in each direction.
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     * @returns An array of Line2Ds containing every part of the y-axis that needs to be drawn on the canvas.
     */
    calculateYAxis(bottomLeftPoint, visibleHeight, lineRadius, arrowLength, arrowWidth, paddingY) {
        if(this.origin.x < bottomLeftPoint.x) {
            return null;
        }
        const startOfLine = new Point2D(this.origin.x, bottomLeftPoint.y + paddingY);
        const endOfLine = new Point2D(this.origin.x, bottomLeftPoint.y + visibleHeight - paddingY);
        const leftArrowEnd = endOfLine.translate(null, -arrowWidth, -arrowLength);
        const rightArrowEnd = endOfLine.translate(null, arrowWidth, -arrowLength);

        let lines = [new Line2D(startOfLine, endOfLine), new Line2D(endOfLine, leftArrowEnd),
            new Line2D(endOfLine, rightArrowEnd), new Line2D(leftArrowEnd, rightArrowEnd)];

        for(let y of this.gridSectionsY) {
            lines.push(new Line2D(this.origin.translate(null, -lineRadius, y),
                this.origin.translate(null, lineRadius, y)));
        }
        return lines;
    }

    /**
     * Calculates all grid lines that are perpendicular to the x-axis.
     * @param {number} bottomLeftY - The smallest y-value that is still visible on the canvas (in coordinate system units).
     * @param {number} visibleHeight - The height of the canvas (in coordinate system units).
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     * @returns An array of Line2Ds containing a grid line at every position of a subdivision in x-direction.
     * Result is an empty array if **this.enableGridLines** is set to _false_.
     */
    calculateGridLinesX(bottomLeftY, visibleHeight, paddingY) {
        if(!this.enableGridLines) {
            return [];
        }

        const topRightY = bottomLeftY + visibleHeight;
        let lines = [];
        for(let x of this.gridSectionsX) {
            lines.push(new Line2D(new Point2D(x, bottomLeftY + paddingY, clickableColor),
                new Point2D(x, topRightY - paddingY, clickableColor)));
        }
        return lines;
    }

    /**
     * Calculates all grid lines that are perpendicular to the y-axis.
     * @param {number} bottomLeftX - The smallest x-value that is still visible on the canvas (in coordinate system units).
     * @param {number} visibleWidth - The width of the canvas (in coordinate system units).
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     * @returns An array of Line2Ds containing a grid line at every position of a subdivision in y-direction.
     * Result is an empty array if **this.enableGridLines** is set to _false_.
     */
    calculateGridLinesY(bottomLeftX, visibleWidth, paddingX) {
        if(!this.enableGridLines) {
            return [];
        }

        const topRightX = bottomLeftX + visibleWidth;
        let lines = [];
        for(let y of this.gridSectionsY) {
            lines.push(new Line2D(new Point2D(bottomLeftX + paddingX, y, clickableColor),
                new Point2D(topRightX - paddingX, y, clickableColor)));
        }
        return lines;
    }

    /**
     * @returns An array containing all Point2Ds of the coordinate system that should be drawn on the canvas.
     */
    getPointsToDraw() {
        return [this.origin];
    }

    /**
     * This method calculates and returns all Line2Ds associated with a coordinate system.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @returns An array containing all Line2Ds of the coordinate system that should be drawn on the canvas.
     */
    getLinesToDraw(bottomLeftPoint, visibleWidth, visibleHeight) {
        const paddingX = visibleWidth*this.paddingFactor;
        const paddingY = visibleHeight*this.paddingFactor;

        const arrowLengthX = visibleWidth*this.arrowLengthFactor;
        const minX = bottomLeftPoint.x + paddingX;
        const maxX = bottomLeftPoint.x + visibleWidth - paddingX - arrowLengthX;

        const arrowLengthY = visibleHeight*this.arrowLengthFactor;
        const minY = bottomLeftPoint.y + paddingY;
        const maxY = bottomLeftPoint.y + visibleHeight - paddingY - arrowLengthY;

        this.setCenterX(bottomLeftPoint.x, visibleWidth, paddingX);
        this.setCenterY(bottomLeftPoint.y, visibleHeight, paddingY);
        this.setGridSectionsX(minX, maxX);
        this.setGridSectionsY(minY, maxY);

        const xAxis = this.calculateXAxis(bottomLeftPoint, visibleWidth, visibleHeight*this.lineRadiusFactor,
            arrowLengthX, visibleHeight*this.arrowWidthFactor, paddingX);
        const yAxis = this.calculateYAxis(bottomLeftPoint, visibleHeight, visibleWidth*this.lineRadiusFactor,
            arrowLengthY, visibleWidth*this.arrowWidthFactor, paddingY);
        const gridLinesX = this.calculateGridLinesX(bottomLeftPoint.y, visibleHeight, paddingY);
        const gridLinesY = this.calculateGridLinesY(bottomLeftPoint.x, visibleWidth, paddingX);
        return gridLinesX.concat(gridLinesY).concat(xAxis).concat(yAxis);
    }

    /**
     * This is a helper method for **getLabelsToDraw()** - it calculates all parameters for the Label _"0"_ at the coordinates origin.
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @param {number} xAxisLevel - y-coordinate of the x-Axis (in coordinate system units), usually _0_.
     * @param {number} yAxisLevel - x-coordinate of the y-Axis (in coordinate system units), usually _0_.
     * @param {String} baselineX - Either _"top"_ or _"bottom"_.
     * @param {String} alignmentY - Either _"left"_ or _"right"_.
     * @param {number} offsetInX - Offset that is applied in x-direction if the origin itself is not visible.
     * @param {number} offsetInXJustForYAxis - Specific offset, if the origin is only off-screen in x-direction.
     * @param {number} offsetInYJustForXAxis - Specific offset, if the origin is only off-screen in y-direction.
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     * @returns A single Label for the origin (_"0"_) or _null_, if it's off-screen towards a corner of the canvas.
     */
    getOriginLabel(bottomLeftPoint, visibleWidth, visibleHeight, xAxisLevel, yAxisLevel, baselineX, alignmentY, offsetInX, offsetInXJustForYAxis, offsetInYJustForXAxis, paddingX, paddingY) {
        if(this.origin.x < bottomLeftPoint.x + paddingX || this.origin.x > bottomLeftPoint.x + visibleWidth) {
            if(this.origin.y < bottomLeftPoint.y + paddingY || this.origin.y > bottomLeftPoint.y + visibleHeight) {
                // not visible, in the direction of a corner of the canvas
                return null;
            }
            // only off in x-direction
            return new Label("0", new Point2D(yAxisLevel, 0), -5 + offsetInX + offsetInXJustForYAxis, 2, alignmentY, null);
        }

        if(this.origin.y < bottomLeftPoint.y + paddingY) {
            // only off in y-direction, bottom
            return new Label("0", new Point2D(0, xAxisLevel), -5 + offsetInX, 3 + offsetInYJustForXAxis, null, baselineX);
        }

        if(this.origin.y > bottomLeftPoint.y + visibleHeight) {
            // only off in y-direction, top
            return new Label("0", new Point2D(0, xAxisLevel), -8 + offsetInX, 3 + offsetInYJustForXAxis, null, baselineX);
        }

        // origin is visible normally
        return new Label("0", this.origin, -5, 3);
    }

    /**
     * This is a helper method for **getLabelsToDraw()** - it calculates all parameters for the Label at the x-axis' tip.
     * @param {number} xAxisLevel - y-coordinate of the x-Axis (in coordinate system units), usually 0.
     * @param {number} bottomLeftY - The smallest y-value that is still visible on the canvas (in coordinate system units).
     * @param {Point2D} topRightPoint - The Point2D with the largest x- and y-coordinates that will still be drawn on the canvas.
     * @param {number} arrowLength - How long the arrow at the tip of the x-axis should be.
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     * @returns A Label for the x-axis, usually a symbol for the natural numbers.
     */
    getXAxisLabel(xAxisLevel, bottomLeftY, topRightPoint, arrowLength, paddingX, paddingY) {
        if(xAxisLevel < bottomLeftY + paddingY || xAxisLevel > topRightPoint.y - paddingY) {
            return null;
        }
        return new Label(this.xAxisName, new Point2D(topRightPoint.x - arrowLength - paddingX, xAxisLevel), -4, -2, "right", "bottom");
    }
    
    /**
     * This is a helper method for **getLabelsToDraw()** - it calculates all parameters for the Label at the y-axis' tip.
     * @param {number} yAxisLevel - x-coordinate of the y-Axis (in coordinate system units), usually 0.
     * @param {number} bottomLeftX - The smallest x-value that is still visible on the canvas (in coordinate system units).
     * @param {Point2D} topRightPoint - The Point2D with the largest x- and y-coordinates that will still be drawn on the canvas.
     * @param {number} arrowLength - How long the arrow at the tip of the y-axis should be.
     * @param {number} paddingX - How many coordinate system units should be left empty in x-direction, as padding.
     * @param {number} paddingY - How many coordinate system units should be left empty in y-direction, as padding.
     * @returns A Label for the y-axis, usually a symbol for the real numbers.
     */
    getYAxisLabel(yAxisLevel, bottomLeftX, topRightPoint, arrowLength, paddingX, paddingY) {
        if(yAxisLevel < bottomLeftX + paddingX || yAxisLevel > topRightPoint.x - paddingX) {
            return null;
        }
        return new Label(this.yAxisName, new Point2D(yAxisLevel, topRightPoint.y - arrowLength - paddingY), 4, 4, "left", "top");
    }

    /**
     * This method calculates all necessary margins and alignments to then return an array of all
     * Labels in a coordinate system.
     * To make sure the returned array is up to date, call **getLinesToDraw()** beforehand!
     * @param {Point2D} bottomLeftPoint - Point2D with the smallest x and y values that will still be drawn on the canvas.
     * @param {number} visibleWidth - How wide the content of the canvas is (in coordinate system units).
     * @param {number} visibleHeight - How tall the content of the canvas is (in coordinate system units).
     * @returns An array containing all Labels of the coordinate system that should be drawn on the canvas.
     */
    getLabelsToDraw(bottomLeftPoint, visibleWidth, visibleHeight) {
        const paddingX = visibleWidth*this.paddingFactor;
        const paddingY = visibleHeight*this.paddingFactor;

        const topRightPoint = bottomLeftPoint.translate(null, visibleWidth, visibleHeight);
        
        const arrowLengthX = visibleWidth*this.arrowLengthFactor;
        const arrowLengthY = visibleHeight*this.arrowLengthFactor;

        // getLinesToDraw will always be called beforehand, so no need to call the setters again

        let labels = [];
        
        let xAxisLevel = this.origin.y;
        let baseline = "top";
        let alignment = "right";
        let offsetInY = 0;
        let offsetInYJustForXAxis = 0;

        let yAxisLevel = this.origin.x;
        let offsetInX = 0;
        let offsetInXJustForYAxis = 0;

        const xAxisLabel = this.getXAxisLabel(xAxisLevel, bottomLeftPoint.y, topRightPoint,
            arrowLengthX, paddingX, paddingY);
        if(xAxisLabel) {
            labels.push(xAxisLabel);
        }

        const yAxisLabel = this.getYAxisLabel(yAxisLevel, bottomLeftPoint.x, topRightPoint,
            arrowLengthY, paddingX, paddingY);
        if(yAxisLabel) {
            labels.push(yAxisLabel);
        }

        if(xAxisLevel < bottomLeftPoint.y + paddingY) {
            xAxisLevel = bottomLeftPoint.y + paddingY;
            baseline = "bottom";
            offsetInY = -3;
        }
        if(yAxisLevel < bottomLeftPoint.x + paddingX) {
            yAxisLevel = bottomLeftPoint.x + paddingX;
            alignment = "left";
            offsetInX = 5;
        }

        if(xAxisLevel > topRightPoint.y) {
            xAxisLevel = topRightPoint.y - paddingY;
            offsetInYJustForXAxis = -5;
        }
        if(yAxisLevel > topRightPoint.x) {
            yAxisLevel = topRightPoint.x - paddingX;
            offsetInXJustForYAxis = 5;
        }

        for(let x of this.gridSectionsX) {

            let rotation = 0;
            let specificAlignment = alignment;
            let specificBaseline = baseline;
            let specificOffsetInX = 0;
            let specificOffsetInY = 0;
            if(Math.abs(x) >= 1000) {
                rotation = Math.PI/2;
                specificAlignment = baseline === "bottom" ? "right" : "left";
                specificBaseline = alignment === "left" ? "bottom" : "top";
                specificOffsetInY = baseline === "bottom" ? -5 : 0;
                specificOffsetInX = alignment === "left" ? -8 : 0;
            }

            labels.push(new Label(String(x), new Point2D(x, xAxisLevel), -3 + offsetInX + specificOffsetInX,
                3 + offsetInYJustForXAxis + specificOffsetInY, specificAlignment, specificBaseline, rotation));
        }
        for(let y of this.gridSectionsY) {
            labels.push(new Label(String(y), new Point2D(yAxisLevel, y), -5 + offsetInX + offsetInXJustForYAxis,
                2 + offsetInY, alignment, baseline));
        }
        
        const originLabel = this.getOriginLabel(bottomLeftPoint, visibleWidth, visibleHeight, xAxisLevel, yAxisLevel, baseline, alignment,
            offsetInX, offsetInXJustForYAxis, offsetInYJustForXAxis, paddingX, paddingY);
        if(originLabel) {
            labels.push(originLabel);
        }

        return labels;
    }
}