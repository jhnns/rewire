var pathUtil = require("path"),
    browserifyRequire = window.browserifyRequire;

// Saves all setters and getters for every module according to its filename
var registry = {},
// Cache for all rewired modules so it can be reset anytime
    rewiredModules = [];

/**
 * Executes the given module and adds a special setter and getter that allow you to set and get private variables.
 * The parentModulePath is usually set by the requireProxy.
 *
 * @param {!String} parentModulePath __filename of the module, that wants to rewire() another module.
 * @param {!String} targetPath path to the module that shall be rewired
 * @param {Boolean=true} cache indicates whether the rewired module should be cached or not
 * @return {Object}
 */
function browserifyRewire(parentModulePath, targetPath, cache) {
    var originalModule,
        rewiredModule = {},
        registeredTargetModule;

    // Default cache to true
    if (cache === undefined) {
        cache = true;
    }

    // Make absolute paths
    if (targetPath.charAt(0) === ".") {
        targetPath = pathUtil.resolve(pathUtil.dirname(parentModulePath), targetPath);
    }

     // Normalize path with file extensions
    targetPath = require.resolve(targetPath);

    // Deleting module from cache to trigger execution again
    delete browserifyRequire.modules[targetPath]._cached;

    // Require module to trigger rewire.register() if it hasnt been required yet
    // Putting (require) within brackets is a hack to disable browserifys require sniffing
    // @see https://github.com/substack/node-browserify/issues/132#issuecomment-5281470
    originalModule = (require)(targetPath);

    // Copy all exported values to our rewired module
    for (var key in originalModule) {
        if (originalModule.hasOwnProperty(key)) {
            rewiredModule[key] = originalModule[key];
        }
    }

    // If caching is enabled we store the rewiredModule in the cache
    if (cache) {
        browserifyRequire.modules[targetPath]._cached = rewiredModule;
    }

    // Get registry entry of the target module
    registeredTargetModule = registry[targetPath];

    // Apply setter and getters
    rewiredModule.__set__ = registeredTargetModule.setter;
    rewiredModule.__get__ = registeredTargetModule.getter;

    // Store rewired modules for rewire.reset()
    rewiredModules.push(targetPath);

    return rewiredModule;
}

/**
 * Registers the setter and getter of every module according to its filename
 *
 * @param {!String} filename the absolute path to the module (module id)
 * @param {!Function} setter
 * @param {!Function} getter
 */
browserifyRewire.register = function (filename, setter, getter) {
    registry[filename] = {
        setter: setter,
        getter: getter
    };
};

/**
 * Deletes all rewired modules from the cache
 */
browserifyRewire.reset = function () {
    var modules = browserifyRequire.modules,
        i;

    for (i = 0; i < rewiredModules.length; i++) {
        delete modules[rewiredModules[i]]._cached;
    }

    rewiredModules = [];
};

module.exports = browserifyRewire;