const postcss = require('postcss')
const { equal } = require('node:assert')
const { sep } = require('node:path')
const { test } = require('node:test')

const plugin = require('./../')

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  equal(result.css, output)
  equal(result.warnings().length, 0)
}

test('does something', async () => {
  await run('a{ background-image: url(\'./assets/foobar.svg\'); }', 'a{ background-image: url(\'./assets/foobar.svg?copied\'); }', {
    destPath: __dirname + sep + 'dist',
    assetsDestPath: __dirname + sep + 'dist' + sep + 'assets',
    transformUrlBeforeLoad: (url) => url.replace('.', __dirname + sep + 'src'),
    transformUrlBeforeWrite: (url) => url.replace(__dirname + sep + 'dist', '.'),
  })
})

