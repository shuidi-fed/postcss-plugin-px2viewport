const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const pxToViewport = require('..')
const css = fs.readFileSync(path.resolve(__dirname, 'main.css'), 'utf8')
const options = {
  toRem: true
}

const processedCss = postcss(pxToViewport(options)).process(css).css

fs.writeFile(path.resolve(__dirname, 'main-viewport.css'), processedCss, function (err) {
  if (err) {
    throw err
  }
  console.log('File with viewport units written.')
})
