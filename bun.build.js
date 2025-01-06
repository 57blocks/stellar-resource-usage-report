const results = await Bun.build({
  entrypoints: ['./src/main.ts'],
  publicPath: '',
  outdir: './dist',
  sourcemap: 'inline',
  minify: true,
});

if (results.success == false) {
  console.error('Build failed');
  for (const message of results.logs) {
    console.error(message);
  }
} else {
  console.log('Compiled ' + results.outputs.length + ' javascript files...');
}
