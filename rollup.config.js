import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default [
  // ES module
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    plugins: [
      typescript({
        exclude: ['dist', 'examples'],
      }),
      terser(),
    ],
  },
]
