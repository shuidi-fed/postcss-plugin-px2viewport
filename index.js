const postcss = require('postcss')
const objectAssign = require('object-assign')

// excluding regex trick: http://www.rexegg.com/regex-best-trick.html
// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit
const pxRegex = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/ig
const dpxRegExp = /(\d*\.?\d+)dpx/ig

const defaults = {
  viewportWidth: 750,
  remRatio: 10,
  unitPrecision: 5,
  minPixelValue: 1,
  toRem: false,
  toViewport: true,
  handleDpx: false, // handle dpx unit, close it can improve efficiency.
  mediaQuery: false,
  exclude: '' // exclude file path
}

module.exports = postcss.plugin('postcss-plugin-px2viewport', options => {
  const opts = objectAssign({}, defaults, options)
  const px2vwReplace = createPx2Viewport(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision)
  const px2remReplace = createPx2Rem(opts.viewportWidth, opts.remRatio, opts.minPixelValue, opts.unitPrecision)
  const dpxReplace = createDpx(opts.unitPrecision)

  return (root, result) => {
    const filePath = root.source.input.file
    if (filePath && opts.exclude && filePath.match(opts.exclude)) return

    if (opts.toRem || opts.toViewport) {
      root.walkDecls((decl, i) => {
        if (decl.value.indexOf('px') === -1) return

        const declValue = decl.value

        if (decl.value.indexOf('rpx') > -1) {
          decl.value = declValue.replace('rpx', 'px')
          return
        }

        if (opts.toRem ^ opts.toViewport) {
          decl.value = declValue.replace(pxRegex, opts.toRem ? px2remReplace : px2vwReplace)
        }

        if (opts.toViewport && opts.toRem) {
          decl.value = declValue.replace(pxRegex, px2vwReplace)

          const cloned = decl.clone({value: declValue.replace(pxRegex, px2remReplace)})
          if (cloned.value !== declValue) {
            decl.parent.insertBefore(decl, cloned)
          }
        }
      })
    }

    if (opts.handleDpx) {
      root.walkRules(rule => {
        const newRule = postcss.rule()
        newRule.selector = '.hairlines ' + rule.selector
        rule.each(decl => {
          if (dpxRegExp.test(decl.value)) {
            newRule.nodes.push(decl.clone({value: decl.value.replace(dpxRegExp, dpxReplace)}))
            decl.value = decl.value.replace('d', '')
          }
        })

        if (newRule.nodes.length) {
          rule.parent.insertAfter(rule, newRule)
        }
      })
    }

    if (opts.mediaQuery) {
      root.walkAtRules('media', rule => {
        if (rule.params.indexOf('px') === -1) return
        rule.params = rule.params.replace(pxRegex, px2vwReplace)
      })
    }
  }
})

function createPx2Viewport (viewportSize, minPixelValue, unitPrecision) {
  return (m, $1) => {
    if (!$1) return m

    let pixels = parseFloat($1)
    if (pixels <= minPixelValue) {
      return m
    }

    return toFixed((pixels / viewportSize * 100), unitPrecision) + 'vw'
  }
}

function createPx2Rem (viewportSize, remRatio, minPixelValue, unitPrecision) {
  return (m, $1) => {
    if (!$1) return m

    let pixels = parseFloat($1)
    if (pixels <= minPixelValue) return m

    return toFixed((pixels / viewportSize * remRatio), unitPrecision) + 'rem'
  }
}

function createDpx (unitPrecision) {
  return (m, $1) => {
    if (!$1) return m

    let pixels = parseFloat($1)
    return toFixed(pixels / 2, unitPrecision) + 'px'
  }
}

function toFixed (number, precision) {
  let multiplier = Math.pow(10, precision + 1)
  let wholeNumber = Math.floor(number * multiplier)
  return Math.round(wholeNumber / 10) * 10 / multiplier
}
