import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import injectProcessEnv from 'rollup-plugin-inject-process-env'

export default [
  {
    input: 'app.tsx',
    output: {
      file: 'app.js',
      format: 'esm',
    },
    plugins: [typescript(), commonjs(), resolve(), injectProcessEnv({ NODE_ENV: '' })],
  },
  {
    input: 'peaks/app.tsx',
    output: {
      file: 'peaks/app.js',
      format: 'esm',
    },
    plugins: [typescript(), commonjs(), resolve(), json(), injectProcessEnv({ NODE_ENV: '' })],
  }
]
