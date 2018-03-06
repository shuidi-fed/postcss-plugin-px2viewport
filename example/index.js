const fs = require('fs')
const postcss = require('postcss')
const pxToViewport = require('..')
const css = fs.readFileSync('main.css', 'utf8')
const options = {
  replace: false
}

const processedCss = postcss(pxToViewport(options)).process(css).css

fs.writeFile('main-viewport.css', processedCss, function (err) {
  if (err) {
    throw err
  }
  console.log('File with viewport units written.')
})
