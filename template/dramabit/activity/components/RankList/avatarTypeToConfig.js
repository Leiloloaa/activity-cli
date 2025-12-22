/**
 * 根据type生成avatarOpt
 * 支持格式：
 * 1. aXXX - 正方形头像框，默认比例70% (XXX为宽度)
 * 2. aXXXpZZZ - 正方形头像框 (XXX为宽度，ZZZ为比例)
 * 3. aXXX_YYY - 矩形头像框，默认比例70% (XXX为宽度，YYY为高度)
 * 4. aXXX_YYYpZZZ - 矩形头像框 (XXX为宽度，YYY为高度，ZZZ为比例)
 * 5. 可选：lNN - live.bottom 底部偏移，单位为 1rem=100px（例如 l24 => 0.24rem）
 * 6. 可选：mtNN - 头像margin-top偏移，单位为 1rem=100px（例如 mt20 => 0.2rem）
 * 7. 可选：mbNN - 头像margin-bottom偏移，单位为 1rem=100px（例如 mb20 => 0.2rem）
 * 8. 可选：mlNN - 头像margin-left偏移，单位为 1rem=100px（例如 ml20 => 0.2rem）
 * 9. 可选：mrNN - 头像margin-right偏移，单位为 1rem=100px（例如 mr20 => 0.2rem）
 *
 * @param {string} type - 头像类型字符串
 * @returns {Object} 头像配置对象
 */
// 缓存已计算过的配置，避免重复计算和打印
const configCache = new Map()

export const avatarTypeToConfig = (type) => {
  // 检查缓存
  if (configCache.has(type)) {
    return configCache.get(type)
  }

  // console.log('🎯 avatarTypeToConfig 输入:', type)

  let config

  // 默认配置 (ap132p66)
  const defaultConfig = {
    frame: { width: '1.320rem', height: '1.320rem' },
    avatar: {
      width: '0.871rem',
      height: '0.871rem',
      marginTop: '0rem',
      marginBottom: '0rem',
      marginLeft: '0rem',
      marginRight: '0rem'
    },
    live: { width: '0.41rem', height: '0.24rem', bottom: '0rem' },
    liveIcon: { width: '96%', height: '93%' }
  }

  // 如果没有type或为空，返回默认配置
  if (!type || type === '') {
    // console.log('📦 使用默认配置 (空值)')
    config = defaultConfig
  }
  // 解析格式：aXXX、aXXXpZZZ、aXXX_YYY、aXXX_YYYpZZZ，并支持可选 lNN（live.bottom）和 mtNN/mbNN/mlNN/mrNN（avatar.margin）
  else {
    // 先解析可选的 live bottom: lNN（例如 l24 -> 0.24rem）
    let liveBottomRem = '0rem'
    const liveMatch = type.match(/l(\d+)/)
    if (liveMatch) {
      const liveNum = parseInt(liveMatch[1])
      if (!Number.isNaN(liveNum)) {
        liveBottomRem = `${(liveNum * 0.01).toFixed(2)}rem`
      }
      // 从类型字符串中移除 lNN，避免影响后续 aXXX... 的解析
      type = type.replace(/l\d+/, '')
    }

    // 解析可选的 avatar margin: mtNN/mbNN/mlNN/mrNN（例如 mt20 -> 0.2rem）
    let avatarMarginTopRem = '0rem'
    let avatarMarginBottomRem = '0rem'
    let avatarMarginLeftRem = '0rem'
    let avatarMarginRightRem = '0rem'

    // 解析 margin-top: mtNN
    const marginTopMatch = type.match(/mt(\d+)/)
    if (marginTopMatch) {
      const marginTopNum = parseInt(marginTopMatch[1])
      if (!Number.isNaN(marginTopNum)) {
        avatarMarginTopRem = `${(marginTopNum * 0.01).toFixed(2)}rem`
      }
      type = type.replace(/mt\d+/, '')
    }

    // 解析 margin-bottom: mbNN
    const marginBottomMatch = type.match(/mb(\d+)/)
    if (marginBottomMatch) {
      const marginBottomNum = parseInt(marginBottomMatch[1])
      if (!Number.isNaN(marginBottomNum)) {
        avatarMarginBottomRem = `${(marginBottomNum * 0.01).toFixed(2)}rem`
      }
      type = type.replace(/mb\d+/, '')
    }

    // 解析 margin-left: mlNN
    const marginLeftMatch = type.match(/ml(\d+)/)
    if (marginLeftMatch) {
      const marginLeftNum = parseInt(marginLeftMatch[1])
      if (!Number.isNaN(marginLeftNum)) {
        avatarMarginLeftRem = `${(marginLeftNum * 0.01).toFixed(2)}rem`
      }
      type = type.replace(/ml\d+/, '')
    }

    // 解析 margin-right: mrNN
    const marginRightMatch = type.match(/mr(\d+)/)
    if (marginRightMatch) {
      const marginRightNum = parseInt(marginRightMatch[1])
      if (!Number.isNaN(marginRightNum)) {
        avatarMarginRightRem = `${(marginRightNum * 0.01).toFixed(2)}rem`
      }
      type = type.replace(/mr\d+/, '')
    }

    // 匹配带比例的格式：aXXXpZZZ 或 aXXX_YYYpZZZ
    let match = type.match(/^a(\d+)(?:_(\d+))?p(\d+)$/)
    let width, height, percentage

    if (match) {
      // 有明确比例的格式
      const [, widthStr, heightStr, percentageStr] = match
      width = parseInt(widthStr)
      height = heightStr ? parseInt(heightStr) : width
      percentage = parseInt(percentageStr) / 100
    } else {
      // 匹配不带比例的格式：aXXX 或 aXXX_YYY
      match = type.match(/^a(\d+)(?:_(\d+))?$/)

      if (match) {
        // 没有比例，使用默认70%
        const [, widthStr, heightStr] = match
        width = parseInt(widthStr)
        height = heightStr ? parseInt(heightStr) : width
        percentage = 0.7 // 默认70%
      } else {
        // console.warn(`❌ 未识别的头像类型格式: ${type}`)
        // console.log('📦 使用默认配置 (格式错误)')
        config = defaultConfig
      }
    }

    if (match) {
      // console.log('🔍 解析参数:', {
      //   原始type: type,
      //   宽度: width,
      //   高度: height,
      //   比例: percentage,
      //   是否为正方形: !type.includes('_'),
      //   是否使用默认比例: !type.includes('p')
      // })

      // 生成配置
      config = {
        frame: {
          width: `${(width * 0.01).toFixed(3)}rem`,
          height: `${(height * 0.01).toFixed(3)}rem`
        },
        avatar: {
          width: `${(width * percentage * 0.01).toFixed(3)}rem`,
          height: `${(height * percentage * 0.01).toFixed(3)}rem`,
          marginTop: avatarMarginTopRem,
          marginBottom: avatarMarginBottomRem,
          marginLeft: avatarMarginLeftRem,
          marginRight: avatarMarginRightRem
        },
        live: {
          width: '0.41rem',
          height: '0.24rem',
          bottom: liveBottomRem
        },
        liveIcon: {
          width: '96%',
          height: '93%'
        }
      }

      // console.log('✅ 生成配置成功:', config)
    }
  }

  // 缓存结果
  configCache.set(type, config)
  return config
}
