import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'

export default [
  // ES module
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    plugins: [typescript(), terser()],
  },

  // Examples
  {
    input: 'examples/app.tsx',
    output: {
      file: 'examples/app.js',
      format: 'esm',
    },
    plugins: [typescript(), commonjs(), resolve(), injectProcessEnv({ NODE_ENV: '' })],
  },
]
