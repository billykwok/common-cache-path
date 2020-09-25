# Common Cache Path

[![npm version](https://badgen.net/npm/v/common-cache-path)](https://www.npmjs.com/package/common-cache-path)
[![download](https://badgen.net/npm/dm/common-cache-path)](https://www.npmjs.com/package/common-cache-path)
[![codecov](https://codecov.io/gh/billykwok/common-cache-path/branch/master/graph/badge.svg)](https://codecov.io/gh/billykwok/common-cache-path)
[![License](https://badgen.net/npm/license/common-cache-path)](https://github.com/billykwok/common-cache-path/blob/master/LICENSE)
[![CircleCI](https://circleci.com/gh/billykwok/common-cache-path/tree/master.svg?style=svg)](https://circleci.com/gh/billykwok/common-cache-path/tree/master)

Finding the best and standard place to store cache. Especially useful for library authors. A smarter and more customizable alternative to [`find-cache-dir`](https://github.com/avajs/find-cache-dir).

## Difference

- Zero config with smart defaults.
- Smart resolution of namespace without the need to manually specify via the `name` option.
- Default shared cache directory sits in `<ProjectRoot>/.cache` instead of `<ProjectRoot>/node_modules/.cache` to support Yarn PnP and avoid modifying `node_modules`.
- Cache location can be overridden to other places to enable easier testing and greater flexibility. For example, when using `Netlify` with `webpack` loaders and plugins, the data can be written directly into `/opt/build/cache/` to enable cross-build caching.

## Installation

```sh
yarn add common-cache-path
```

## Usage

```javascript
import fs from 'fs';
import { commonCachePath } from 'common-cache-path';

// Assume that
// 1. process.cwd is /users/abc/project/app
// 2. this file is in /users/abc/project/app/node_modules/@foo/bar/lib/index.js
const resolvePath = commonCachePath();
fs.writefileSync(resolvePath('some/file.txt'), 'content');
// /users/abc/project/app/.cache/@foo/bar/some/file.txt is created with content 'content'
```

## Options

### Shared Cache Directory

`dirname: string`  
The name of the shared cache directory (or a path relative to the root directory of the project that uses your library).  
Optional. The default value is `.cache`.

### Namespace

`namespace: string`  
The namespace of your cache directory. Your cache directory is a child directory inside a shared cache directory. This helps prevent conflict among multiple cache users.  
Optional. By default, its value is resolved by finding the package name in the `name` field of the closest `package.json` to the caller script of `commonCachePath()`.  
For example, if your library calls `commonCachePath` in `node_modules/@foo/bar/lib/index.js`, the `name` field of `node_modules/@foo/bar/package.json` is used as default namespace.

> To make sure that different libraries do not interfere with each other. You are strongly suggested to leave it as default.

### Current Working Directory

`cwd: string`  
The path of directory that project root searching should start from.  
Optional. The default value is `process.cwd()`.

## Issues and Feedback

Please voice your opinion and report bugs in the [issues](https://github.com/billykwok/common-cache-path/issues) sections of this GitHub project.

## Contributing

You are more than welcome to add more functionalities, improve documentation, fix bugs, and anything you think is needed. The build step is pretty self-explanatory. Please refer to [CONTRIBUTING.md](https://github.com/billykwok/common-cache-path/blob/master/CONTRIBUTING.md) for more details.

## License

MIT
