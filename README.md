rewire
=====
**Dependency injection for node.js applications**.

rewire allows you to modify the behaviour of modules for better unit testing. You may

- provide mocks for other modules
- leak private variables
- override variables within the module
- inject your own scripts

rewire does **not** load the file and eval the contents to emulate node's require mechanism. In fact it uses node's own require to load the module. Thus your module behaves exactly the same in your test environment as under regular circumstances (except your modifications).

**Debugging is fully supported.**

-----------------------------------------------------------------
<br />

Installation
------------

`npm install rewire`

-----------------------------------------------------------------
<br />

Examples
--------

```javascript
var rewire = require("rewire"),
    rewiredModule;

// Default
////////////////////////////////
// rewire acts exactly like require when omitting all other params
rewire("./myModuleA.js") === require("./myModuleA.js"); // = true



// Mocks
////////////////////////////////
var mockedModuleB = {},
    mockedFs = {},
    mocks = {
        "fs": mockedFs,
        "path/to/moduleB.js": mockedModuleB
    };

// The rewired module will now use your mocks instead of fs
// and moduleB.js. Just make sure that the path is exactly as
// in myModuleA.js required.
rewiredModule = rewire("./myModuleA.js", mocks);



// Injections
////////////////////////////////
var injections = {
        console: {
            log: function () { /* be quiet */ }
        },
        process: { argv: ["someArgs"] },
        __filename: "some/other/dir"
    };

// This will inject
// var console = {log: function () { /* be quiet */ }};
// var process = {argv: ["someArgs"] };
// var __filename = "some/other/dir";
// at the bottom of the module.
// This way you can override private variables within the module
rewiredModule = rewire("./myModuleA.js", null, injections);

// You can also pass a script to inject
rewiredModule =
   rewire("./myModuleA.js", null, "console.log('hellooo');"); // prints "hellooo"



// Leaks
////////////////////////////////
var leaks = ["myPrivateVar1", "myPrivateVar2"];

// rewire exports variables under the special "__"-object.
rewiredModule = rewire("./myModuleA.js", null, null, leaks);
rewiredModule.__.myPrivateVar1; // returns former private myPrivateVar1
rewiredModule.__.myPrivateVar2; // returns former private myPrivateVar2



// Cache
////////////////////////////////
// By disabling the module cache the rewired module will not be cached.
// Any require()-calls will now return the original module again instead
// of the rewired. Caching is enabled by default.
rewire("./myModuleA.js", null, null, null, false) !==
    require("./myModuleA.js"); // = true

// This removes all rewired modules from require.cache.
rewire.reset();
// IMPORTANT: You should call this before every unit test to ensure
// a clean test environment.
```

-----------------------------------------------------------------
<br />

##API

**rewire(***filename, mocks, injections, leaks, cache***)**

- *{!String} filename*: <br/>
Path to the module that shall be rewired. Use it exactly like require().

- *{Object} mocks (optional)*: <br/>
An object with mocks.

- *{Object|String} injections (optional)*: <br />
If you pass an object, all keys of the object will be `var`s within the module. You can also eval a string.

- *{Array&lt;String&gt;} leaks (optional)*: <br/>
An array with variable names that should be exported. These variables are accessible via `myModule.__`.

- *{Boolean=true} cache (optional)*: <br />
Indicates whether the rewired module should be cached by node so subsequent calls of `require()` will
return the rewired module. Further calls of `rewire()` will always overwrite the cache.

Returns the rewired module.

**rewire.reset()**

Removes all rewired modules from `require.cache`. Every `require()` will now return the original module again.

-----------------------------------------------------------------
<br />

## Please note
### mocks
Keys should be the exactly the same like they're required in the target module.
So if you write `require("../../myModules/myModuleA.js")` you need to pass
`{"../../myModules/myModuleA.js": myModuleAMock}`.

### injections
All scripts are injected at the end of the module. So if there is any code in your module
that is executed during `require()`, your injected variables will be undefined at this point.

Imagine `rewire("./myModule.js", null, {console: null});`:

```javascript
console.log("Hello");   // ouch, that won't work. console is undefined at this point because of hoisting

// End of module ///////////////
// rewire will inject here
var console = null;
```

### leaks
Leaks are executed at the end of the module. If a `var` is undefined at this point you
won't be able to access the leak (because `undefined`-values are [copied by value](http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language)).
A good approach to this is:

```javascript
var myLeaks = {};

module.exports = function (someValue) {
   myLeaks.someValue = someValue;
};

// End of module ///////////////
// rewire will inject here
module.exports.__ = {myLeaks: myLeaks};
```

Because ```myLeaks``` is defined at the end of the module, you're able to access the leak object and all leaks that
are attached to it later during runtime. Because myLeaks is not exposed under regular circumstances your
module interface stays clean.

### reset
You should call this before every unit test to ensure a clean test environment.

-----------------------------------------------------------------
<br />

## Credits

This module is inspired by the great [injectr](https://github.com/nathanmacinnes/injectr "injectr")-module.

-----------------------------------------------------------------
<br />

## License

(The MIT License)

Copyright (c) 2012 Johannes Ewald &lt;mail@johannesewald.de&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.