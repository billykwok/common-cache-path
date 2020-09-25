import path from 'path';
import fs from 'fs';
import pkgdir from 'pkg-dir';
import mkdir from 'make-dir';
import pkgConf from 'pkg-conf';
import callsites from 'callsites';

import type { CallSite } from 'callsites';

export type Options = { namespace?: string; dirname?: string; cwd?: string };

function isWritable(path: string) {
  try {
    fs.accessSync(path, fs.constants.W_OK);
    return true;
  } catch (_) {
    return false;
  }
}

function createPathResolver(directory: string) {
  mkdir.sync(directory);
  return (...args: string[]) => path.join(directory, ...args);
}

function callerPackageName(callsites: CallSite[]): string {
  for (const callsite of callsites) {
    const filename = callsite.getFileName();
    if (filename && filename !== __filename) {
      const name = pkgConf.sync('name', { cwd: filename });
      if (typeof name === 'string') {
        return name;
      }
    }
  }
  throw new Error(
    'Option "name" is missing and cannot be automatically resolved'
  );
}

export function commonCachePath(
  options: Options = {}
): (...args: string[]) => string {
  const namespace = options.namespace || callerPackageName(callsites());
  const envCacheDir = process.env.CACHE_DIR;
  if (
    envCacheDir &&
    !['TRUE', 'FALSE', 'true', 'false', '1', '0'].includes(envCacheDir)
  ) {
    return createPathResolver(path.join(envCacheDir, namespace));
  }
  const cwd = options.cwd || process.cwd();
  const root = pkgdir.sync(cwd);
  if (!root) {
    throw new Error('Root directory of project cannot be found');
  }
  if (!isWritable(root)) {
    throw new Error(
      'Cache directory cannot be created without write permission'
    );
  }
  return createPathResolver(
    path.join(root, options.dirname || '.cache', namespace)
  );
}
