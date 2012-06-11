"use strict"; // run code in ES5 strict mode

var someOtherModule = require("./someOtherModule.js"),
    myNumber = 0,   // copy by value
    myObj = {},     // copy by reference
    fs = require("fs");

// We need getters and setters for private vars to check if our injected setters and getters actual work
function setMyNumber(newNumber) {
    myNumber = newNumber;
}

function getMyNumber() {
    return myNumber;
}

function setMyObj(newObj) {
    myObj = newObj;
}

function getMyObj() {
    return myObj;
}

function readFileSync() {
    fs.readFileSync("bla.txt", "utf8");
}

function checkSomeGlobals() {
    if (typeof global === "undefined") {
        throw new ReferenceError("global is undefined");
    }
    if (typeof process === "undefined") {
        throw new ReferenceError("process is undefined");
    }
    if (typeof console === "undefined") {
        throw new ReferenceError("console is undefined");
    }
    if (typeof Buffer === "undefined") {
        throw new ReferenceError("Buffer is undefined");
    }
    if (typeof __filename === "undefined") {
        throw new ReferenceError("__filename is undefined");
    }
    if (typeof __dirname === "undefined") {
        throw new ReferenceError("__dirname is undefined");
    }
    if (typeof setTimeout === "undefined") {
        throw new ReferenceError("setTimeout is undefined");
    }
}

function getConsole() {
    return console;
}

function getProcess() {
    return process;
}

function getFilename() {
    return __filename;
}

function main() {

}

main.setMyNumber = setMyNumber;
main.getMyNumber = getMyNumber;
main.setMyObj = setMyObj;
main.getMyObj = getMyObj;
main.readFileSync = readFileSync;
main.checkSomeGlobals = checkSomeGlobals;
main.getConsole = getConsole;
main.getProcess = getProcess;
main.getFilename = getFilename;
main.someOtherModule = someOtherModule;

// different styles of exports in moduleA.js and moduleB.js
module.exports = main;
