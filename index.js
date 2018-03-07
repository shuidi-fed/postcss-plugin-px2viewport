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
  remRatio: 10, // document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';
  unitPrecision: 5,
  selectorBlackList: [],
  minPixelValue: 1,
  toRem: true,
  mediaQuery: false
}

module.exports = postcss.plugin('postcss-plugin-px2viewport', options => {
  const opts = objectAssign({}, defaults, options)
  const px2vwReplace = createPx2Viewport(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision)
  const px2remReplace = createPx2Rem(opts.viewportWidth, opts.remRatio, opts.minPixelValue, opts.unitPrecision)
  const dpxReplace = createDpx(opts.unitPrecision)

  return css => {
    css.walkDecls((decl, i) => {
      if (decl.value.indexOf('px') === -1) return

      if (blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) return

      const declValue = decl.value

      decl.value = declValue.replace(pxRegex, px2vwReplace)
      if (opts.toRem) {
        const cloned = decl.clone({value: declValue.replace(pxRegex, px2remReplace)})
        if (cloned.value === declValue) return
        decl.parent.insertBefore(decl, cloned)
      }
    })

    css.walkRules(rule => {
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

    if (opts.mediaQuery) {
      css.walkAtRules('media', rule => {
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

function blacklistedSelector (blacklist, selector) {
  if (typeof selector !== 'string') return
  return blacklist.some(regex => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1
    return selector.match(regex)
  })
}
