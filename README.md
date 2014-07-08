rewire
=====
**Easy dependency injection for node.js unit testing**.

rewire adds a special setter and getter to modules so you can modify their behaviour for better unit testing. You may

- inject mocks for other modules or globals like `process`
- leak private variables
- override variables within the module.

rewire does **not** load the file and eval the contents to emulate node's require mechanism. In fact it uses node's own
require to load the module. Thus your module behaves exactly the same in your test environment as under regular
circumstances (except your modifications).

Good news to all caffeine-addicts: rewire works also with [Coffee-Script](http://coffeescript.org/). Note that in this
case CoffeeScript needs to be listed in your devDependencies.

If you want to use rewire also on the client-side take a look at [client-side bundlers](https://github.com/jhnns/rewire#client-side-bundlers)

[![Build Status](https://travis-ci.org/jhnns/rewire.svg?branch=master)](http://travis-ci.org/jhnns/rewire)
[![Dependency Status](https://david-dm.org/jhnns/rewire.svg)](https://david-dm.org/jhnns/rewire)
[![Coverage Status](https://img.shields.io/coveralls/jhnns/rewire.svg)](https://coveralls.io/r/jhnns/rewire)
[![Gittip Donate Button](http://img.shields.io/gittip/peerigon.svg)](https://www.gittip.com/peerigon/)

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
    path = "/somewhere/on/the/disk";

function readSomethingFromFileSystem(cb) {
    console.log("Reading from file system ...");
    fs.readFile(path, "utf8", cb);
}

exports.readSomethingFromFileSystem = readSomethingFromFileSystem;
```

Now within your test module:

```javascript
// test/myModule.test.js

var rewire = require("rewire");

var myModule = rewire("../lib/myModule.js");
```

rewire acts exactly like require. Just with one difference: Your module will now export a special setter and getter for private variables.

```javascript
myModule.__set__("path", "/dev/null");
myModule.__get__("path"); // = '/dev/null'
```

This allows you to mock everything in the top-level scope of the module, like the fs-module for example. Just pass the variable name as first parameter and your mock as second.

```javascript
var fsMock = {
    readFile: function (path, encoding, cb) {
        expect(path).to.equal("/somewhere/on/the/disk");
        cb(null, "Success!");
    }
};
myModule.__set__("fs", fsMock);

myModule.readSomethingFromFileSystem(function (err, data) {
    console.log(data); // = Success!
});
```

You can also set different variables with one call.

```javascript
myModule.__set__({
    fs: fsMock,
    path: "/dev/null"
});
```

You may also override globals. These changes are only within the module, so you don't have to be concerned that other modules are influenced by your mock.

```javascript
myModule.__set__({
    console: {
        log: function () { /* be quiet */ }
    },
    process: {
        argv: ["testArg1", "testArg2"]
    }
});
```

### Caveats

**Difference to require()**
Every call of rewire() executes the module again and returns a fresh instance.

```javascript 
rewire("./myModule.js") === rewire("./myModule.js"); // = false
```

This can especially be a problem if the module is not idempotent [like mongoose models](https://github.com/jhnns/rewire/issues/27).

**Changing globals**
Be careful, if you do something like this you'll change your global console instance.

```javascript
myModule.__set__("console.log", function () { /* be quiet */ });
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

###webpack
See [rewire-webpack](https://github.com/jhnns/rewire-webpack)

###browserify
If you're using browserify and want to use rewire with browserify [please let me know](https://github.com/jhnns/rewire/issues/13).

<br />

##License

MIT
