rewire
=====
**Dependency injection for node.js applications**.

rewire allows you to modify the behaviour of modules for better unit testing. You may

- provide mocks for other modules
- leak private variables
- override variables within the module
- inject scripts

rewire does **not** load the file and eval it to emulate node's require mechanism. In fact it uses node's require to load the module. Thus your module behaves exactly the same in your test environment as under regular circumstances (except your modifications).

Installation
------------

```npm install rewire```

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

// the rewired module will now use your mock instead of moduleB.js.
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

// overrides all given variables within the module
rewiredModule = rewire("./myModuleA.js", null, injections);
// you can also pass a script to inject
rewiredModule = rewire("./myModuleA.js", null, "console.log('hellooo');");


// Leaks
////////////////////////////////

```
