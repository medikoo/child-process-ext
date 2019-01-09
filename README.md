[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# child-process-ext

## [Node.js `child_process`](https://nodejs.org/api/child_process..html) extensions

### Installation

```bash
npm install child-process-ext
```

### API

#### `spawn`

Cross system compliant [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) (backed by [`cross-spawn`](https://www.npmjs.com/package/cross-spawn)).

Works exactly same way as node's [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with difference that promise is returned that resolves once process exits.

Original result of `spawn` (child process instance) is exposed on promise `child` property.

Promise resolves with object with three properties:

-   `code` - Exit code of a child proces
-   `signal` - Signal that terminated the process
-   `stdout` - Buffer containing gathered `stdout` content
-   `stderr` - Buffer containing gathered `stderr` content

If process exits with non zero code, then promise is rejected with an error exposing same properties as above

### Tests

```bash
npm test
```

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/child-process-ext/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/child-process-ext
[win-build-image]: https://ci.appveyor.com/api/projects/status/?svg=true
[win-build-url]: https://ci.appveyor.com/api/project/medikoo/child-process-ext
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/child-process-ext.svg
[cov-url]: https://codecov.io/gh/medikoo/child-process-ext
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/child-process-ext.svg
[npm-url]: https://www.npmjs.com/package/child-process-ext
