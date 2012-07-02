"use strict"; // run code in ES5 strict mode

var someOtherModule = require("./someOtherModule.js"),
    myNumber = 0,   // copy by value
    myObj = {},     // copy by reference
    env = "bla",
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
    if (typeof global !== "object") {
        throw new ReferenceError("global is not an object");
    }
    if (typeof console !== "object") {
        throw new ReferenceError("console is not an object");
    }
    if (typeof require !== "function") {
        throw new ReferenceError("require is not a function");
    }
    if (typeof module !== "object") {
        throw new ReferenceError("module is not an object");
    }
    if (typeof exports !== "object") {
        throw new ReferenceError("exports is not an object");
    }
    if (module.exports === exports) {
        throw new Error("module.exports === exports returns true"); // should be false because we're setting module.exports at the bottom of this file
    }
    if (typeof __dirname !== "string") {
        throw new ReferenceError("__dirname is not a string");
    }
    if (typeof __filename !== "string") {
        throw new ReferenceError("__filename is not a string");
    }
    //TODO add accurate checks here
    if (typeof setTimeout === "undefined") {
        throw new ReferenceError("setTimeout is undefined");
    }
    if (typeof clearTimeout === "undefined") {
        throw new ReferenceError("clearTimeout is undefined");
    }
    if (typeof setInterval === "undefined") {
        throw new ReferenceError("setInterval is undefined");
    }
    if (typeof clearInterval === "undefined") {
        throw new ReferenceError("clearInterval is undefined");
    }
    if (typeof Error === "undefined") {
        throw new ReferenceError("Error is undefined");
    }
    if (typeof parseFloat === "undefined") {
        throw new ReferenceError("parseFloat is undefined");
    }
    if (typeof parseInt === "undefined") {
        throw new ReferenceError("parseInt is undefined");
    }
    if (typeof window === "undefined") {
        if (typeof process === "undefined") {
            throw new ReferenceError("process is undefined");
        }
        if (typeof Buffer === "undefined") {
            throw new ReferenceError("Buffer is undefined");
        }
    } else {
        if (typeof encodeURIComponent === "undefined") {
            throw new ReferenceError("encodeURIComponent is undefined");
        }
        if (typeof decodeURIComponent === "undefined") {
            throw new ReferenceError("decodeURIComponent is undefined");
        }
    }
}

function getConsole() {
    return console;
}

function getFilename() {
    return __filename;
}

// different styles of exports in moduleA.js and moduleB.js
module.exports = {
    setMyNumber: setMyNumber,
    getMyNumber: getMyNumber,
    setMyObj: setMyObj,
    getMyObj: getMyObj,
    readFileSync: readFileSync,
    checkSomeGlobals: checkSomeGlobals,
    getConsole: getConsole,
    getFilename: getFilename,
    someOtherModule: someOtherModule
};
