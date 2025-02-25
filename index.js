const { existsSync, mkdirSync, copyFileSync } = require('fs')
const { isAbsolute, sep, resolve, basename } = require('path')

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  if (!opts.entryPath) {
    opts.entryPath = '.'
  }

  if (!opts.to) {
    opts.to = '.'
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

  if (!existsSync(opts.entryPath)) {
    throw new Error(`Entry path ${opts.entryPath} doesn't exist.`)
  }

  if (!isAbsolute(opts.entryPath)) {
    throw new Error(`Entry path ${opts.entryPath} should be absolute.`)
  }

  if (!isAbsolute(opts.to)) {
    throw new Error(`To path ${opts.to} should be absolute.`)
  }

  if (!isAbsolute(opts.assetsDestPath)) {
    throw new Error(`Assets dest path ${opts.assetsDestPath} should be absolute.`)
  }

  return {
    postcssPlugin: 'postcss-url-copy',

    Declaration (decl) {
      if (decl.value.startsWith('url(')) {
        let urlPath = decl.value.replace(/url\(\s*['"]?(.*?)['"]?\s*\)/ig, '$1')

        if (!isAbsolute(urlPath)) {
          urlPath = opts.entryPath + sep + urlPath
        }

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

        destPath = destPath.replace(opts.to, '.')
        destPath = opts.transformUrlBeforeWrite(destPath)

        decl.value = destPath
      }
    }
  }
}

module.exports.postcss = true
