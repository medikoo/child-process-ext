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

#### `spawn(command[, args[, options]])`

Cross system compliant [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) (backed by [`cross-spawn`](https://www.npmjs.com/package/cross-spawn)).

Works exactly same way as node's [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with difference that promise is returned that resolves once process exits.

Following properties are exposed on return promise:

-   `child` - child process
-   `stdout` - stdout stream
-   `stderr` - stderr stream
-   `stdoutBuffer` - Buffer that exposes so far written `stdout`
-   `stderrBuffer` - Buffer that exposes so far written `stderrr`

Promise resolves with object with three properties:

-   `code` - Exit code of a child proces
-   `signal` - Signal that terminated the process
-   `stdoutBuffer` - Buffer containing gathered `stdout` content
-   `stderrBuffer` - Buffer containing gathered `stderr` content

If process exits with non zero code, then promise is rejected with an error exposing same properties as above

##### Non standard options

###### `split: false`

Whether stdout data should be split by lines. If set to `true`, then `stdout` and `stderr` on promise expose mappers of original `stdout` and `stderr` that emit each line with distinct `data` event

### Tests

```bash
npm test
```

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/child-process-ext/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/child-process-ext
[win-build-image]: https://ci.appveyor.com/api/projects/status/8r0yv6561qwijfbe?svg=true
[win-build-url]: https://ci.appveyor.com/api/project/medikoo/child-process-ext
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/child-process-ext.svg
[cov-url]: https://codecov.io/gh/medikoo/child-process-ext
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/child-process-ext.svg
[npm-url]: https://www.npmjs.com/package/child-process-ext
