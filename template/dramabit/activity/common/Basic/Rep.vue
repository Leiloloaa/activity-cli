<!-- 自定义代码块 -->
<!-- {
  "rep": {
    "prefix": "rep",
    "body": [
      "  <Rep",
      "    :content=\"TOOL_TEXT[14]\"",
      "    :rule=\"[",
      "      {",
      "        reg: '%d',",
      "        eg: 'false',",
      "        val: 'sofa',",
      "        type: 'img',",
      "        styles: { width: 0.38, transform: 'translate(0,-0.02rem)', margin: '0 0.02' }",
      "      },",
      "      {",
      "        reg: '%s',",
      "        eg: 'false',",
      "        val: info?.count,",
      "        type: 'text',",
      "        styles: { color: '#fff', fontSize: 0.26, margin: '0 0.02' }",
      "      }",
      "    ]\"",
      "  />",
    ],
    "description": "Vue Component with Rep"
  }
} -->

<template>
  <span v-html="resText"></span>
</template>

<script lang="ts" setup name="rep">
import {
  IRule,
  Numeric,
  addUnit,
  hyphenateStyleName,
  isUnitlessNumber,
  createDangerousStringForStyles
} from './repType'
import { judgeImgSrc } from './judgeImgSrc'

type IRepComp = { content: Numeric; rule: IRule[] }

const props = withDefaults(defineProps<IRepComp>(), {
  content: '',
  rule: () => []
})

const ossUrl = inject('ossUrl')

const resText = computed(() => {
  const { content, rule } = props // 解析content、rule

  if (rule?.length < 1) return content
  let res: Numeric = content || '' // 处理结果: styles字符串
  rule.forEach((item) => {
    let {
      reg = '',
      eg = false,
      val = '',
      type = 'text',
      className = '',
      styles = {},
      options = {}
    } = item

    if (reg != '') {
      let flag = ''

      if (type == 'img') {
        //图片默认添加
        styles['vertical-align'] = 'middle'
        styles['object-fit'] = 'contain'
      }

      if (Object.keys(options)?.length > 0) {
        if (options?.gap) styles['margin'] = `0 ${addUnit(options?.gap)}`
        if (options?.translateY) styles['transform'] = `translateY(${addUnit(options?.translateY)})`
        if (options?.y) styles['transform'] = `translateY(${addUnit(options?.y)})`

        if (options?.width) styles['width'] = `${addUnit(options?.width)}`
        if (options?.['max-width']) styles['max-width'] = `${addUnit(options?.['max-width'])}`
        if (options?.fontSize) styles['font-size'] = `${addUnit(options?.fontSize)}`
        if (options?.color) styles['color'] = `${options?.color}`
        if (options?.fontWeight) styles['fontWeight'] = `${options?.fontWeight}`
      }

      for (const styleName in styles) {
        const hyphenatedStyleName = hyphenateStyleName(styleName)
        const value = styles[styleName]

        if (typeof value === 'number' && value !== 0 && !isUnitlessNumber(styleName)) {
          styles[hyphenatedStyleName] = addUnit(value)
        } else {
          styles[hyphenatedStyleName] = ('' + value).trim()
        }
      }

      // console.log('styles', styles)
      let styles_string = createDangerousStringForStyles(styles)
      // console.log('styles_string', styles_string)

      if (type == 'img') {
        let src = judgeImgSrc(ossUrl, val)
        flag = `<img style='${styles_string}' class='${className}' src='${src}' />`
      } else if (type == 'spanimg') {
        let src = judgeImgSrc(ossUrl, val)
        flag = `<span class='${className}'><img style='${styles_string}' src='${src}' /></span>`
      } else if (type == 'text') {
        flag = `<span style='${styles_string}' class='${className}'>${val}</span>`
      } else if (type == 'name') {
        styles_string = 'display:inline-block; width:1rem; ' + styles_string
        className = 'ow' + className
        flag = `<span style='${styles_string}' class='${className}'>${val}</span>`
      } else if (type == 'br') {
        flag = `${val}<br/>`
      }

      if (reg == 'before' || reg == 'after') {
        switch (reg) {
          case 'before': // 前增加
            res = String(flag) + String(res)
            break
          case 'after': // 后增加
            res = String(res) + String(flag)
            // console.log('after res', res)
            break
          default:
            break
        }
      } else {
        if (eg) {
          if (reg instanceof RegExp) {
            console.log('reg为正则时,EG反向替换不支持!')
          } else {
            const hasReg = String(res).includes(reg)
            const hasBrackets = /^\[.*?\]$/.test(reg)
            // console.log('hasReg', res, reg, hasReg)
            if (hasBrackets) {
              if (!hasReg) {
                reg = [...reg].reverse().join('')
                reg = reg[reg.length - 1] + reg.slice(1, -1) + reg[0]
                console.log(`EG反向替换,[]特殊处理: 将替换${reg}`)
              }
              reg = reg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

              const regex = new RegExp(reg)
              res = String(res)?.replace(regex, flag)
            } else {
              if (hasReg) {
                const regex = new RegExp(reg)
                res = String(res)?.replace(regex, flag)
              } else {
                reg = [...reg].reverse().join('')
                if (String(res).includes(reg)) {
                  const regex = new RegExp(reg)
                  res = String(res)?.replace(regex, flag)
                }
              }
            }
          }
        } else {
          const regex = new RegExp(reg)
          res = String(res)?.replace(regex, flag)
        }
      }
    }
  })

  return res
})
</script>
