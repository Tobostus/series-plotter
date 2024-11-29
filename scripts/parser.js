// This program visualizes mathematical series in a browser.
// Copyright (C) 2024  Jan Ole Egbers

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


/***
 * This file contains the functions necessary to parse several functions and store them seperately. for any given complex
 * value x and natural number n, the value of a choosen function can be calculated. All calculations are done in the
 * complex plane. The functions are given as strings and are parsed into a list of numbers and operations. The supported
 * functions are: plus, minus, times, divide, power, sinh, cosh, asin, sin, acos, cos, atan, tanh, sqrt, exp, log, abs, 
 * real part, imaginary part, complex conjugate, sum, product, integral, lg, ln, sign, acot, coth, tan, cot, floor and 
 * ceiling. All trigonometric functions calculate in radians.
 */

import { getInputSeries } from "./uiupdater.js";

/***
 * This paragraph contains the global variables used in fuctions in this file. It also includes the lists in which 
 * functions, parsed aswell as unparsed, and integrals are stored.
 */
let listOfParsedFuctionLists = [];
let listOfUnparsedFunctions = [];
let listOfStoredIntegrals = []; 
let operations = ["+", "-", "*", "/", "^", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "'", "~"];
let spectialOperations = ["sinh", "cosh", "asin", "sin", "acos", "cos", "atan", "tanh", "sqrt", "exp", "log", "abs", "re", "im", "conj", "sum", "prod", "int", "lg", "ln", "sign", "acot", "coth", "tan", "cot", "floor", "ceil", "pi", "e"];
let correspondingSymbols = [{"sinh" : "A"}, {"cosh" : "B"}, {"asin" : "C"}, {"sin" : "D"}, {"acos" : "E"}, {"cos" : "F"}, {"atan" : "G"}, {"tanh" : "H"}, {"sqrt" : "I"}, {"exp" : "J"}, {"log" : "K"}, {"abs" : "L"}, {"re" : "M"}, {"im" : "N"}, {"conj" : "O"}, {"sum" : "P"}, {"prod" : "Q"}, {"int" : "R"}, {"lg" : "S"}, {"ln" : "T"}, {"sign" : "U"}, {"acot" : "V"}, {"coth" : "W"}, {"tan" : "X"}, {"cot" : "Y"}, {"floor" : "Z"}, {"ceil" : "#"}, {"pi" : "'"}, {"e" : "~"}];
let simpleOperations = ["+", "-", "*", "/", "^"];
let specialOperationsAfterConversion = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "'", "~"];
let specialOperationsWithOneArgument = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "S" ,"T", "U", "V", "W", "X", "Y", "Z", "#", "'", "~"];
let specialOperationsWithTwoArguments = ["K"]; //log(a;b)
let specialOperationsWithFourArguments = ["P", "Q", "R"]; //sum(a;b;c;d), prod(a;b;c;d), int(a;b;c;d)

/***
 * This fuction gets a list of functions via @function getInputSeries and decides which need to be parsed and which can 
 * be used as they are.
 * @returns {Array} - List of parsed functions
 */
export function processInput(){
    let inputStringList = getInputSeries();
    let currendParcedFunctionsCopy = JSON.parse(JSON.stringify(listOfParsedFuctionLists));
    let currentListOfStoredIntgralsCopy = JSON.parse(JSON.stringify(listOfStoredIntegrals));
    listOfParsedFuctionLists = [];
    if(inputStringList.length == 0){
        listOfParsedFuctionLists.push(undefined);
        return "Error: No input";
    }
    for (let i = 0; i < inputStringList.length; i++){
        listOfParsedFuctionLists.push(null);
        listOfStoredIntegrals[i] = null;
    }
    for (let i = 0; i < inputStringList.length; i++){
        for (let j = 0; j < currendParcedFunctionsCopy.length; j++){
            if (inputStringList[i] == listOfUnparsedFunctions[j]){
                listOfParsedFuctionLists[i] = currendParcedFunctionsCopy[j];
                listOfStoredIntegrals[i] = currentListOfStoredIntgralsCopy[j];
            }
        }
        if (listOfParsedFuctionLists[i] == null){
            listOfParsedFuctionLists[i] = parsen(inputStringList[i], i);
        } 
        if (inputStringList[i] == null || inputStringList[i] == "") {
            listOfParsedFuctionLists[i] = undefined;
            // "Error: Invalid Input in function "
        }
    }
    return listOfParsedFuctionLists;
}

/***
 * This function takes an index and a value for x and n and returns the value of the function at that index given 
 * the values of x and n. It also checks if a real number is asked for and allows for a minor floating point error.
 * @param {Number} index - The index of the function in the list of parsed functions
 * @param {Number} xValue - The value of x. This can be a real number
 * @param {Array} xValue - The value of n. This can be a complex number
 * @param {Number} nValue - The value of n. This is supposed to be an integer
 * @returns {Number} - The value of the function at the given index and values of x and n. The result may be a real number
 * @returns {Array} - The value of the function at the given index and values of x and n. The result may be a complex number
 */
export function getNumericValue(index, xValue, nValue){
    if (listOfParsedFuctionLists[index] == null || listOfParsedFuctionLists[index] == undefined){
        return null;
    }
    let realSequence = false;
    if (xValue == parseFloat(xValue)){
        realSequence = true;
        xValue = [xValue, 0];
    }
    if(nValue == parseInt(nValue)){
        nValue = [nValue, 0];
    }
    if (realSequence) {
        let result = calculateFromList(listOfParsedFuctionLists[index], xValue, nValue, index);
        let imaginaryPartAbsolute = Math.abs(result[0][1]);
        if (imaginaryPartAbsolute < 0.0000000001) {
            return result[0][0];
        } else return NaN
    } else {
        let result = calculateFromList(listOfParsedFuctionLists[index], xValue, nValue, index);
        return result[0];
    }
}

/***
 * This function organizes the parsing of the input.
 * @param {String} input - The input that needs to be parsed
 * @param {Number} index - The index of the input in the list of unparsed functions and 
 * position in the list of parsed functions
 * @returns {Array} - The parsed input
 */
function parsen(input, index){
    listOfUnparsedFunctions[index] = input;
    let inputliste = [];
    let output = input;
    output = checkBrackets(output);
    if (output == undefined){
        return undefined;
    }
    output = checkSigns(output);
    if (output == undefined){
        return undefined;
    }
    output = functionUniformity(output);
    if (output == ""){
        return undefined;
    }
    output = absoluteValueMarker(output);
    if (output == undefined){
        return undefined;
    }
    output = checkDecimalPoints(output);
    if (output == undefined){
        return undefined;
    }
    output = replaceFunctionWithSymbols(output);
    output = piAndE(output);
    output = addMultiplicationForVariables(output);
    if (output == undefined){
        return undefined;
    }
    output = dealWithNegatives(output);
    output = degreeAndPercent(output);
    output = leadingZeros(output);
    output = addBracketsForOrderOfOperations(output);
    if(output == undefined){
        return undefined
    }
    output = checkValidVariables(output);
    if (output == undefined){
        return undefined;
    }
    output = preCalculate(output, index);
    inputliste = transcribeInputIntoList(output, inputliste);
    inputliste = translateNumbersToArray(inputliste);
    output = inputliste;
    return output;
}


/***
 * This function checks if the brackets are balanced.
 * @param {String} input - The input that needs to be checked
 * @returns {String} - The input if the brackets are balanced, undefined if they are not
 */
function checkBrackets(input){
    let counter = 0;
    for (let i = 0; i < input.length; i++){
        if (input[i] == "("){
            counter++;
            if (input[i+1] == ")"){
                // "Error: Empty brackets";
                return undefined;
            }
        }
        if (input[i] == ")"){
            counter--;
            if (counter < 0){
                // "Error: Brackets are not balanced (1)";
                return undefined;
            }
        }
    }
    if (counter != 0){
        // "Error: Brackets are not balanced (2)";
        return undefined;
    }
    return input;
}

/***
 * This function checks if there are two signs in a row.
 * @param {String} input - The input that needs to be checked
 * @returns {String} - The input if there are no two signs in a row, undefined if there are
 */
function checkSigns(input){
    for (let i = 0; i < input.length; i++){
        if (input[i] == "+" || input[i] == "-" || input[i] == "*" || input[i] == "/" || input[i] == "^"){
            if (input[i+1] == "+" || input[i+1] == "-" || input[i+1] == "*" || input[i+1] == "/" || input[i+1] == "^"){
                // = "Error: Two signs in a row";
                return undefined;
            }
        }
    }
    return input;
}

/***
 * This function converts expressions of the form |a| into abs(a). Furthermore if no corresponding closing bracket is found,
 * the function returns undefined.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input or undefined
 */
function absoluteValueMarker(input){
    let output = input;
    for (let i = 0; i < output.length; i++){
        if (output[i] == "|"){
            let counter = 0;
            let secondMarkerPosition = null;
            for (let j = i+1; j < output.length; j++){
                if (output[j] == "|"){
                    if (counter == 0){
                        secondMarkerPosition = j;
                        break;
                    }
                } else if(output[j] == "("){
                    counter++;
                } else if (output[j] == ")"){
                    counter--;
                }
            }
            if (secondMarkerPosition == null){
                return undefined;
            } else {
                output = output.substring(0, i) + "abs(" + output.substring(i+1, secondMarkerPosition) + ")" + output.substring(secondMarkerPosition+1, output.length);
            }
        }
    }
    return output;
}

/***
 * This function replaces the special functions with their corresponding abbreviations.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
 */
function functionUniformity(input){
    let output = input;
    output = output.replaceAll(" ", "");
    output = output.replaceAll("PI", "pi");
    let dictionary = [{"Pi" : "pi"}, {"E": "e"}, {"," : "."}, {"arcsin" : "asin"}, {"arccos" : "acos"}, {"arctan" : "atan"}, {"arccot" : "acot"}, {"arcsinh" : "asinh"}, {"arccosh" : "acosh"}, {"arctanh" : "atanh"}, {"arccoth" : "acoth"}, {"integral" : "int"}, {"product" : "prod"}];
    let toBeReplaced = ["Pi", "E", ",", "arcsin", "arccos", "arctan", "arccot", "arcsinh", "arccosh", "arctanh", "arccoth", "integral", "product"];
    for (let i = 0; i < dictionary.length; i++){
        output = output.replaceAll(toBeReplaced[i], dictionary[i][toBeReplaced[i]]);
    }
    return output;
}

/***
 * This function adds a multiplication sign between variables and numbers or variables and brackets.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
 */
function addMultiplicationForVariables(input){
    let output = input;
    let OperationsAndOpenBracket = ["+", "-", "*", "/", "^", "(", ";", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "'", "~"];
    let OperationsAndClosedBracket = ["+", "-", "*", "/", "^", ")", ";", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#", "'", "~"];
    let letters = ["(", "x", "n", "i", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y" ,"Z", "#", "'", "~"];
    letters = getIndexVariables(input, letters);
    if (letters == undefined){
        return undefined;
    }
    for (let j = 1; j < output.length; j++){
        if(letters.includes(output[j]) && !OperationsAndOpenBracket.includes(output[j-1])){
            output = output.substring(0, j) + "*" + output.substring(j, output.length);
        } else if (output[j] == ")" && !OperationsAndClosedBracket.includes(output[j+1]) && j+1 < output.length){
           output = output.substring(0, j+1) + "*" + output.substring(j+1, output.length);
        }
    }
    let flaggedInput = false;
    let allowedOtherCharacters = ["(", ")", ";", "+", "-", "*", "/", "^", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "."];
    for (let i = 0; i < output.length; i++){
        if(!letters.includes(output[i]) && !allowedOtherCharacters.includes(output[i])){
            flaggedInput = true;
        }
    }
    if(flaggedInput == true){
        return undefined;
    } else {
        return output;
    }
}

/***
 * This function finds the variables in sums, products and integrals.
 * @param {String} input - The input that may include the sums, products and integrals
 * @param {Array} letterList - The list of variables, function abbreviations and open brackets
 * @returns {Array} - The list of variables, function abbreviations and open brackets 
 * including the variables in sums, products and integrals
 */
function getIndexVariables(input, letterList){
    let additionalLetters = [];
    for (let i = 0; i < input.length; i++){
        if (specialOperationsWithFourArguments.includes(input[i])){
            let semicolonsFound = 0;
            for (let j = i+1; semicolonsFound < 3; j++){
                if (specialOperationsWithFourArguments.includes(input[j])){
                    semicolonsFound = semicolonsFound -3
                } else if (specialOperationsWithTwoArguments.includes(input[j])){
                    semicolonsFound = semicolonsFound - 1;
                } else if (input[j] == ";"){
                    semicolonsFound++;
                    if (semicolonsFound == 3){
                        additionalLetters.push(input[j+1]);
                    }
                }
            }

        }
    }
    if (additionalLetters.includes("x") || additionalLetters.includes("n") || additionalLetters.includes("i")){
        return undefined;
    }
    for (let i = 0; i < additionalLetters.length; i++){
        if (!letterList.includes(additionalLetters[i])){
            letterList.push(additionalLetters[i]);
        }
    }
    return letterList;
}

/***
 * This function replaces the special functions with their corresponding symbols.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
 */
function replaceFunctionWithSymbols(input){
    let output = input;
    for (let i = 0; i < spectialOperations.length; i++){
        let currentSymbol = correspondingSymbols[i][spectialOperations[i]];
        output = output.replaceAll(spectialOperations[i], currentSymbol);
    }
    return output;
}

/***
 * This function adds a zero in front of negative numbers turning them into a subtraction.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input that doesn't contain negative numbers
 */
function dealWithNegatives(input){
    if (input[0] == "-"){
        input = "0" + input;
    }
    for (let i = 1; i < input.length; i++){
        if (input[i] == "-" && input[i-1] == "("){
            input = input.substring(0, i) + "0" + input.substring(i, input.length);
        } else if(input[i] == "-" && input[i-1] == ";"){
            let rightBracket = findRightBracket(input, i);
            input = input.substring(0, i) + "(0" + input.substring(i, rightBracket) + ")" + input.substring(rightBracket, input.length);
        }
    }
    return input;
}

/***
 * This function replaces pi and e with their corresponding symbols nad are henceforde treated as functions.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
 */
function piAndE(input){
    let output = input;
    for (let i = 0; i < output.length; i++){
        if (output[i] == "'"){
            output = output.substring(0, i+1) + "(0)" + output.substring(i+1, output.length);
        } else if (output[i] == "~"){
            output = output.substring(0, i+1) + "(0)" + output.substring(i+1, output.length);
        }
    }
    return output;
}

/***
 * This function replaces the degree and percent symbols with the corresponding computations.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
 */
function degreeAndPercent(input){
    let output = input;
    for (let i = 0; i < output.length; i++){
        if (output[i] == "°"){
            let leftBracket = findLeftBracket(output, i);
            if(leftBracket == 0){
                output = "(" + output.substring(0, i) + "*Math.PI/180)" + output.substring(i+1, output.length);
            } else {
                output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, i) + "*Math.PI/180" + output.substring(i+1, output.length);
            }
        } else if (output[i] == "%"){
            let leftBracket = findLeftBracket(output, i);
            if(leftBracket == 0){
                output = "(" + output.substring(0, i) + "*0.01)" + output.substring(i+1, output.length);
            } else {
                output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, i) + "*0.01)" + output.substring(i+1, output.length);
            }
        }
    }
    return output;
}

/***
 * This function checks if there are two decimal points in a row.
 * @param {String} input - The input that needs to be checked
 * @returns {String} - The input if there are no two decimal points in a row, undefined if there are
 */
function checkDecimalPoints(input){
    for(let i = 0; i < input.length; i++){
        if (input[i] == "."){
            let j = i
            while (j > 0 && !operations.includes(input[j])){
                j--;
                if(input[j] == "."){
                    // "Error: Two decimal points in a row";
                    return undefined;
                }
            }
        }
    }
    return input;
}

/*** 
 * This function adds a zero in front of a decimal point if there is no number in front of it.
 * @param {String} input - The input that may need to be converted
 * @returns {String} - The converted input
*/
function leadingZeros(input){
    let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let i = 0; i < input.length; i++){
        if (input[i] == "."){
            if (i == 0){
                input = "0" + input;
            } else if (!digits.includes(input[i-1])){
                input = input.substring(0, i) + "0" + input.substring(i, input.length);
            }
        }
    }
    return input;
}

/***
 * This function adds brackets to the input to ensure the correct order of operations. 
 * After existing bracktets, special operations are given priority. Then Powers, 
 * then multiplication and division and finally addition and subtraction.
 * @param {String} input - The input that may needs to be changed to follow the order of operations
 * @returns {String} - The converted input
 */
function addBracketsForOrderOfOperations(input){
    let output = input;
    for(let i = output.length; i > 0; i--){
        if (output[i] == "^"){
            let leftBracket = findLeftBracket(output, i);
            output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, output.length);
            i++;
            let rightBracket = findRightBracket(output, i);
            output = output.substring(0, rightBracket) + ")" + output.substring(rightBracket, output.length);
            
        }
    }
    for(let i = 0; i < output.length; i++){
        if (output[i] == "*" || output[i] == "/"){
            let leftBracket = findLeftBracket(output, i);
            output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, output.length);
            i++;
            let rightBracket = findRightBracket(output, i);
            output = output.substring(0, rightBracket) + ")" + output.substring(rightBracket, output.length);
        }
    }
    for(let i = 0; i < output.length; i++){
        if (output[i] == "+" || output[i] == "-"){
            let leftBracket = findLeftBracket(output, i);
            output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, output.length);
            i++;
            let rightBracket = findRightBracket(output, i);
            output = output.substring(0, rightBracket) + ")" + output.substring(rightBracket, output.length);
        }
    }
    for(let i = 0; i < output.length; i++){
        if (specialOperationsAfterConversion.includes(output[i])){
            if(specialOperationsAfterConversion.includes(output[i+1])){
            return undefined;
            }
            let leftBracket = i;
            let iterator = i+2;
            let counter = 1
            while (counter != 0){
                if (output[iterator] == "("){
                    counter++;
                } else if (output[iterator] == ")"){
                    counter--;
                }
                iterator++;
            }
            let rightBracket = iterator;
            output = output.substring(0, leftBracket) + "(" + output.substring(leftBracket, rightBracket) + ")" + output.substring(rightBracket, output.length);
            i++;
        }
    }
    return output;
}

/***
 * Given an input and a position therein, this functions finds the position where the left bracket needs to 
 * be added to ensure the correct order of operations.
 * @param {String} input - The input that may need to be changed to follow the order of operations
 * @param {Number} index - The position in the input the operation is located
 * @returns {Number} - The position where the left bracket needs to be added
 */
function findLeftBracket(input, index){
    let counter = 0;
    for (let j = index-1; j > 0; j--){
        if (input[j] == ";" && counter == 0){
            return j+1;
        }
        if (input[j] == ")"){
            counter++;
        }
        if (input[j] == "("){
            counter--;
            if (counter < 0){
                return j;
            }
        }
        if (counter == 0 && simpleOperations.includes(input[j])){
            return j+1;
        }
    }
    return 0;
}

/***
 * Given an input and a position therein, this functions finds the position where the right bracket needs to
 * be added to ensure the correct order of operations.
 * @param {String} input - The input that may need to be changed to follow the order of operations
 * @param {Number} index - The position in the input the operation is located
 * @returns {Number} - The position where the right bracket needs to be added
 */
function findRightBracket(input, index){
    let counter = 0;
    for (let j = index+1; j < input.length; j++){
        if (input[j] == ";" && counter == 0){
            return j;
        }
        if (input[j] == "("){
            counter++;
        }
        if (input[j] == ")"){
            counter--;
            if (counter < 0){
                return j;
            }
        }
        if (counter == 0 && simpleOperations.includes(input[j])){
            return j;
        }
    }
    return input.length;
}


/***
 * This function checks if the input contains only valid variables. If any other character is found, the input is is retuned
 * as undefined.
 * @param {String} input - The input that may need to be checked
 * @returns {String} - The input if it only contains valid variables, undefined if it contains any other character
 */
function checkValidVariables(input){
    let allowedSymbols = ["x", "n", "i", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y" ,"Z", "#", "'", "~", "(", ")", ";", "+", "-", "*", "/", "^", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "."];
    let specialOperationWithFourArgumentsCounter = 0;
    let semicolonsToBeFoundCounterList = [];
    semicolonsToBeFoundCounterList[0] = 0;
    let otherFoundSymbols = [];
    for (let i = 0; i < input.length; i++){
        if (!allowedSymbols.includes(input[i]) && !otherFoundSymbols.includes(input[i])){
            otherFoundSymbols.push(input[i]);
        } else if (specialOperationsWithFourArguments.includes(input[i])){
            specialOperationWithFourArgumentsCounter++;
            semicolonsToBeFoundCounterList[semicolonsToBeFoundCounterList.length] = 3;
        } else if (specialOperationsWithTwoArguments.includes(input[i])){
            semicolonsToBeFoundCounterList[semicolonsToBeFoundCounterList.length-1]++;
        } else if (input[i] == ";"){
            semicolonsToBeFoundCounterList[semicolonsToBeFoundCounterList.length-1]--;
            if(semicolonsToBeFoundCounterList[semicolonsToBeFoundCounterList.length-1] == 0 && semicolonsToBeFoundCounterList.length > 1){
                i++;
                otherFoundSymbols = removeValidVariables(otherFoundSymbols, input[i]);
                if (allowedSymbols.includes(input[i])){
                    return undefined;
                }
                specialOperationWithFourArgumentsCounter--;
                i++;
            }
        }

        if (otherFoundSymbols.length > specialOperationWithFourArgumentsCounter){
            return undefined;
        }
    }
    return input;
}

/***
 * This is a helper function for the above @checkValidVariables. if a variable is deemed valid, it is removed from the list.
 * @param {Array<String>} nonBaseVariables - The list of variables that are not allowed
 * @param {String} input - The variable to be removed form the list
 * @returns {Array<String>} - The list of variables that are not yet deemed valid but were found in the input
 */
function removeValidVariables(nonBaseVariables, input){
    let newList = [];
    for (let i = 0; i < nonBaseVariables.length; i++){
        if (nonBaseVariables[i] != input){
            newList.push(nonBaseVariables[i]);
        }
    }
    return newList;
}

/***
 * This function finds brackets that don't contain "x" or "n" and calculates them. The simplified string is then
 * returned. To not dublicate the work. bracktes that are inside other brackets not calculated recursively 
 * if the outerbracket needs to be calculated.
 * @param {String} input - The input of which parts may be calculated in advance
 * @returns {String} - The simplified input
 */
function preCalculate(input, index){
    //finding the brackets
    let potentialBrackets = [];
    let bracketPairs = [];
    let variables = ["x", "n"];
    for (let i = 0; i < input.length; i++){
        if (specialOperationsWithFourArguments.includes(input[i])){
            let semicolonsFound = 0;
            for (let j = i+1; semicolonsFound < 3; j++){
                if (input[j] == ";"){
                    semicolonsFound++;
                    if (semicolonsFound == 3){
                        if (!variables.includes(input[j+1])){
                            variables.push(input[j+1]);
                        }
                    }
                }
            }
        }
    }
    for (let i = 0; i < input.length; i++){
        if (input[i] == "("){
            potentialBrackets.push(i);
        } else if (variables.includes(input[i])){
            potentialBrackets = [];
        } else if (input[i] == ")"){
            if (potentialBrackets.length != 0){
                bracketPairs.push([potentialBrackets.pop(),i]);
            }
        }
    }
    //if there are neither "x" nor "n" the bounds of sums, products or interals, the internal function may be evaluated
    for(let i = 0; i < input.length; i++){
        if(specialOperationsWithFourArguments.includes(input[i])){
            let semicolonsFound = 0;
            let noVariablesInBounds = true;
            let position = i+1;
            for (let j = position; semicolonsFound < 2; j++){
                if (input[j] == ";"){
                    semicolonsFound++;
                }
                if (input[j] == "x" || input[j] == "n"){
                    noVariablesInBounds = false;
                }
                position++;
            }
            if (noVariablesInBounds){
                for (let k = 0; k < 1; k++){
                    k--;
                    if (input[position] == "("){
                        potentialBrackets.push(position);
                    } else if (variables.includes(input[position])){
                        potentialBrackets = [];
                    } else if (input[position] == ")"){
                        if (potentialBrackets.length != 0){
                            bracketPairs.push([potentialBrackets.pop(),position]);
                        }
                    } else if (input[position] == ";"){
                        k++;
                    }
                    position++
                }
            }
        }
    }
    //If there are neither "x" nor "n" in the entire sum, product or integral, the function is evaluated
    for (let i = 0; i < input.length; i++){
        if (specialOperationsWithFourArguments.includes(input[i])){
            let semicolonsFound = 0;
            let noXorN = true;
            let position = i+2;
            let counter = 0;
            for (let j = position; semicolonsFound < 3; j++){
                if (input[j] == "("){
                    counter++;
                } else if (input[j] == ")"){
                    counter--;
                } else if (input[j] == ";" && counter == 0){
                    semicolonsFound++;
                } else if (input[j] == "x" || input[j] == "n"){
                    noXorN = false;
                }
                position++;
            }
            if (noXorN){
                bracketPairs.push([i, position+1]);
            }
        }
    }
    // if there are brackets in bracketPairs that are inside other brackets, they are removed
    let toBeRemoved = [];
    for (let i = 0; i < bracketPairs.length; i++){
        for (let j = 0; j < bracketPairs.length; j++){
            if (bracketPairs[i][0] > bracketPairs[j][0] && bracketPairs[i][1] < bracketPairs[j][1]){
                toBeRemoved.push(bracketPairs[i]);
            }
        }
    }
    //removes doublicates
    for(let i = 0; i < bracketPairs.length; i++){
        for (let j = i+1; j < bracketPairs.length; j++){
            if (bracketPairs[i][0] == bracketPairs[j][0] && bracketPairs[i][1] == bracketPairs[j][1]){
                toBeRemoved.push(bracketPairs[i]);
            }
        }
    }
    //orders the final list of bracket pairs
    let finalPairList = [];
    for (let i = bracketPairs.length-1; i >= 0; i--){
        if (!toBeRemoved.includes(bracketPairs[i])){
            finalPairList.push(bracketPairs[i]);
        }
    }
    //calculating the brackets
    for (let i = 0; i < finalPairList.length; i++){
        let resultList = [];
        resultList = transcribeInputIntoList(input.substring(finalPairList[i][0], finalPairList[i][1]+1), resultList);
        resultList = translateNumbersToArray(resultList);
        let result = calculateFromList(resultList, [1 , 0], [1,0], index)[0];
        result = complexNumberToString(result);
        input = input.substring(0, finalPairList[i][0]) + result + input.substring(finalPairList[i][1]+1, input.length);
    }
    return input;
}

/***
 * This function converts a complex number into a string. This is needes so that the partial results 
 * from @function preCalculate can be inserted into the input. This includes the results of
 *  @function dealWithNegatives, @function addBracketsForOrderOfOperations and @function addMultiplicationForVariables
 * if necessary so that the functions need not be called again.
 * @param {Array} input - The complex number that needs to be converted
 * @returns {String} - The converted complex number
 */
function complexNumberToString(input){
    if(input[0] < 0){
        if (input[1] < 0){
            return "((0-" + Math.abs(input[0]) + ")-(" + Math.abs(input[1]) + "*i))";
        } else if(input[1] > 0){
            return "((0-" + Math.abs(input[0]) + ")+(" + input[1] + "*i))";
        } else {
            return "(0-" + Math.abs(input[0]) + ")";
        }
    } else if (input[0] > 0){
        if (input[1] < 0){
            return "(" + input[0] + "-(" + Math.abs(input[1]) + "*i))";
        } else if (input[1] > 0){
            return "(" + input[0] + "+(" + input[1] + "*i))";
        } else {
            return "(" + input[0] + ")";
        }
    } else {
        if (input[1] < 0){
            return "(0-(" + Math.abs(input[1]) + "*i))";
        } else if (input[1] > 0){
            return "(" + input[1] + "*i)";
        } else {
            return "0";
        }
    }
}

/***
 * This function transcribes the input into a list of numbers and operations where the operator is placed before 
 * the relevant operands simpler calculations. This function calls the frunctions
 * @function transcribeSimpleOperation, @function transcibeSpecialOperationWithOneArgument,
 * @function transcribeSpecialOperationsWithFourArguments and @function transcribeSpecialOperationsWithFourArguments
 * to deal with the different operations.
 * @param {String} input - The input that needs to be transcribed
 * @param {Array} listPositionList - The list in which the array is to be stored
 * @returns {Array} - The transcribed input
 */
function transcribeInputIntoList(input, listPositionList){
    let operatorPosition = null;
    let counter = 0;
    for( let i = 0; i < input.length; i++){
        if (input[i] == "("){
            counter++;
        } else if (input[i] == ")"){
            counter--;
        } else if (operations.includes(input[i]) && counter == 0){
            operatorPosition = i;
        }
    }
    if (operatorPosition == null){
        if (input[0] == "("){
            listPositionList = transcribeInputIntoList(input.substring(1, input.length-1), listPositionList);
        } else{
            listPositionList.push(input);
        }
    } else if (operations.includes(input[operatorPosition])){
        listPositionList.push(input[operatorPosition]);
        if (simpleOperations.includes(input[operatorPosition])){
            // "+", "-", "*", "/", "^"
            listPositionList = transcribeSimpleOperation(input, operatorPosition, listPositionList);
        } else if (specialOperationsWithOneArgument.includes(input[operatorPosition])){
            // sin, cos, tan, asin, acos, atan, sqrt, exp, abs, re, im, conj, lg, ln , sign, acot, cot, tanh, coth, floor, ceil, pi, e
            listPositionList = transcibeSpecialOperationWithOneArgument(input, operatorPosition, listPositionList);
        } else if (specialOperationsWithTwoArguments.includes(input[operatorPosition])){
            // log
            listPositionList = transcribeSpecialOperationsWithTwoArguments(input, operatorPosition, listPositionList);
        } else if (specialOperationsWithFourArguments.includes(input[operatorPosition])){
            // sum, prod, int
            listPositionList = transcribeSpecialOperationsWithFourArguments(input, operatorPosition, listPositionList);
        }
    }
    return listPositionList;
}

/***
 * This function transcribes a simple operation into a list of numbers and operations.
 * @param {String} input - The input that needs to be transcribed
 * @param {Number} operatorPosition - The position of the operator in the input
 * @param {Array} listPositionList - The list in which the array is to be stored
 * @returns {Array} - The transcribed input
 */
function transcribeSimpleOperation (input, operatorPosition, listPositionList){
    let operand1 = "";
    let operand2 = "";
    operand1 = input.substring(0, operatorPosition);
    operand2 = input.substring(operatorPosition+1, input.length);
    if (operand1[0] == "("){
        listPositionList = transcribeInputIntoList(operand1.substring(1, operand1.length-1), listPositionList);
    } else {
        listPositionList.push(operand1);
    }
    if (operand2[0] == "("){
        listPositionList = transcribeInputIntoList(operand2.substring(1, operand2.length-1), listPositionList);
    } else {
        listPositionList.push(operand2);
    }
    return listPositionList;
}

/***
 * This function transcribes a special operation with one argument into a list of numbers and operations.
 * @param {String} input - The input that needs to be transcribed
 * @param {Number} operatorPosition - The position of the operator in the input
 * @param {Array} listPositionList - The list in which the array is to be stored
 * @returns {Array} - The transcribed input
 */
function transcibeSpecialOperationWithOneArgument(input, operatorPosition, listPositionList){
    let operand = "";
    operand = input.substring(operatorPosition+2, input.length-1);
    if (operand[0] == "("){
        listPositionList = transcribeInputIntoList(operand.substring(1, operand.length-1), listPositionList);
    } else {
        listPositionList.push(operand);
    }
    return listPositionList;
}

/***
 * This function transcribes a special operation with two arguments into a list of numbers and operations (Only log(x;y)).
 * @param {String} input - The input that needs to be transcribed
 * @param {Number} operatorPosition - The position of the operator in the input
 * @param {Array} listPositionList - The list in which the array is to be stored
 * @returns {Array} - The transcribed input
 */
function transcribeSpecialOperationsWithTwoArguments(input, operatorPosition, listPositionList){
    let semicolonposition = null;
    let counter = 0;
    for (let i = operatorPosition+2; i < input.length; i++){
        if (input[i] == ";" && counter == 0){
            if (semicolonposition == null){
                semicolonposition = i;
            }
        } else if (input[i] == "("){
            counter++;
        } else if (input[i] == ")"){
            counter--;
        }
    }
    listPositionList = transcribeInputIntoList(input.substring(operatorPosition+2, semicolonposition), listPositionList);
    listPositionList = transcribeInputIntoList(input.substring(semicolonposition+1, input.length-1), listPositionList);

    return listPositionList;
}

/***
 * This function transcribes a special operation with four arguments into a list of numbers and operations (Only sum(x;y;z;w), prod(x;y;z;w) and int(x;y;z;w)).
 * @param {String} input - The input that needs to be transcribed
 * @param {Number} operatorPosition - The position of the operator in the input
 * @param {Array} listPositionList - The list in which the array is to be stored
 * @returns {Array} - The transcribed input
 */
function transcribeSpecialOperationsWithFourArguments(input, operatorPosition, listPositionList){
    let semicolonposition1 = null;
    let semicolonposition2 = null;
    let semicolonposition3 = null;
    let counter = 0;
    for (let i = operatorPosition+2; i < input.length; i++){
        if (input[i] == ";" && counter == 0){
            if (semicolonposition1 == null){
                semicolonposition1 = i;
            } else if (semicolonposition2 == null){
                semicolonposition2 = i;
            } else if (semicolonposition3 == null){
                semicolonposition3 = i;
            }
        } else if (input[i] == "("){
            counter++;
        } else if (input[i] == ")"){
            counter--;
        }
    }
    listPositionList = transcribeInputIntoList(input.substring(operatorPosition+2, semicolonposition1), listPositionList);
    listPositionList = transcribeInputIntoList(input.substring(semicolonposition1+1, semicolonposition2), listPositionList);
    listPositionList = transcribeInputIntoList(input.substring(semicolonposition2+1, semicolonposition3), listPositionList);
    listPositionList.push(input.substring(semicolonposition3+1, input.length-1));
    return listPositionList;
}

/***
 * This function translates the numbers and the imaginary unit into an array representing complex numbers where
 * the first entry is the real part and the second is the imaginary one.
 * @param {Array} listPositionList - The list that needs to be converted
 * @returns {Array} - The converted list
 */
function translateNumbersToArray(listPositionList){
    let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let i = 0; i < listPositionList.length; i++){
        if (digits.includes(listPositionList[i][0])){
            listPositionList[i] = [parseFloat(listPositionList[i]), 0];
        } else if (listPositionList[i] == "i"){
            listPositionList[i] = [0, 1];
        }
    }
    return listPositionList;
}

/***
 * This function calculates the result of the input list for a given x and n value by calling all necessarry 
 * functions in order.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} xValue - The value of x. This is an array representing a complex number
 * @param {Number} nValue - The value of n. This is an array representing a natural number with its 
 * imaginary part being zero
 * @param {Number} result - The result of the calculation
 */
function calculateFromList(inputListe, xValue, nValue, index){
    let listCopy = JSON.parse(JSON.stringify(inputListe));
    for (let i = 0; i < listCopy.length; i++){
        if (listCopy[i] == "x"){
            listCopy[i] = xValue;
        } else if (listCopy[i] == "n"){
            listCopy[i] = nValue;
        }
    }
    let position = 0;
    return callFunctions(listCopy, position, index);
}

/***
 * This function calls the functions that are needed to calculate the result of the input list depending on the entry 
 * in the array. The position is the position in the array where the function is located.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located. This position must be given 
 * to all called fuctions to ensure the order of operations is being kept.
 * @returns {Array} - The result of the current calculation and the position in the array where the function is located
 */
function callFunctions(inputListe, position, index){
    if (!operations.includes(inputListe[position])){
        return [inputListe[position], position+1];
    } else if (inputListe[position] == "+"){
        return callPlus(inputListe, position, index);
    } else if (inputListe[position] == "-"){
        return callMinus(inputListe, position, index);
    } else if (inputListe[position] == "*"){
        return callMultiply(inputListe, position, index);
    } else if (inputListe[position] == "/"){
        return callDivide(inputListe, position, index);
    } else if (inputListe[position] == "^"){
        return callPower(inputListe, position, index);
    } else if (inputListe[position] == "A"){
        return callSinh(inputListe, position, index);
    } else if (inputListe[position] == "B"){
        return callCosh(inputListe, position, index);
    } else if (inputListe[position] == "C"){
        return callArcsin(inputListe, position, index);
    } else if (inputListe[position] == "D"){
        return callSin(inputListe, position, index);
    } else if (inputListe[position] == "E"){
        return callArccos(inputListe, position, index);
    } else if (inputListe[position] == "F"){
        return callCos(inputListe, position, index);
    } else if (inputListe[position] == "G"){
        return callArctan(inputListe, position, index);
    } else if (inputListe[position] == "H"){
        return callTanh(inputListe, position, index);
    } else if (inputListe[position] == "I"){
        return callSqrt(inputListe, position, index);
    } else if (inputListe[position] == "J"){
        return callExp(inputListe, position, index);
    } else if (inputListe[position] == "K"){
        return callLog(inputListe, position, index);
    } else if (inputListe[position] == "L"){
        return callAbs(inputListe, position, index);
    } else if (inputListe[position] == "M"){
        return callRe(inputListe, position, index);
    } else if (inputListe[position] == "N"){
        return callIm(inputListe, position, index);
    } else if (inputListe[position] == "O"){
        return callConj(inputListe, position, index);
    } else if (inputListe[position] == "P"){
        return callSum(inputListe, position, index);
    } else if (inputListe[position] == "Q"){
        return callProduct(inputListe, position, index);
    } else if (inputListe[position] == "R"){
        return callIntegral(inputListe, position, index);
    } else if (inputListe[position] == "S"){
        return callLg(inputListe, position, index);
    } else if (inputListe[position] == "T"){
        return callLn(inputListe, position, index);
    } else if (inputListe[position] == "U"){
        return callSign(inputListe, position, index);
    } else if (inputListe[position] == "V"){
        return callArccot(inputListe, position, index);
    } else if (inputListe[position] == "W"){
        return callCoth(inputListe, position, index);
    } else if (inputListe[position] == "X"){
        return callTan(inputListe, position, index);
    } else if (inputListe[position] == "Y"){
        return callCot(inputListe, position, index);
    } else if (inputListe[position] == "Z"){
        return callFloor(inputListe, position, index);
    } else if (inputListe[position] == "#"){
        return callCeil(inputListe, position, index);
    } else if (inputListe[position] == "'"){
        return callPi(inputListe, position, index);
    } else if (inputListe[position] == "~"){
        return callE(inputListe, position, index);
    }
}

//start of the calculating functions



/***
 * This function calculates the sum of the complex numbers numberA and numberB.
 * @param {Array} numberA - The first complex number
 * @param {Array} numberB - The second complex number
 * @returns {Array} - The sum of the two complex numbers
 */
function addNumbers(numberA, numberB){
    return [numberA[0] + numberB[0], numberA[1] + numberB[1]];
}

/***
 * This function calls the above @function addNumbers with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The sum of the two complex numbers and the position in the array 
 * where the information for the next argument is being stored
 */
function callPlus(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [addNumbers(call1[0], call2[0]), position,]; 
}

/***
 * This function calculates the difference of the complex numbers numberA and numberB.
 * @param {Array} numberA - The first complex number, the minuend
 * @param {Array} numberB - The second complex number, the subtrahend
 * @returns {Array} - The difference of the two complex numbers
 */
function subtractNumbers(numberA, numberB){
    return [numberA[0] - numberB[0], numberA[1] - numberB[1]];
}

/***
 * This function calls the above @function subtractNumbers with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The difference of the two complex numbers and the position in the array
 * where the information for the next argument is being stored
 */
function callMinus(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [subtractNumbers(call1[0], call2[0]), position];
}

/***
 * This function calculates the product of the complex numbers numberA and numberB.
 * @param {Array} numberA - The first complex number
 * @param {Array} numberB - The second complex number
 * @returns {Array} - The product of the two complex numbers
 */
function multiplyNumbers(numberA, numberB){
    return [numberA[0]*numberB[0] - numberA[1]*numberB[1], numberA[0]*numberB[1] + numberA[1]*numberB[0]];
}

/***
 * This function calls the above @function multiplyNumbers with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The product of the two complex numbers and the position in the array
 * where the information for the next argument is being stored
 */
function callMultiply(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [multiplyNumbers(call1[0], call2[0]), position];
}

/***
 * This function calculates the division of the complex numbers numberA and numberB.
 * @param {Array} numberA - The first complex number, the dividend
 * @param {Array} numberB - The second complex number, the divisor
 * @returns {Array} - The quotient of the two complex numbers
 */
function divideNumbers(numberA, numberB){
    let denominator = numberB[0]*numberB[0] + numberB[1]*numberB[1];
    return [(numberA[0]*numberB[0] + numberA[1]*numberB[1])/denominator, (numberA[1]*numberB[0] - numberA[0]*numberB[1])/denominator];
}

/***
 * This function calls the above @function divideNumbers with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The quotient of the two complex numbers and the position in the array
 * where the information for the next argument is being stored
 */
function callDivide(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [divideNumbers(call1[0], call2[0]), position];
}

/***
 * This function calculates the power of the complex numbers numberA to the complex number numberB.
 * @param {Array} numberA - The first complex number, the base
 * @param {Array} numberB - The second complex number, the exponent
 * @returns {Array} - The result of the power operation
 */
function powerNumbers(numberA, numberB){
    if (numberA[0] == 0 && numberA[1] == 0){
        return [0, 0];
    }
    let baseFactor = (numberA[0]*numberA[0] + numberA[1]*numberA[1]);
    let argument = Math.atan2(numberA[1], numberA[0]);
    let realFactor = Math.pow(baseFactor, numberB[0]/2)*Math.exp(-1*numberB[1]*argument);
    return [realFactor*Math.cos(numberB[0]*argument + 0.5*Math.log(baseFactor)*numberB[1]), realFactor*Math.sin(numberB[0]*argument + 0.5*Math.log(baseFactor)*numberB[1])];
}
/***
 * This function calls the above @function powerNumbers with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the power operation and the position in the array
 * where the information for the next argument is being stored
 */
function callPower(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [powerNumbers(call1[0], call2[0]), position];
}

/***
 * This function calculates the sine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the sine is to be calculated
 * @returns {Array} - The result of the sine operation 
 */
function sinNumber(numberA){
    return [Math.sin(numberA[0])*Math.cosh(numberA[1]), Math.cos(numberA[0])*Math.sinh(numberA[1])];
}

/***
 * This function calls the above @function sinNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the sine calculation and the position in the array 
 * where the information for the next argument is being stored
 */
function callSin(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [sinNumber(call1[0]), position];
}

/***
 * This function calculates the cosine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the cosine is to be calculated
 * @returns {Array} - The result of the cosine operation
 */
function cosNumber(numberA){
    return [Math.cos(numberA[0])*Math.cosh(numberA[1]), -1*Math.sin(numberA[0])*Math.sinh(numberA[1])];
}

/***
 * This function calls the above @function cosNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the cosine calculation and the position int the array
 * where the information for the next argument is being stored
 */
function callCos(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [cosNumber(call1[0]), position];
}

/***
 * This function calculates the tangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the tangent is to be calculated
 * @returns {Array} - The result of the tangent operation
 */
function tanNumber(numberA){
    return divideNumbers(sinNumber(numberA), cosNumber(numberA));
}

/***
 * This function calls the above @function tanNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the tangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callTan(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [tanNumber(call1[0]), position];
}

/***
 * This function calculates the arcus sine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the arcus sine is to be calculated
 * @returns {Array} - The result of the arcus sine operation
 */
function arcsinNumber(numberA){
    let sumOfSquares = numberA[0]*numberA[0] + numberA[1]*numberA[1];
    return [signPlusRealNumber(numberA[0])/2*Math.acos(Math.sqrt(Math.pow(sumOfSquares - 1, 2) + 4*numberA[1]*numberA[1])-sumOfSquares), signPlusRealNumber(numberA[1])/2*acoshRealNumber(Math.sqrt(Math.pow(sumOfSquares - 1, 2) + 4*numberA[1]*numberA[1])+sumOfSquares)];
}

/***
 * This function calls the above @function arcsinNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the arcsine calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callArcsin(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [arcsinNumber(call1[0]), position];
}

/***
 * This function calculates the sign+ of a real number. This being -1 if the number 
 * is negative and 1 if the number is positive or zero. This is a helper function for the @function arcsinNumber.
 * @param {Number} realNumber - The real number of which the sign+ is to be calculated
 * @returns {Number} - The sign+ of the real number
 */
function signPlusRealNumber(realNumber){
    if (realNumber >= 0){
        return 1;
    } else {
        return -1;
    }
}

/***
 * This function calculates the hyperbolic arccosine of a real number. This is a helper function for the 
 * @function arcsinNumber.
 * @param {Number} realNumber - The real number of which the hyperbolic arccosine is to be calculated
 * @returns {Number} - The hyperbolic arccosine of the real number or NaN if no real result exists
 */
 function acoshRealNumber(realNumber){
    if (realNumber >= 1){
        return Math.log(realNumber + Math.sqrt(realNumber*realNumber - 1));
    } else {
        return NaN;
    }
}

/***
 * This function calculates the arcus cosine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the arcus cosine is to be calculated
 * @returns {Array} - The result of the arcus cosine operation
 */
function arccosNumber(numberA){
    return subtractNumbers([Math.PI/2, 0], arcsinNumber(numberA));
}

/***
 * This function calls the above @function arccosNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the arccosine calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callArccos(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [arccosNumber(call1[0]), position];
}

/***
 * This function calculates the arcus tangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the arcus tangent is to be calculated
 * @returns {Array} - The result of the arcus tangent operation
 */
function arctanNumber(numberA){
    let realPart = null;
    let zwischenergebnis = 2*numberA[1]/(numberA[0]*numberA[0] + numberA[1]*numberA[1] + 1);
    let imaginaryPart = 1/4*Math.log((1+zwischenergebnis)/(1-zwischenergebnis));
    if (numberA[0] == 0) {
        if(abs(numberA[1] > 1)){
            realPart = Math.PI/2*Math.sign(numberA[1]);
        } else {
            realPart = 0;
        }
    } else {
        realPart = 1/2*(Math.atan((numberA[0]*numberA[0] + numberA[1]*numberA[1] - 1)/(2*numberA[0]))+Math.PI/2*Math.sign(numberA[0]));
    }
    return [realPart, imaginaryPart];
}

/***
 * This function calls the above @function arctanNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the arctangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callArctan(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [arctanNumber(call1[0]), position];
}

/***
 * This function calculates the square root of a complex number numberA.
 * @param {Array} numberA - The complex number of which the square root is to be calculated
 * @returns {Array} - The result of the square root operation
 */
function sqrtNumber(numberA){
    let normierungsfaktor = Math.sqrt(numberA[0]*numberA[0] + numberA[1]*numberA[1]);
    return [Math.sqrt((normierungsfaktor + numberA[0])/2), signPlusRealNumber(numberA[1])*Math.sqrt((normierungsfaktor - numberA[0])/2)];
}

/***
 * This function calls the above @function sqrtNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the square root calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callSqrt(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [sqrtNumber(call1[0]), position];
}

/***
 * This function calculates the exponential function of a complex number numberA.
 * @param {Array} numberA - The complex number of which the exponential function is to be calculated
 * @returns {Array} - The result of the exponential function
 */
function expNumber(numberA){
    return [Math.exp(numberA[0])*Math.cos(numberA[1]), Math.exp(numberA[0])*Math.sin(numberA[1])];
}

/***
 * This function calls the above @function expNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the exponential function and the position in the array
 * where the information for the next argument is being stored
 */
function callExp(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [expNumber(call1[0]), position];
}

/***
 * This function calculates the logarithm of a complex number numberA to the base of a complex number numberB.
 * @param {Array} numberA - The complex number, the logarithm of which is to be calculated
 * @param {Array} numberB - The complex number, the base of the logarithm
 * @returns {Array} - The result of the logarithm operation
 */
function logNumber(numberA, numberB){
    if (numberB[0] == 1 && numberB[1] == 0){
        return NaN;
    } else {
        return divideNumbers(lnNumber(numberA), lnNumber(numberB));
    }
}

/***
 * This function calls the above @function logNumber with the following numbers or calls for their calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the logarithm operation and the position in the array
 * where the information for the next argument is being stored
 */
function callLog(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    let call2 = callFunctions(inputListe, position, index);
    position = call2[1];
    return [logNumber(call1[0], call2[0]), position];
}

/***
 * This function calculates the absolute value of a complex number numberA.
 * @param {Array} numberA - The complex number of which the absolute value is to be calculated
 * @returns {Array} - The result of the absolute value operation
 */
function absoluteValueNumber(numberA){
    return [Math.sqrt(numberA[0]*numberA[0] + numberA[1]*numberA[1]), 0];
}

/***
 * This function calls the above @function absoluteValueNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the absolute value operation and the position in the array
 * where the information for the next argument is being stored
 */
function callAbs(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [absoluteValueNumber(call1[0]), position];
}

/***
 * This function calculates the real part of a complex number numberA.
 * @param {Array} numberA - The complex number of which the real part is to be calculated
 * @returns {Array} - The real part of the complex number
 */
function realPartNumber(numberA){
    return [numberA[0], 0];
}

/***
 * This function calls the above @function realPartNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The real part of the complex number and the position in the array
 * where the information for the next argument is being stored
 */
function callRe(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [realPartNumber(call1[0]), position];
}

/***
 * This function calculates the imaginary part of a complex number numberA. That being the b in a+bi,which is a real number.
 * @param {Array} numberA - The complex number of which the imaginary part is to be calculated
 * @returns {Array} - The imaginary part of the complex number
 */
function imaginaryPartNumber(numberA){
    return [numberA[1], 0];
}

/***
 * This function calls the above @function imaginaryPartNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The imaginary part of the complex number and the position in the array
 * where the information for the next argument is being stored
 */
function callIm(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [imaginaryPartNumber(call1[0]), position];
}

/***
 * This function calculates the complex conjugate of a complex number numberA.
 * @param {Array} numberA - The complex number of which the complex conjugate is to be calculated
 * @returns {Array} - The complex conjugate of the complex number
 */
function conjugateNumber(numberA){
    return [numberA[0], -1*numberA[1]];
}

/***
 * This function calls the above @function conjugateNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The complex conjugate of the complex number and the position in the array
 * where the information for the next argument is being stored
 */
function callConj(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [conjugateNumber(call1[0]), position];
}

/***
 * This function calculates the sum of the numbers from lowerBound to upperBound for a given internal function and
 * a counting variable. UpperBound and lowerBound must be natural numbers after they've been calculated.
 * @param {Number} lowerBound - The lower bound of the sum
 * @param {Number} upperBound - The upper bound of the sum
 * @param {Array} internalFunction - The function that is to be calculated for each number in the sum
 * @param {String} variable - The counting variable of the sum
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the sum operation
 */
function sumNumber(lowerBound, upperBound, internalFunction, variable, index){
    if (lowerBound > upperBound){
        return [0, 0];
    }
    if (lowerBound != Math.floor(lowerBound) || upperBound != Math.floor(upperBound)){
        return NaN
    }
    let sum = [0, 0];
    for (let i = lowerBound; i <= upperBound; i++){
        let newFunction = JSON.parse(JSON.stringify(internalFunction));
        for(let j = 0; j < newFunction.length; j++){
            if (newFunction[j] == variable){
                newFunction[j] = [i,0];
            }
        }
        sum = addNumbers(sum, calculateFromList(newFunction, 0, 0, index)[0]);
        
    }
    return sum;
}

/***
 * This function calls the above @function sumNumber with the lower and upper bound or calls for their calculation. In
 * addition the internal function and the counting variable are being given to the @function sumNumber. This only
 * occurs if the upper and lower bound are real numbers.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the sum operation and the position in the array
 * where the information for the next argument is being stored
 */
function callSum(inputListe, position, index){
    position++;
    let lowerBound = callFunctions(inputListe, position, index);
    position = lowerBound[1];
    let upperBound = callFunctions(inputListe, position, index);
    position = upperBound[1];
    let sumList = [];
    let remainingOperandsCounter = 1;
    while (remainingOperandsCounter > 0){
        sumList.push(inputListe[position]);
        if (!operations.includes(inputListe[position])){
            remainingOperandsCounter--;
        } else if(specialOperationsWithTwoArguments.includes(inputListe[position]) || simpleOperations.includes(inputListe[position])){
            remainingOperandsCounter++;
        } else if (specialOperationsWithFourArguments.includes(inputListe[position])){
            remainingOperandsCounter = remainingOperandsCounter + 3;
        }  // remaining case: Special Operations with one argument do now change the remainingOperantsCounter
        position++;
    }
    let countingVariable = inputListe[position];
    if(lowerBound[0][1] != 0 || upperBound[0][1] != 0){
        return NaN;
    }
    return [sumNumber(lowerBound[0][0], upperBound[0][0], sumList, countingVariable, index), position];
}

/***
 * This function calculates the product of the numbers from lowerBound to upperBound for a given internal function and
 * a counting variable. UpperBound and lowerBound must be natural numbers after they've been calculated.
 * @param {Number} lowerBound - The lower bound of the product
 * @param {Number} upperBound - The upper bound of the product
 * @param {Array} internalFunction - The function that is to be calculated for each number in the product
 * @param {String} variable - The counting variable of the product
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the product operation
 */
function productNumber(lowerBound, upperBound, internalFunction, variable, index){
    if (lowerBound > upperBound){
        return [1, 0];
    }
    if (lowerBound != Math.floor(lowerBound) || upperBound != Math.floor(upperBound)){
        return NaN
    }
    let product = [1, 0];
    for (let i = lowerBound; i <= upperBound; i++){
        let newFunction = JSON.parse(JSON.stringify(internalFunction));
        for (let j = 0; j < newFunction.length; j++){
            if (newFunction[j] == variable){
                newFunction[j] = [i, 0];
            }
        }
        product = multiplyNumbers(product, calculateFromList(newFunction, 0, 0, index)[0]);
    }
    return product;
}

/***
 * This function calls the above @function productNumber with the lower and upper bound or calls for their calculation. In
 * addition the internal function and the counting variable are being given to the @function productNumber. This only
 * occurs if the upper and lower bound are real numbers.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the product operation and the position in the array
 * where the information for the next argument is being stored
 */
function callProduct(inputListe, position, index){
    position++;
    let lowerBound = callFunctions(inputListe, position, index);
    position = lowerBound[1];
    let upperBound = callFunctions(inputListe, position, index);
    position = upperBound[1];
    let productList = [];
    let remainingOperandsCounter = 1;
    while (remainingOperandsCounter > 0){
        productList.push(inputListe[position]);
        if (!operations.includes(inputListe[position])){
            remainingOperandsCounter--;
        } else if(specialOperationsWithTwoArguments.includes(inputListe[position]) || simpleOperations.includes(inputListe[position])){
            remainingOperandsCounter++;
        } else if (specialOperationsWithFourArguments.includes(inputListe[position])){
            remainingOperandsCounter = remainingOperandsCounter + 3;
        }  // remaining case: Special Operations with one argument do now change the remainingOperantsCounter
        position++;
    }
    let countingVariable = inputListe[position];
    if(lowerBound[0][1] != 0 || upperBound[0][1] != 0){
        return NaN;
    }
    return [productNumber(lowerBound[0][0], upperBound[0][0], productList, countingVariable, index), position];
}

/***
 * This function calculates the integral of the internal function from lowerBound to upperBound with respect to the counting
 * variable. The integral is approximated by the Riemann sum with a given accuracy. The upper and lower bound must be real
 * numbers after they've been calculated.
 * @param {Number} lowerBound - The lower bound of the integral
 * @param {Number} upperBound - The upper bound of the integral
 * @param {Array} internalFunction - The function that is to be integrated
 * @param {String} variable - The counting variable of the integral
 * @param {Number} numberOfSteps - The number of steps for the Riemann sum
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the integral operation
 */
function integralNumber(lowerBound, upperBound, internalFunction, variable, numberOfSteps, index){
    if(lowerBound == upperBound){
        return [0, 0];
    }
    let integral = [0, 0];
    if (lowerBound > upperBound){
        return multiplyNumbers([-1,0], integralNumber(upperBound, lowerBound, internalFunction, variable, numberOfSteps));
    }
    let stepSize = (upperBound-lowerBound)/numberOfSteps;
    for(let iterator = lowerBound; iterator < upperBound; iterator = iterator + stepSize){
        let newFunction = JSON.parse(JSON.stringify(internalFunction));
        for(let j = 0; j < newFunction.length; j++){
            if(newFunction[j] == variable){
                newFunction[j] = [iterator, 0];
            }
        }
        let currentFunctionHight = calculateFromList(newFunction, 0, 0, index)[0]
        if (currentFunctionHight[0] == NaN || currentFunctionHight[1] == NaN){
            currentFunctionHight = [0, 0];
        }
        integral = addNumbers(integral, multiplyNumbers(currentFunctionHight,[stepSize, 0]));
    }
    return integral;
}

/***
 * This function compares the integral which is to be calculated with the stored integrals. It calls the above
 * @function integralNumber to calculate the integral if no match is found. If a match, an integral which only differs
 * in its bounds, is found, the difference in the bounds is integrated via above @function integralNumber and added to or 
 * subtracted from the integral. If the new integral's bounds differ from any stored integral's bounds by more than the 
 * integral width,the new integral is stored. The number of steps for the Riemann sum is choosen to corralate to the 
 * stepsize of the closest matching integtal.
 * @param {Number} lowerBound - The lower bound of the integral
 * @param {Number} upperBound - The upper bound of the integral
 * @param {Array} innerFunctionList - The function that is to be integrated
 * @param {String} countingVariable - The counting variable of the integral
 * @param {Number} index - The index of the stored integrals in the list of stored integrals
 */
function integralFinder(lowerBound, upperBound, innerFunctionList, countingVariable, index){
    if (lowerBound > upperBound){
        return integralFinder(upperBound, lowerBound, innerFunctionList, countingVariable, index);
    }
    let possibleMatchesStageOne = [];
    let possibleMatchesStageTwo = [];
    if(listOfStoredIntegrals[index] != null && listOfStoredIntegrals[index].length > 0){
        for (let i = 0; i < listOfStoredIntegrals[index].length; i++){
            if (listOfStoredIntegrals[index][i][3] == countingVariable){
                possibleMatchesStageOne.push(i);
            }
        }
        for (let i = 0; i < possibleMatchesStageOne.length; i++){
            let identicalInnerFunction = true;
            if (possibleMatchesStageOne[i].length != innerFunctionList.length){
                identicalInnerFunction = false;
            } else {
                for (let j = 0; j < innerFunctionList.length; j++){
                    if (possibleMatchesStageOne[i][j] != innerFunctionList[j]){
                        identicalInnerFunction = false;
                    }
                }
            }
            if (identicalInnerFunction){
                let lowerBoundDifference = Math.abs(lowerBound - listOfStoredIntegrals[index][possibleMatchesStageOne[i]][0]);
                let upperBoundDifference = Math.abs(upperBound - listOfStoredIntegrals[index][possibleMatchesStageOne[i]][1]);
                let totalDifference = lowerBoundDifference + upperBoundDifference;
                possibleMatchesStageTwo.push([possibleMatchesStageOne[i], lowerBoundDifference, upperBoundDifference, totalDifference]);
            }
        }
    } else {
        listOfStoredIntegrals[index] = [];
    }
    //if no match was found
    if(possibleMatchesStageTwo.length == 0){
        let currentIntegralValue = integralNumber(lowerBound, upperBound, innerFunctionList, countingVariable, 1000, index);
        listOfStoredIntegrals[index].push([lowerBound, upperBound, innerFunctionList, countingVariable, currentIntegralValue]);
        return currentIntegralValue;
    }
    //else:
    let bestMatch = possibleMatchesStageTwo[0];
    for (let i = 1; i < possibleMatchesStageTwo.length; i++){
        if (possibleMatchesStageTwo[i][3] < bestMatch[3]){
            bestMatch = possibleMatchesStageTwo[i];
        }
    }
    let integralWidth = Math.abs(upperBound - lowerBound);
    //if the difference between the bounds is smaller than the integral width, the integral is returned
    if (bestMatch[3] < integralWidth){
        return integralNumber(lowerBound, upperBound, innerFunctionList, countingVariable);
    }
    //else:
    let lowerBoundIntegralStetNumber = 1000*bestMatch[1]/(integralWidth*bestMatch[3]);
    let upperBoundIntegralStepNumber = 1000*bestMatch[2]/(integralWidth*bestMatch[3]);
    let lowerBoundIntegral = integralNumber(lowerBound, bestMatch[0][0], innerFunctionList, countingVariable, lowerBoundIntegralStetNumber, index);
    let upperBoundIntegral = integralNumber(bestMatch[0][1], upperBound, innerFunctionList, countingVariable, upperBoundIntegralStepNumber, index);
    let additionalIntegralValue = addNumbers(lowerBoundIntegral, upperBoundIntegral);
    let currentIntegralValue = addNumbers(bestMatch[0][4], additionalIntegralValue);
    if (bestMatch[4]>integralWidth){
        listOfStoredIntegrals[index].push([lowerBound, upperBound, innerFunctionList, countingVariable, currentIntegralValue]);
    }
    return currentIntegralValue;
}  

/***
 * This function calls the above @function integralFinder with the lower and upper bound or calls for their calculation. In
 * addition the internal function and the counting variable are being given to the @function integralFinder. This only
 * occurs if the upper and lower bound are real numbers.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the integral operation and the position in the array
 * where the information for the next argument is being stored
 */
function callIntegral(inputListe, position, index){
    position++;
    let lowerBound = callFunctions(inputListe, position, index);
    position = lowerBound[1];
    let upperBound = callFunctions(inputListe, position, index);
    position = upperBound[1];
    let innerFunctionList = [];
    let remainingOperandsCounter = 1;
    while (remainingOperandsCounter > 0){
        innerFunctionList.push(inputListe[position]);
        if (!operations.includes(inputListe[position])){
            remainingOperandsCounter--;
        } else if(specialOperationsWithTwoArguments.includes(inputListe[position]) || simpleOperations.includes(inputListe[position])){
            remainingOperandsCounter++;
        } else if (specialOperationsWithFourArguments.includes(inputListe[position])){
            remainingOperandsCounter = remainingOperandsCounter + 3;
        }  // remaining case: Special Operations with one argument do now change the remainingOperantsCounter
        position++;
    }
    let countingVariable = inputListe[position];
    if(lowerBound[0][1] != 0 || upperBound[0][1] != 0){
        return NaN;
    }
    return [integralFinder(lowerBound[0][0], upperBound[0][0], innerFunctionList, countingVariable, index), position];
}

/***
 * This function calculates the decimal logarithm of a complex number numberA.
 * @param {Array} numberA - The complex number of which the decimal logarithm is to be calculated
 * @returns {Array} - The result of the decimal logarithm operation
 */
function lgNumber(numberA){
    let realPart = lnNumber(numberA)[0];
    let imaginaryPart = lnNumber(numberA)[1];
    return [realPart/Math.log(10), imaginaryPart/Math.log(10)]; 
}

/***
 * This function calls the above @function lgNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the decimal logarithm calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callLg(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [lgNumber(call1[0]), position];
}

/***
 * This function calculates the natural logarithm of a complex number numberA.
 * @param {Array} numberA - The complex number of which the natural logarithm is to be calculated
 * @returns {Array} - The result of the natural logarithm operation
 */
function lnNumber(numberA){
    let normierungsfaktor = Math.sqrt(numberA[0]*numberA[0] + numberA[1]*numberA[1]);
    return [Math.log(normierungsfaktor), argNumber(numberA)];
}

/***
 * This function calls the above @function lnNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the natural logarithm calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callLn(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [lnNumber(call1[0]), position];
}

/***
 * This function calculates the argument of a complex number numberA. This is a helper function for the @function lnNumber
 * @param {Array} numberA - The complex number of which the argument is to be calculated
 * @returns {Number} - The argument of the complex number
 */
function argNumber(numberA){
    if (numberA == [0, 0]){
        return NaN;
    } else if (numberA[1] == 0 && numberA[0] < 0){
        return Math.PI;
    } else {
        return 2*Math.atan(numberA[1]/(numberA[0] + Math.sqrt(numberA[0]*numberA[0] + numberA[1]*numberA[1])));
    }
}

/***
 * This function calculates the signum of a complex number numberA.
 * @param {Array} numberA - The complex number of which the signum is to be calculated
 * @returns {Array} - The result of the signum operation
 */
function signNumber(numberA){
    let normierungsfaktor = Math.sqrt(numberA[0]*numberA[0] + numberA[1]*numberA[1]);
    return [numberA[0]/normierungsfaktor, numberA[1]/normierungsfaktor];
}

/***
 * This function calls the above @function signNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the signum calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callSign(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [signNumber(call1[0]), position];
}

/***
 * This function calculates the hyperbolic sine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the hyperbolic sine is to be calculated
 * @returns {Array} - The result of the hyperbolic sine operation
 */
function sinhNumber(numberA){
    return [Math.cos(numberA[1])*Math.sinh(numberA[0]), Math.sin(numberA[1])*Math.cosh(numberA[0])];
}

/***
 * This function calls the above @function sinhNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the hyperbolic sine calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callSinh(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [sinhNumber(call1[0]), position];
}

/***
 * This function calculates the hyperbolic cosine of a complex number numberA.
 * @param {Array} numberA - The complex number of which the hyperbolic cosine is to be calculated
 * @returns {Array} - The result of the hyperbolic cosine operation
 */
function coshNumber(numberA){
    return [Math.cos(numberA[1])*Math.cosh(numberA[0]), Math.sin(numberA[1])*Math.sinh(numberA[0])];
}

/***
 * This function calls the above @function coshNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the hyperbolic cosine calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callCosh(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [coshNumber(call1[0]), position];
}

/***
 * This function calculates the cotangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the cotangent is to be calculated
 * @returns {Array} - The result of the cotangent operation
 */
function cotNumber(numberA){
    return divideNumbers(cosNumber(numberA), sinNumber(numberA));
}

/***
 * This function calls the above @function cotNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the cotangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callCot(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [cotNumber(call1[0]), position];
}

/***
 * This function calculates the arcus cotangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the arcus cotangent is to be calculated
 * @returns {Array} - The result of the arcus cotangent operation
 */
function arccotNumber(numberA){
    return subtractNumbers([Math.PI/2, 0], arctanNumber(numberA));
}

/***
 * This function calls the above @function arccotNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the arcus cotangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callArccot(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [arccotNumber(call1[0]), position];
}

/***
 * This function calculates the hyperbolic tangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the hyperbolic tangent is to be calculated
 * @returns {Array} - The result of the hyperbolic tangent operation
 */
function tanhNumber(numberA){
    return[Math.sinh(2*numberA[0])/(Math.cosh(2*numberA[0]) + Math.cos(2*numberA[1])), Math.sin(2*numberA[1])/(Math.cosh(2*numberA[0]) + Math.cos(2*numberA[1]))];
}

/***
 * This function calls the above @function tanhNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the hyperbolic tangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callTanh(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [tanhNumber(call1[0]), position];
}

/***
 * This function calculates the hyperbolic cotangent of a complex number numberA.
 * @param {Array} numberA - The complex number of which the hyperbolic cotangent is to be calculated
 * @returns {Array} - The result of the hyperbolic cotangent operation
 */
function cothNumber(numberA){
    return [Math.sinh(2*numberA[0])/(Math.cosh(2*numberA[0]) - Math.cos(2*numberA[1])), -1*Math.sin(2*numberA[1])/(Math.cosh(2*numberA[0]) - Math.cos(2*numberA[1]))];
}

/***
 * This function calls the above @function cothNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the hyperbolic cotangent calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callCoth(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [cothNumber(call1[0]), position];
}

/***
 * This function calculates the floor function of a complex number numberA.
 * @param {Array} numberA - The complex number of which the floor function is to be calculated
 * @returns {Array} - The result of the floor function operation
 */
function fFloorNumber(numberA){
    let real = numberA[0];
    let imaginary = numberA[1];
    return [Math.floor(real), Math.floor(imaginary)];
}

/***
 * This function calls the above @function floorNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the floor function calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callFloor(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [fFloorNumber(call1[0]), position];
}

/***
 * This function calculates the ceiling function of a complex number numberA.
 * @param {Array} numberA - The complex number of which the ceiling function is to be calculated
 * @returns {Array} - The result of the ceiling function operation
 */
function cCeilNumber(numberA){
    let real = numberA[0];
    let imaginary = numberA[1];
    return [Math.ceil(real), Math.ceil(imaginary)];
}

/***
 * This function calls the above @function ceilNumber with the following number or calls for its calculation.
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The result of the ceiling function calculation and the position in the array
 * where the information for the next argument is being stored
 */
function callCeil(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [cCeilNumber(call1[0]), position];
}

/***
 * This function returns the value of the mathematical constant pi regardless of the input.
 * @param {Number} Zero - The input value that is to be ignored
 * @returns {Array} - The value of the mathematical constant pi as a complex number
 */
function piNumber(Zero){
    Zero = Math.PI;
    return [Zero, 0];
}

/***
 * This function calls the above @function piNumber with the following number or calls for its calculation. The 
 * following number should always be zero
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The value of the mathematical constant pi and the position in the array
 * where the information for the next argument is being stored
 */
function callPi(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [piNumber(call1[0]), position];
}

/***
 * This function returns the value of the mathematical constant e regardless of the input.
 * @param {Number} Zero - The input value that is to be ignored
 * @returns {Array} - The value of the mathematical constant e as a complex number
 */
function eNumber(Zero){
    Zero = Math.E;
    return [Zero, 0];
}

/***
 * This function calls the above @function eNumber with the following number or calls for its calculation. The
 * following number should always be zero
 * @param {Array} inputListe - The list that needs to be calculated
 * @param {Number} position - The position in the array where the function is located
 * @param {Number} index - The index for the position where integrals are stored
 * @returns {Array} - The value of the mathematical constant e and the position in the array
 * where the information for the next argument is being stored
 */
function callE(inputListe, position, index){
    position++;
    let call1 = callFunctions(inputListe, position, index);
    position = call1[1];
    return [eNumber(call1[0]), position];
}