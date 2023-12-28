import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default [
  // ES module
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    plugins: [typescript(), terser()],
  },
]
