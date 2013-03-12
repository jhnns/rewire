rewire
=====
**Dependency injection for node.js applications**.

rewire adds a special setter and getter to modules so you can modify their behaviour for better unit testing. You may

- inject mocks for other modules or globals like `process`
- leak private variables
- override variables within the module.

rewire does **not** load the file and eval the contents to emulate node's require mechanism. In fact it uses node's own require to load the module. Thus your module behaves exactly the same in your test environment as under regular circumstances (except your modifications).

Good news to all caffeine-addicts: rewire works also with [Coffee-Script](http://coffeescript.org/). Note that in this case CS needs to be listed in your devDependencies.

[![Build Status](https://secure.travis-ci.org/jhnns/rewire.png?branch=master)](http://travis-ci.org/jhnns/rewire)
[![Dependency Status](http://david-dm.org/jhnns/rewire/status.png)](http://david-dm.org/jhnns/rewire)
Dependency tracking by [David](http://david-dm.org/)

<br />

Installation
------------

`npm install rewire`

<br />

Examples
--------

Imagine you want to test this module:

```javascript
// lib/myModule.js

// With rewire you can change all these variables
var fs = require("fs"),
    http = require("http"),
    someOtherVar = "hi",
    myPrivateVar = 1;

function readSomethingFromFileSystem(cb) {
    // But no scoped variables
    var path = "/somewhere/on/the/disk";

    console.log("Reading from file system ...");
    fs.readFile(path, "utf8", cb);
}

exports.readSomethingFromFileSystem = readSomethingFromFileSystem;
```

Now within your test module:

```javascript
// test/myModule.test.js

var rewire = require("rewire");

// rewire acts exactly like require.
var myModule = rewire("../lib/myModule.js");

// Just with one difference:
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

// There is another difference to require:
// Every call of rewire() returns a new instance.
rewire("./myModule.js") === rewire("./myModule.js"); // = false
```

<br />

##API

###rewire(filename): rewiredModule

- *filename*: <br/>
Path to the module that shall be rewired. Use it exactly like require().

###rewiredModule.&#95;&#95;set&#95;&#95;(name, value)

- *name*: <br/>
Name of the variable to set. The variable should be global or defined with `var` in the top-leve scope of the module.
- *value*: <br/>
The value to set.

###rewiredModule.&#95;&#95;set&#95;&#95;(env)
- *env*: <br/>
Takes all keys as variable names and sets the values respectively.

###rewiredModule.&#95;&#95;get&#95;&#95;(name): value

Returns the private variable.

<br />

##Client-Side Bundlers

rewire comes also with support for client-side bundlers. But since it relies heavily on node's require mechanism it can't be used on the client-side without adding special middleware to the bundling process. Currently supported bundlers are:

- [browserify](https://github.com/substack/node-browserify) @1.x
- [webpack](https://github.com/webpack/webpack) @ 0.8.x

However, expect this feature to be extracted into own bundler-specific modules soon.

**Please note:** Unfortunately the line numbers in stack traces have an offset of +2 (browserify) / +1 (webpack).
This is caused by generated code that is added during the bundling process.

###browserify

rewire currently only supports browserify@1.x. I'm not planing to continue development, but if you're relying on this feature [please let me know](https://github.com/jhnns/rewire/issues/13).

```javascript
var b = browserify();

// Add rewire as browserify middleware
b.use(require("rewire").bundlers.browserify);
```

###webpack

see [rewire-webpack](https://github.com/jhnns/rewire-webpack)

<br />

##License

MIT
