# postcss-plugin-px2viewport [![NPM version](https://badge.fury.io/js/postcss-plugin-px2viewport.svg)](http://badge.fury.io/js/postcss-plugin-px2viewport)

A plugin for [PostCSS](https://github.com/ai/postcss)  that converts px to viewport units or/and rem.

### Options

Default:

```js
{
  viewportWidth: 750,
  remRatio: 10,
  unitPrecision: 5,
  minPixelValue: 1,
  toRem: false,
  toViewport: true,
  handleDpx: false,
  mediaQuery: false
}
```

- `viewportWidth` (Number) The width of the viewport.
- `remRatio` (Number) For generates the root element `font-size`.
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `toRem` (Boolean) Whether to convert to `rem`.
- `toViewport` (Boolean) Whether to convert to `vw`.
- `handleDpx` (Boolean) Whether to handle dpx unit, close it can improve efficiency..
- `mediaQuery` (Boolean) Allow px to be converted in media queries.

If you set the `toRem` is true. You'll append some codes into your entry file.

```js
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px'
```

### About unit `dpx`

It support `dpx` to resolve a pixel border problems. You need add some codes into your entry file like this.

```js
if (window.devicePixelRatio && window.devicePixelRatio >= 2) {
  var fakeBody = document.createElement('body')
  var testElement = document.createElement('div')
  testElement.style.border = '.5px solid transparent'
  fakeBody.appendChild(testElement)
  docEl.appendChild(fakeBody)
  if (testElement.offsetHeight === 1) {
    docEl.classList.add('hairlines')
  }
  docEl.removeChild(fakeBody)
}
```

### About unit `rpx`

`rpx` will just convert to `px`.

### `handleDpx`

If you set options `toRem` and `handleDpx` to `true`. It suggests that you add the below codes into your entry file.

```js
(function flexible (window, document) {
  var docEl = document.documentElement
  var dpr = window.devicePixelRatio || 1

  // set 1rem = viewWidth / 10
  function setRemUnit () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
  }

  setRemUnit()

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit()
    }
  })

  // detect 0.5px supports
  if (dpr >= 2) {
    var fakeBody = document.createElement('body')
    var testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}(window, document))
```

### Example

```css
.class .line {
  margin: -10px .5vh;
  padding: 5vmin 9.5px 1px;
  border: 3px solid black;
  border-bottom-width: 1px;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
}
.class2 {
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 20px;
  line-height: 30px;
}
@media (min-width: 750px) {
  .class3 {
    border: 1dpx solid 10px;
    font-size: 16px;
    line-height: 22rpx;
  }
}
.class4 {
  border-top: 1dpx solid black;
  border-bottom: 1dpx solid black;
}

// convert to

.class .line {
  margin: -0.13333rem .5vh;
  margin: -1.33333vw .5vh;
  padding: 5vmin 0.12667rem 1px;
  padding: 5vmin 1.26667vw 1px;
  border: 0.04rem solid black;
  border: 0.4vw solid black;
  border-bottom-width: 1px;
  font-size: 0.18667rem;
  font-size: 1.86667vw;
  line-height: 0.26667rem;
  line-height: 2.66667vw;
  color: #fff;
}
.class2 {
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 0.26667rem;
  font-size: 2.66667vw;
  line-height: 0.4rem;
  line-height: 4vw;
}
@media (min-width: 750px) {
  .class3 {
    border: 1px solid 0.13333rem;
    border: 1px solid 1.33333vw;
    font-size: 0.21333rem;
    font-size: 2.13333vw;
    line-height: 22px;
  }
  .hairlines .class3 {
    border: 0.5px solid 0.13333rem;
    border: 0.5px solid 1.33333vw;
  }
}
.class4 {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
}
.hairlines .class4 {
  border-top: 0.5px solid black;
  border-bottom: 0.5px solid black;
}
```

