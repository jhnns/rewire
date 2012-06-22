var pathUtil = require("path"),
    browserifyRequire = window.browserifyRequire;

var registry = {},
    rewiredModules = [];    // cache for all rewired modules so it can be reset anytime

function rewire(parentModulePath, targetPath, cache) {
    var originalModule,
        rewiredModule = {},
        registeredTargetModule;

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

    for (var key in originalModule) {
        if (originalModule.hasOwnProperty(key)) {
            rewiredModule[key] = originalModule[key];
        }
    }

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

rewire.register = function (filename, setter, getter) {
    registry[filename] = {
        setter: setter,
        getter: getter
    };
};

/**
 * Deletes all rewired modules from the cache
 */
rewire.reset = function () {
    var modules = browserifyRequire.modules,
        i;

    for (i = 0; i < rewiredModules.length; i++) {
        delete modules[rewiredModules[i]]._cached;
    }

    rewiredModules = [];
};

module.exports = rewire;