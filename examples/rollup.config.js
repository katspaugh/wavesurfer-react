import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
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
]
