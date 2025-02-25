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
        decl.value.match(/url\(\s*['"]?(.*?)['"]?\s*\)/ig).map(url => {
          return url.replace(/url\(\s*['"]?(.*?)['"]?\s*\)/ig, '$1')
        })
          .filter(url => !url.startsWith('data') && !url.endsWith('?copied'))
          .forEach(url => {
            const urlPath = opts.transformUrlBeforeLoad(url)
            const resolvedUrlPath = resolve(urlPath)
            if (!existsSync(resolvedUrlPath)) {
              throw new Error(`Asset not found: ${resolvedUrlPath}`)
            }

            if (!existsSync(opts.assetsDestPath)) {
              mkdirSync(opts.assetsDestPath, { recursive: true })
            }

            const fileName = basename(resolvedUrlPath)
            let destPath = opts.assetsDestPath + sep + fileName

            copyFileSync(resolvedUrlPath, destPath)

            destPath = opts.transformUrlBeforeWrite(destPath)

            decl.value = decl.value.replace(url, destPath + '?copied')
          })
      }
    }
  }
}

module.exports.postcss = true
