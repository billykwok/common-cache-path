import { describe, afterEach, test, expect } from '@jest/globals';
import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';

import type { Options } from '../src';

const root = '/users/abc/projects/scd';
const directory = {
  [path.join(root, 'package.json')]: '{"name":"scd"}\n',
  [path.join(root, 'README.md')]: '# Application',
  [path.join(root, 'src/index.js')]: '',
  [path.join(
    root,
    'node_modules/@foo/bar/package.json'
  )]: '{"name":"@foo/bar"}\n',
  [path.join(root, 'node_modules/@foo/bar/README.md')]: '# Library',
  [path.join(root, 'node_modules/@foo/bar/index.js')]: '',
};

describe('unit tests', () => {
  const namespace = '@foo/bar';
  const spyChdir = jest.spyOn(process, 'cwd');
  spyChdir.mockReturnValue(root);

  void afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('finds from process.cwd', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    expect(commonCachePath({ namespace })('file', 'test')).toEqual(
      path.join(root, '.cache/@foo/bar/file/test')
    );
    expect(volume.existsSync(path.join(root, '.cache/@foo/bar'))).toEqual(true);
  });

  test('finds from overridden options.cwd', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    expect(
      commonCachePath({
        namespace,
        cwd: path.join(root, 'node_modules/@foo/bar'),
      })('file', 'test')
    ).toEqual(
      path.join(root, 'node_modules/@foo/bar/.cache/@foo/bar/file/test')
    );
    expect(
      volume.existsSync(
        path.join(root, 'node_modules/@foo/bar/.cache/@foo/bar')
      )
    ).toEqual(true);
  });

  test('dir already exist', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    volume.mkdirpSync(path.join(root, '.cache/@foo/bar'));
    expect(commonCachePath({ namespace })('file', 'test')).toEqual(
      path.join(root, '.cache/@foo/bar/file/test')
    );
    expect(volume.existsSync(path.join(root, '.cache/@foo/bar'))).toEqual(true);
  });

  test('custom cache dir', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    expect(
      commonCachePath({ namespace, dirname: 'custom-cache' })('file', 'test')
    ).toEqual(path.join(root, 'custom-cache/@foo/bar/file/test'));
    expect(volume.existsSync(path.join(root, 'custom-cache/@foo/bar'))).toEqual(
      true
    );
  });

  test('custom CACHE_DIR', async () => {
    const original = process.env;
    process.env = { CACHE_DIR: '/opt/custom-cache' };
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    expect(commonCachePath({ namespace })('file', 'test')).toEqual(
      '/opt/custom-cache/@foo/bar/file/test'
    );
    expect(volume.existsSync('/opt/custom-cache/@foo/bar')).toEqual(true);
    process.env = original;
  });

  test('ignores `false` for CACHE_DIR environment variable', async () => {
    const original = process.env;
    process.env = { CACHE_DIR: 'FALSE' };
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    expect(commonCachePath({ namespace })('file', 'test')).toEqual(
      path.join(root, '.cache/@foo/bar/file/test')
    );
    expect(volume.existsSync(path.join(root, '.cache/@foo/bar'))).toEqual(true);
    process.env = original;
  });

  test('resolve name automatically when options.name is not given', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    jest.doMock('pkg-conf', () => ({ sync: () => '@foo/bar' }));
    const { commonCachePath } = await import('../src');

    expect(commonCachePath()('file', 'test')).toEqual(
      path.join(root, '.cache/@foo/bar/file/test')
    );
    expect(volume.existsSync(path.join(root, '.cache/@foo/bar'))).toEqual(true);
  });

  test('throw when options.name is not given and cannot be automatically resolved', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    jest.doMock('pkg-conf', () => ({ sync: () => null }));
    const { commonCachePath } = await import('../src');

    expect(() => commonCachePath({} as Options)).toThrowError(
      'Option "name" is missing and cannot be automatically resolved'
    );
  });

  test('throw when package path does not exist', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () => createFsFromVolume(volume));
    const { commonCachePath } = await import('../src');

    volume.unlinkSync(path.join(root, 'package.json'));
    expect(() => commonCachePath({ namespace })).toThrowError(
      'Root directory of project cannot be found'
    );
  });

  test('throw when package path is not writtable', async () => {
    const volume = Volume.fromJSON(directory, root);
    jest.doMock('fs', () =>
      Object.assign(createFsFromVolume(volume), {
        accessSync: () => {
          throw new Error();
        },
      })
    );
    const { commonCachePath } = await import('../src');

    expect(() => commonCachePath({ namespace })).toThrowError(
      'Cache directory cannot be created without write permission'
    );
  });
});
