##Changelog

###v1.0.0
- Removed caching functionality. Now rewire doesn't modify `require.cache` at all.
- Added support for [webpack](https://github.com/webpack/webpack)-bundler
- Moved browserify-middleware from `rewire.browserify` to `rewire.bundlers.browserify`
- Reached stable  state :)