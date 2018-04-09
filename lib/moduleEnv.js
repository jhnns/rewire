"use strict";

// TODO: Use https://www.npmjs.com/package/pirates here?

var Module = require("module"),
    fs = require("fs"),
    eslint = require("eslint"),
    coffee;

var moduleWrapper0 = Module.wrapper[0],
    moduleWrapper1 = Module.wrapper[1],
    originalExtensions = {},
    linter = new eslint.Linter(),
    eslintOptions = {
        env: {
            es6: true,
        },
        parserOptions: {
            ecmaVersion: 6,
            ecmaFeatures: {
                globalReturn: true,
                jsx: true,
                experimentalObjectRestSpread: true
            },
        },
        rules: {
            "no-const-assign": 2
        }
    },
    // The following regular expression is used to replace const declarations with let.
    // This regex replacement is not 100% safe because transforming JavaScript requires an actual parser.
    // However, parsing (e.g. via babel) comes with its own problems because now the parser needs to
    // be aware of syntax extensions which might not be supported by the parser, but the underlying
    // JavaScript engine. In fact, rewire used to have babel in place here but required an extra
    // transform for the object spread operator (check out commit d9a81c0cdacf6995b24d205b4a2068adbd8b34ff
    // or see https://github.com/jhnns/rewire/pull/128). It was also notable slower
    // (see https://github.com/jhnns/rewire/issues/132).
    // There is another issue: replacing const with let is not safe because of their different behavior.
    // That's why we also have ESLint in place which tries to identify this error case.
    // There is one edge case though: when a new syntax is used *and* a const re-assignment happens,
    // rewire would compile happily in this situation but the actual code wouldn't work.
    // However, since most projects have a seperate linting step which catches these const re-assignment
    // errors anyway, it's probably still a reasonable trade-off.
    // Test the regular expresssion at https://regex101.com/r/dvnZPv/2 and also check out testLib/constModule.js.
    matchConst = /(^|\s|\}|;)const(\/\*|\s)/gm,
    nodeRequire,
    currentModule;

function load(targetModule) {
    nodeRequire = targetModule.require;
    targetModule.require = requireProxy;
    currentModule = targetModule;

    registerExtensions();
    targetModule.load(targetModule.id);

    // This is only necessary if nothing has been required within the module
    reset();
}

function reset() {
    Module.wrapper[0] = moduleWrapper0;
    Module.wrapper[1] = moduleWrapper1;
}

function inject(prelude, appendix) {
    Module.wrapper[0] = moduleWrapper0 + prelude;
    Module.wrapper[1] = appendix + moduleWrapper1;
}

/**
 * Proxies the first require call in order to draw back all changes to the Module.wrapper.
 * Thus our changes don't influence other modules
 *
 * @param {!String} path
 */
function requireProxy(path) {
    reset();
    currentModule.require = nodeRequire;
    return nodeRequire.call(currentModule, path);  // node's require only works when "this" points to the module
}

function registerExtensions() {
    var originalJsExtension = require.extensions[".js"];
    var originalCoffeeExtension = require.extensions[".coffee"];

    if (originalJsExtension) {
        originalExtensions.js = originalJsExtension;
    }
    if (originalCoffeeExtension) {
        originalExtensions.coffee = originalCoffeeExtension;
    }
    require.extensions[".js"] = jsExtension;
    require.extensions[".coffee"] = coffeeExtension;
}

function restoreExtensions() {
    if ("js" in originalExtensions) {
        require.extensions[".js"] = originalExtensions.js;
    }
    if ("coffee" in originalExtensions) {
        require.extensions[".coffee"] = originalExtensions.coffee;
    }
}

function isNoConstAssignMessage(message) {
    return message.ruleId === "no-const-assign";
}

function jsExtension(module, filename) {
    var _compile = module._compile;

    module._compile = function (content, filename) {
        var noConstAssignMessage = linter.verify(content, eslintOptions).find(isNoConstAssignMessage);
        var line;
        var column;

        if (noConstAssignMessage !== undefined) {
            line = noConstAssignMessage.line;
            column = noConstAssignMessage.column;
            throw new TypeError(`Assignment to constant variable at ${ filename }:${ line }:${ column }`);
        }

        _compile.call(
            module,
            content.replace(matchConst, "$1let  $2"), // replace const with let, while maintaining the column width
            filename
        );
    };

    restoreExtensions();
    originalExtensions.js(module, filename);
}

function coffeeExtension(module, filename) {
    if (!coffee) {
        throw new Error("Cannot rewire module written in CoffeeScript: Please install 'coffeescript' package first.");
    }

    var content = stripBOM(fs.readFileSync(filename, "utf8"));

    restoreExtensions();
    content = coffee.compile(content, {
        filename: filename,
        bare: true
    });
    module._compile(content, filename);
}

/**
 * @see https://github.com/joyent/node/blob/master/lib/module.js
 */
function stripBOM(content) {
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
    // because the buffer-to-string conversion in `fs.readFileSync()`
    // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
}

try {
    coffee = require("coffeescript");
} catch (err) {
    try {
        // Trying to load deprecated package
        coffee = require("coffee-script");
    } catch (err) {
        // We are not able to provide CoffeeScript support, but that's ok as long as the user doesn't want it.
    }
}

exports.load = load;
exports.inject = inject;
