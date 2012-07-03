rewire
=====
**Dependency injection for node.js applications**.

rewire adds a special setter and getter to modules so you can modify their behaviour for better unit testing. You may

- introduce mocks for other modules
- leak private variables
- override variables within the module.

rewire does **not** load the file and eval the contents to emulate node's require mechanism. In fact it uses node's own require to load the module. Thus your module behaves exactly the same in your test environment as under regular circumstances (except your modifications).

**Debugging is fully supported.**

Furthermore rewire comes also with support for [browserify](https://github.com/substack/node-browserify). You just
have to add rewire as a middleware (see below).

[![Build Status](https://secure.travis-ci.org/jhnns/rewire.png?branch=master)](http://travis-ci.org/jhnns/rewire)

<br />

Installation
------------

`npm install rewire`

**For older node versions:**<br />
rewire is tested with node 0.6.x - 0.8.x. I recommend to run the unit tests via `mocha` in the rewire-folder before
using rewire with other node versions.

**Use with [browserify](https://github.com/substack/node-browserify):**<br />

```javascript
var b = require("browserify")({debug: true});

b.use(require("rewire").browserify);
```

After that rewire works exactly as in node.

<br />

Examples
--------

```javascript
var rewire = require("rewire");


// rewire acts exactly like require.
var myModule = rewire("../lib/myModule.js");


// Your module will now export a special setter and getter for private variables.
myModule.__set__("myPrivateVar", 123);
myModule.__get__("myPrivateVar"); // = 123


// This allows you to mock almost everything within the module e.g. the fs-module.
// Just pass the variable name as first parameter and your mock as second.
myModule.__set__("fs", {
    readFile: function (path, encoding, cb) {
        cb(null, "Success!");
    }
});
myModule.readSomethingFromFileSystem(function (err, data) {
    console.log(data); // = Success!
});


// All later requires will now return the module with the mock.
myModule === require("./myModule.js"); // = true


// You can set different variables with one call.
myModule.__set__({
    fs: fsMock,
    http: httpMock,
    someOtherVar: "hello"
});


// You may also override globals. These changes are only within the module, so
// you don't have to be concerned that other modules are influenced by your mock.
myModule.__set__({
    console: {
        log: function () { /* be quiet */ }
    },
    process: {
        argv: ["testArg1", "testArg2"]
    }
});


// But be careful, if you do something like this you'll change your global
// console instance.
myModule.__set__("console.log", function () { /* be quiet */ });


// By getting private variables you can test for instance if your
// module is in a specific state
assert.ok(myModule.__get__("currentState") === "idle");


// You can also disable caching when loading the rewired module. All
// subsequent calls of require() will than return the original module again.
rewire("./myModule.js") === require("./myModule.js"); // = true
rewire("./myModule.js", false) === require("./myModule.js"); // = false


// Every call of rewire returns a new instance and overwrites the old
// one in the module cache.
rewire("./myModule.js") === rewire("./myModule.js"); // = false


// If you want to remove all your rewired modules from
// cache just call rewire.reset().
// Do this after every single unit test to ensure a clean testing environment.
rewire.reset();
```

<br />

##API

**rewire(***filename, cache***): {RewiredModule}**

- *{!String} filename*: <br/>
Path to the module that shall be rewired. Use it exactly like require().

- *{Boolean=true} cache (optional)*: <br />
Indicates whether the rewired module should be cached by node so subsequent calls of `require()` will
return the rewired module. Further calls of `rewire()` will always overwrite the cache.

**rewire.reset()**

Removes all rewired modules from `require.cache`. Every `require()` will now return the original module again.

**RewiredModule.&#95;&#95;set&#95;&#95;(***name, value***)**

- *{!String} name*: <br/>
Name of the variable to set. The variable should be a global or defined with `var` in the top-level
scope of the module.

- *{&lowast;} value*: <br/>
The value to set

**RewiredModule.&#95;&#95;set&#95;&#95;(***env***)**

- *{!Object} env*: <br/>
Takes all keys as variable names and sets the values respectively.

**RewiredModule.&#95;&#95;get&#95;&#95;(***name***): {&lowast;}**

Returns the private variable.

<br />

## Credits

This module is inspired by the great [injectr](https://github.com/nathanmacinnes/injectr "injectr")-module.