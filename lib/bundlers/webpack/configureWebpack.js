"use strict"; // run code in ES5 strict mode

function configureWebpack(options) {
    options.resolve = options.resolve || {};
    options.postLoaders = options.postLoaders || [];
    options.resolve.postprocess = options.resolve.postprocess || {};
    options.resolve.postprocess.normal = options.resolve.postprocess.normal || [];

    // @see https://github.com/webpack/webpack/issues/21
    options.context = options.context || process.cwd();

    options.postLoaders.push(require("./webpackPostLoader.js"));
    options.resolve.postprocess.normal.push(require("./webpackPostProcessor.js"));
}

module.exports = configureWebpack;