// @ts-check
// import { swc } from 'rollup-plugin-swc3';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').ModuleFormat[]} */
const formats = ['es', 'cjs'];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  {
    input: 'src/index.ts',
    output: formats.map((format) => ({
      file: `dist/index.${format === 'es' ? 'mjs' : 'js'}`,
      format,
      sourcemap: true,
      sourcemapExcludeSources: true,
    })),
    plugins: [
      typescript(),
      // swc({
      //   jsc: {
      //     parser: {
      //       syntax: 'typescript',
      //     },
      //     target: 'es5',
      //   },
      // }),
    ],
  },
  {
    input: './src/index.ts',
    output: [{ file: 'dist/index.d.ts' }],
    plugins: [dts()],
  },
];

export default configs;
