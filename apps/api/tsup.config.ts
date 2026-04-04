import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  dts: false,
  shims: true,
});
