# postcss-plugin-px2viewport [![NPM version](https://badge.fury.io/js/postcss-plugin-px2viewport.svg)](http://badge.fury.io/js/postcss-plugin-px2viewport)

A plugin for [PostCSS](https://github.com/ai/postcss)  that converts px to viewport units or/and rem.

### Options

Default:
```js
{
  viewportWidth: 750,
  remRatio: 10, // document.documentElement.style.fontSize = document.documentElement.clientWidth / remRatio + 'px';
  unitPrecision: 5,
  selectorBlackList: [],
  minPixelValue: 1,
  toRem: true,
  mediaQuery: false
}
```
- `viewportWidth` (Number) The width of the viewport.
- `remRatio` (Number) For generates the root element `font-size`.
- `toRem` (Boolean) Whether to convert to `rem`.
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.

If you set the `toRem` is true. You'll append some code into your html file.

```js
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px'
```

### About unit `dpx`

It support `dpx` to resolve a pixel border problems. You need like this in your html file `body` tag.

```js
if (window.devicePixelRatio && window.devicePixelRatio >= 2) {
  var el = document.createElement('div')
  el.style.border = '.5px solid transparent'
  document.body.appendChild(el)
  if (el.offsetHeight === 1) {
    document.documentElement.classList.add('hairlines')
  }
  document.body.removeChild(el)
}
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
    line-height: 22px;
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
    line-height: 0.29333rem;
    line-height: 2.93333vw;
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

