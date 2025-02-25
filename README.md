# postcss-url-copy

A small PostCSS plugin to copy assets from an entry path to a given path. Offers functions to transform the URL both before
loading (to transform any aliases to something on disk) and before writing (to specify what path should be written to
the CSS file).

## Options

```
{
  entryPath: string // Absolute path to where the CSS file is located that we're about to transform
  to: string // Absolute path to where to write the distributable files lie
  assetsDestPath: string // Absolute path to where to write the assets to
  transformUrlBeforeLoad: (url: string) => string // To transform the URL before the fileon disk is being loaded
  transformUrlBeforeWrite: (url: string) => string // To transform the URL before its written to the CSS file, gets result of transformUrlBeforeLoad
}
```
