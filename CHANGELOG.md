Changelog
---------

### 7.0.0
- **Breaking**: Remove official Node v10, v12, v14 and v16 support. We had to do this because one of our dependencies had security issues and the version with the fix dropped Node v10 as well. Additionally, there were also package-lock.json issues because of a breaking change at npm [6deb9bd3edb1d3531ffa689968339f9fd390a5d5](https://github.com/jhnns/rewire/commit/6deb9bd3edb1d3531ffa689968339f9fd390a5d5) [092e554955db2591d09b57d3b87a575ee0d510a9](https://github.com/jhnns/rewire/commit/092e554955db2591d09b57d3b87a575ee0d510a9)
- **Breaking**: Remove CoffeeScript support [e0ea17d2e13ef4fb054980c1c5c62edcfd10632f](https://github.com/jhnns/rewire/commit/e0ea17d2e13ef4fb054980c1c5c62edcfd10632f)
- Add TypeScript support [#204](https://github.com/jhnns/rewire/pull/204)

### 6.0.0
- **Breaking**: Remove Node v8 support. We had to do this because one of our dependencies had security issues and the version with the fix dropped Node v8 as well.
- Update dependencies [#193](https://github.com/jhnns/rewire/issues/193)
- Fix Modifying globals within module leaks to global with Node >=10 [#167](https://github.com/jhnns/rewire/issues/167)
- Fixed import errors on modules with shebang declarations [#179](https://github.com/jhnns/rewire/pull/179)

### 5.0.0
- **Breaking**: Remove Node v6 support. We had to do this because one of our dependencies had security issues and the version with the fix dropped Node v6 as well.
- Update dependencies [#159](https://github.com/jhnns/rewire/pull/159) [#172](https://github.com/jhnns/rewire/issues/172) [#154](https://github.com/jhnns/rewire/issues/154) [#166](https://github.com/jhnns/rewire/issues/166)

### 4.0.1
- Fix a bug where `const` was not properly detected [#139](https://github.com/jhnns/rewire/pull/139)

### 4.0.0
- **Breaking**: Remove official node v4 support. It probably still works with node v4, but no guarantees anymore.
- **Potentially breaking**: Replace babel with regex-based transformation [9b77ed9a293c538ec3eb5160bcb933e012ce517f](https://github.com/jhnns/rewire/commit/9b77ed9a293c538ec3eb5160bcb933e012ce517f).
This should not break, but it has been flagged as major version bump as the regex might not catch all cases reliably and thus fail for some users.
- Improve runtime performance [#132](https://github.com/jhnns/rewire/issues/132)
- Use `coffeescript` package in favor of deprecated `coffee-script` [#134](https://github.com/jhnns/rewire/pull/134)

### 3.0.2
- Fix a bug where rewire used the project's .babelrc [#119](https://github.com/jhnns/rewire/issues/119) [#123](https://github.com/jhnns/rewire/pull/123)

### 3.0.1
- Fix Unknown Plugin "transform-es2015-block-scoping" [#121](https://github.com/jhnns/rewire/issues/121) [#122](https://github.com/jhnns/rewire/pull/122)

### 3.0.0
- **Breaking:** Remove support for node versions below 4
- Add support for `const` [#79](https://github.com/jhnns/rewire/issues/79) [#95](https://github.com/jhnns/rewire/issues/95) [#117](https://github.com/jhnns/rewire/pull/117) [#118](https://github.com/jhnns/rewire/pull/118)

### 2.5.2
- Fix cluttering of `require.extensions` even if CoffeeScript is not installed [#98](https://github.com/jhnns/rewire/pull/98)

### 2.5.1
- Ignore modules that export non-extensible values like primitives or sealed objects [#83](https://github.com/jhnns/rewire/pull/83)

### 2.5.0
- Provide shared test cases to other modules that mimic rewire's behavior in other environments [jhnns/rewire-webpack#18](https://github.com/jhnns/rewire-webpack/pull/18)

### 2.4.0
- Make rewire's special methods `__set__`, `__get__` and `__with__` writable [#78](https://github.com/jhnns/rewire/pull/78)

### 2.3.4
- Add license and keywords to package.json [#59](https://github.com/jhnns/rewire/issues/59) [#60](https://github.com/jhnns/rewire/issues/60)

### 2.3.3
- Fix issue where the strict mode was not detected when a comment was before "strict mode"; [#54](https://github.com/jhnns/rewire/issues/54)

### 2.3.2
- Fix a problem when a function declaration had the same name as a global variable [#56](https://github.com/jhnns/rewire/issues/56)
- Add README section about rewire's limitations

### 2.3.1
- Fix problems when global objects like JSON, etc. have been rewired [#40](https://github.com/jhnns/rewire/issues/40)

### 2.3.0
- Add possibility to mock undefined, implicit globals [#35](https://github.com/jhnns/rewire/issues/35)

### 2.2.0
- Add support for dot notation in __set__(env) calls [#39](https://github.com/jhnns/rewire/issues/39)

### 2.1.5
- Fix issues with reverting nested properties [#39](https://github.com/jhnns/rewire/issues/39)

### 2.1.4
- Fix problems when an illegal variable name is used for a global

### 2.1.3
- Fix shadowing of internal `module`, `exports` and `require` when a global counterpart exists [jhnns/rewire-webpack#6](https://github.com/jhnns/rewire-webpack/pull/6)

### 2.1.2
- Fixed missing `var` statement which lead to pollution of global namespace [#33](https://github.com/jhnns/rewire/pull/33)

### 2.1.1
- Made magic `__set__`, `__get__` and `__with__` not enumerable [#32](https://github.com/jhnns/rewire/pull/32)

### 2.1.0
- Added revert feature of `__set__` method
- Introduced `__with__` method to revert changes automatically

### 2.0.1
- Added test coverage tool
- Small README and description changes

### 2.0.0
- Removed client-side bundler extensions. Browserify is not supported anymore. Webpack support has been extracted
  into separate repository https://github.com/jhnns/rewire-webpack

### 1.1.3
- Removed IDE stuff from npm package

### 1.1.2
- Added deprecation warning for client-side bundlers
- Updated package.json for node v0.10

### 1.1.1
- Fixed bug with modules that had a comment on the last line

### 1.1.0
- Added Coffee-Script support
- Removed Makefile: Use `npm test` instead.

### 1.0.4
- Improved client-side rewire() with webpack

### 1.0.3
- Fixed error with client-side bundlers when a module was ending with a comment

### 1.0.2
- Improved strict mode detection

### 1.0.1
- Fixed crash when a global module has been used in the browser

### 1.0.0
- Removed caching functionality. Now rewire doesn't modify `require.cache` at all
- Added support for [webpack](https://github.com/webpack/webpack)-bundler
- Moved browserify-middleware from `rewire.browserify` to `rewire.bundlers.browserify`
- Reached stable state :)
