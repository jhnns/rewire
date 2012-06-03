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

Installation
------------

```npm install rewire```

-----------------------------------------------------------------

Examples
--------

```javascript
var rewire = require("rewire"),
    rewiredModule;

// Default
////////////////////////////////
// rewire acts exactly like require when omitting all other params
rewiredModule = rewire("./myModuleA.js");



// Mocks
////////////////////////////////
var mockedModuleB = {},
    mocks = {
        "path/to/moduleB.js": mockedModuleB
    };

// The rewired module will now use your mock instead of moduleB.js.
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
rewiredModule = rewire("./myModuleA.js", null, "console.log('hellooo');");



// Leaks
////////////////////////////////
var leaks = ["myPrivateVar1", "myPrivateVar2"];

// rewire exports variables under the special "__"-object.
rewiredModule = rewire("./myModuleA.js", null, null, leaks);
console.log(rewiredModule.__.myPrivateVar1);
console.log(rewiredModule.__.myPrivateVar2);



// Cache
////////////////////////////////
// By disabling the module cache the rewired module will not be cached.
// Any later require()-calls within other modules will now return the original
// module again instead of the rewired. Caching is enabled by default.
rewiredModule = rewire("./myModuleA.js", null, null, null, false);
```

-----------------------------------------------------------------

##API

**rewire(***filename, mocks\*, injections\*, leaks\*, cache=true*) \* = optional

- *{!String} **filename***: Path to the module that shall be rewired. Use it exactly like require().
- *{Object} **mocks***: An object with mocks. Keys should be the exactly same like they're required in the target module. So if you write ```require("../../myModules/myModuleA.js")``` you need to pass ```{"../../myModules/myModuleA.js": myModuleAMock}```.
- *{Object|String} **injections***: If you pass an object, all keys of the object will be ```var```s within the module. You can also eval a string. **Please note**: All scripts are injected at the end of the module. So if there is any code in your module that is executed during ```require()```, your injected variables will be undefined at this point. For example: passing ```{console: {...}}``` will cause all calls of ```console.log()``` to throw an exception if they're executed during ```require()```.
- *{Array&lt;String&gt;} **leaks***: An array with variable names that should be exported. These variables are accessible via ```myModule.__```
- *{Boolean=true} **cache***: Indicates whether the rewired module should be cached by node so subsequent calls of ```require()``` will return the rewired module. Subsequent calls of ```rewire()``` will always overwrite the cache.

-----------------------------------------------------------------

## Credits

This module is inspired by the great [injectr](https://github.com/nathanmacinnes/injectr "injectr")-module.

-----------------------------------------------------------------

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