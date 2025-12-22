export type IRule = {
  val: Numeric // 图片地址,文本内容
  reg: 'before' | 'after' | string // 替换规则
  eg: false
  type?: 'text' | 'img' | 'spanimg' // 默认为'text'，src取本项目阿里云的，fid取后端返回的，s取yohoSrc的图片
  options: IOptions
  className?: string
  styles?: string | Object
}

export type IOptions = {
  width?: Numeric // 宽度
  translateY?: Numeric // Y方向偏移
  y?: Numeric // Y方向偏移
  color?: string // 颜色
  fontSize?: Numeric // 大小
  fontFamily?: string // 字体
  fontWeight?: Numeric // 字重
  gap?: Numeric // 快速设置左右margin，注意:有style时，会被style内设置的样式覆盖
}

// 添加计量单位
export type Numeric = number | string
export function addUnit(value?: Numeric): string | undefined {
  const isDef = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null
  const isNumeric = (val: Numeric): val is string =>
    typeof val === 'number' || /^\d+(\.\d+)?$/.test(val)
  if (isDef(value)) {
    return isNumeric(value) ? `${value}rem` : String(value)
  }
  return undefined
}

// 驼峰
export const uppercasePattern = /([A-Z])/g
export const msPattern = /^ms-/
export function hyphenateStyleName(name: string): string {
  return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-')
}

// 字符串
export function createDangerousStringForStyles(styles) {
  let serialized = ''
  let delimiter = ''
  for (const styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue
    }
    const value = styles[styleName]
    if (value != null && typeof value !== 'boolean' && value !== '') {
      const isCustomProperty = styleName.indexOf('--') === 0
      if (isCustomProperty) {
        serialized += delimiter + styleName + ': ' + ('' + value).trim()
      } else {
        if (typeof value === 'number' && value !== 0 && !isUnitlessNumber(styleName)) {
          serialized += delimiter + hyphenateStyleName(styleName) + ': ' + value + 'px'
        } else {
          serialized += delimiter + hyphenateStyleName(styleName) + ': ' + ('' + value).trim()
        }
      }
      delimiter = '; '
    }
  }
  return serialized || null
}

// 单位
const unitlessNumbers = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity', // SVG-related properties
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'MozAnimationIterationCount', // Known Prefixed Properties
  'MozBoxFlex', // TODO: Remove these since they shouldn't be used in modern code
  'MozBoxFlexGroup',
  'MozLineClamp',
  'msAnimationIterationCount',
  'msFlex',
  'msZoom',
  'msFlexGrow',
  'msFlexNegative',
  'msFlexOrder',
  'msFlexPositive',
  'msFlexShrink',
  'msGridColumn',
  'msGridColumnSpan',
  'msGridRow',
  'msGridRowSpan',
  'WebkitAnimationIterationCount',
  'WebkitBoxFlex',
  'WebKitBoxFlexGroup',
  'WebkitBoxOrdinalGroup',
  'WebkitColumnCount',
  'WebkitColumns',
  'WebkitFlex',
  'WebkitFlexGrow',
  'WebkitFlexPositive',
  'WebkitFlexShrink',
  'WebkitLineClamp'
])
export function isUnitlessNumber(name: string): boolean {
  return unitlessNumbers.has(name)
}

export const getStyle = (styles) => {
  for (const styleName in styles) {
    const hyphenatedStyleName = hyphenateStyleName(styleName)
    const value = styles[styleName]
    if (typeof value === 'number' && value !== 0 && !isUnitlessNumber(styleName)) {
      styles[hyphenatedStyleName] = addUnit(value)
    } else {
      styles[hyphenatedStyleName] = ('' + value).trim()
    }
  }

  let styles_string = createDangerousStringForStyles(styles)
  return styles_string
}
