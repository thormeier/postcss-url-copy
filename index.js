const { existsSync, mkdirSync, copyFileSync } = require('fs')
const { isAbsolute, sep, resolve, basename } = require('path')

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  if (!opts.destPath) {
    opts.destPath = '.'
  }

  if (!opts.assetsDestPath) {
    opts.assetsDestPath = '.'
  }

  if (!opts.transformUrlBeforeLoad) {
    opts.transformUrlBeforeLoad = (url) => url
  }

  if (!opts.transformUrlBeforeWrite) {
    opts.transformUrlBeforeWrite = (url) => url
  }

  if (!isAbsolute(opts.destPath)) {
    throw new Error(`destPath path ${opts.destPath} should be absolute.`)
  }

  if (!isAbsolute(opts.assetsDestPath)) {
    throw new Error(`assetsDestPath ${opts.assetsDestPath} should be absolute.`)
  }

  return {
    postcssPlugin: 'postcss-url-copy',

    Declaration (decl) {
      if (decl.value.startsWith('url(')) {
        let urlPath = decl.value.replace(/url\(\s*['"]?(.*?)['"]?\s*\)/ig, '$1')

        urlPath = opts.transformUrlBeforeLoad(urlPath)

        const resolvedPathUrl = resolve(urlPath)

        if (!existsSync(resolvedPathUrl)) {
          throw new Error(`Asset not found: ${resolvedPathUrl}`)
        }

        if (!existsSync(opts.assetsDestPath)) {
          mkdirSync(opts.assetsDestPath, { recursive: true })
        }

        const fileName = basename(resolvedPathUrl)

        let destPath = opts.assetsDestPath + sep + fileName

        copyFileSync(resolvedPathUrl, destPath)

        destPath = opts.transformUrlBeforeWrite(destPath)

        decl.value = `url(${destPath})`
      }
    }
  }
}

module.exports.postcss = true
