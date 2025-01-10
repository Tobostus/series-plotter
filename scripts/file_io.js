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

let variables = {}
let series = []

/**
 * Adds the given list of variables to the to-be-exported XML file structure.
 * @param {...[String, any]} variablesToSave - A list of variables to save (as multiple parameters).
 * Each variable should be passed as a tuple _[name, value]_.
 */
export function addAndSetVariables(...variablesToSave) {
    for(let variable of variablesToSave) {
        const variableName = variable[0];
        if(typeof(variable[1]) === "undefined") {
            throw new Error("Fehler beim Hinzufügen einer Variable: Hat Typ \"undefined\": " + variableName);
        }
        variables[variableName] = variable[1];
    }
}

/**
 * Adds the given list of series inputs to the to-be-exported XML file structure.
 * @param {...[String, String, boolean]} seriesToSave - A list of series inputs to save (as multiple parameters).
 * Each series should be passed as a tuple _[input, color, hidden]_.
 */
export function addAndSetSeries(...seriesToSave) {
    for(let item of seriesToSave) {
        series.push(item);
    }
}

/**
 * Removes all variables from the list that would be saved to the XML file.
 */
export function clearAllVariables() {
    variables = {};
}

/**
 * @returns The **variables** object.
 */
export function getImportedVariables() {
    return variables;
}

/**
 * Removes all series from the list that would be saved to the XML file.
 */
export function clearAllSeries() {
    series = [];
}

/**
 * @returns The **series** list.
 */
export function getImportedSeries() {
    return series;
}

/**
 * Creates an XML file with the content of variables that will then be automatically downloaded.
 */
export function exportXML() {
    const xmlContent = createXMLStringFromVariables();
    downloadXML('series-plotter.xml', xmlContent);
}

/**
 * @param {String} str - The string to be sanitized, so that it is likely not malicious.
 * @returns A sanitized string.
 */
export function sanitize(str) {
    if(/^(\#\uhhhhhh|\d+\.?\d*)$/.test(str)) {
        return str;
    }
    console.log("Potenziell gefährlicher String gefunden: \"" + str + "\".\nStattdessen nehmen wir \"1\".");
    return "1";
}

/**
 * Parses **varValue** to **varType** if that is a necessary case.
 * @param {String} varType - The type of the value.
 * @param {varType} varValue - The value to be parsed.
 * @returns The **varValue** as a **varType** if the the case exists. Otherwise it will return varValue unchanged.
 */
function parseToType(varType, varValue) {
    let value;
    switch(varType) {
        case 'number':
            value = Number(varValue);
            if(!isNaN(value)) { return value; }
            throw new Error("Keine Number: " + varValue);
        case 'boolean':
            if(varValue === "true") {
                return true;
            }
            if(varValue === "false") {
                return false;
            }
            throw new Error("Kein Boolean: " + varValue);
        default:
            return sanitize(varValue);
    }
}

/**
 * Reads an XML file and puts all values into **variables**. This does not reset **variables**,
 * but it does overwrite any existing data for the same variable names.
 * @param {File} file - The XML file to be imported.
 * @returns A Promise that resolves if the file has finished loading and rejects if there has been an error.
 */
export function importXML(file) {

    return new Promise((resolve, reject) => {

        if(!file) {
            reject(new Error("Datei existiert nicht."));
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const parser = new DOMParser();
            const xmlFile = parser.parseFromString(e.target.result, "application/xml");

            if(xmlFile.getElementsByTagName('parseerror').length > 0) {
                console.error("Fehler beim Parsen der XML-Datei.");
                return;
            }

            const variablesFromFile = xmlFile.documentElement.childNodes[1].childNodes;
            for(let node of variablesFromFile) {
                let variableName, variableType, variableValue;

                if(node.nodeType === Node.ELEMENT_NODE) {
                    variableName = node.nodeName;

                    for(let childNode of Array.from(node.childNodes)) {
                        if(childNode.nodeType === Node.ELEMENT_NODE) {
                            switch(childNode.nodeName) {
                                case 'type':
                                    variableType = childNode.textContent;
                                case 'value':
                                    variableValue = childNode.textContent;
                            }
                        }
                    }
                    try {
                        variables[String(variableName)] = parseToType(variableType, variableValue);
                    } catch(e) {
                        reject(e);
                    }
                }
            }

            const seriesFromFile = xmlFile.documentElement.childNodes[3].childNodes;
            for(let node of seriesFromFile) {
                let input, color, isVisible;

                if(node.nodeType === Node.ELEMENT_NODE) {
                    for(let childNode of Array.from(node.childNodes)) {
                        if(childNode.nodeType === Node.ELEMENT_NODE) {
                            switch(childNode.nodeName) {
                                case 'input':
                                    input = childNode.textContent;
                                case 'color':
                                    color = childNode.textContent;
                                case 'isVisible':
                                    isVisible = childNode.textContent;
                            }
                        }
                    }
                    try {
                        isVisible = parseToType("boolean", isVisible);
                    } catch(e) {
                        reject(e);
                    }
                    series.push([input, color, isVisible]);
                }
            }
            resolve("Datei erfolgreich geladen.");
        }

        reader.onerror = function() {
            reject(new Error("Datei konnte nicht gelesen werden."));
        }

        reader.readAsText(file);
    });
}

/**
 * Creates the XML file structure as a string and returns it.
 * @returns The XML file in the form of a string.
 */
function createXMLStringFromVariables() {

    let xmlString   = '<?xml version="1.0" encoding="UTF-8"?>\n'
                    + '<xml>\n'
                    + '  <variables>\n';

    for(const [key, value] of Object.entries(variables)) {
        xmlString  += `    <${key}>\n`
                    + `      <type>${typeof(value)}</type>\n`
                    + `      <value>${value}</value>\n`
                    + `    </${key}>\n`;
    }
    xmlString      += '  </variables>\n'
                    + '  <series>\n';
    
    for(let index in series) {
        const [input, color, hidden] = series[index];
        xmlString  += `    <series${index}>\n`
                    + `      <input>${input}</input>\n`
                    + `      <color>${color}</color>\n`
                    + `      <isVisible>${hidden}</isVisible>\n`
                    + `    </series${index}>\n`;
    }
    xmlString      += '  </series>\n'
                    + '</xml>';

    return xmlString;
}

/**
 * Creates a dummy HTMLElement, clicks and then deletes it to download the XML file with
 * the name **filename** and content **xmlContent**.
 * @param {String} filename - What the downloaded file should be called by default.
 * @param {String} xmlContent - What should be the content of the file.
 */
function downloadXML(filename, xmlContent) {
    const blob = new Blob([xmlContent], {type: 'application/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}