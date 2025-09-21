import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts'
    },
  },
  lib: [
    {
      format: 'esm',
      dts: true,
      bundle: true,
      shims: {
        cjs: {
          'import.meta.url': true,
        },
        esm: {
          __filename: true,
          __dirname: true,
          require: true,
        },
      }
    },
    {
      format: 'cjs',
      bundle: true,
      shims: {
        cjs: {
          'import.meta.url': true,
        },
        esm: {
          __filename: true,
          __dirname: true,
          require: true,
        },
      }
    },
  ],
  output: {
    sourceMap: true,
    minify: false,
    cleanDistPath: false,
  }
})
