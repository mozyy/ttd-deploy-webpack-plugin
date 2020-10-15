import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: [
    // {
    //   file: 'dist/bundle.amd.js',
    //   format: 'amd',
    // },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.es.js',
      format: 'es',
    },
    // {
    //   file: 'dist/bundle.iife.js',
    //   format: 'iife',
    // },
    // {
    //   file: 'dist/bundle.umd.js',
    //   format: 'umd',
    // },
    // {
    //   file: 'dist/bundle.system.js',
    //   format: 'system',
    // },
  ],
  plugins: [ 
    json(),
    // resolve(),
    // babel({ babelHelpers: 'bundled' }),
    commonjs(),
   ]
};