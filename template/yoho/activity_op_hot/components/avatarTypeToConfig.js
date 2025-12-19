/**
 * 根据type生成avatarOpt
 * 支持格式：
 * 1. aXXX - 正方形头像框，默认比例70% (XXX为宽度)
 * 2. aXXXpZZZ - 正方形头像框 (XXX为宽度，ZZZ为比例)
 * 3. aXXX_YYY - 矩形头像框，默认比例70% (XXX为宽度，YYY为高度)
 * 4. aXXX_YYYpZZZ - 矩形头像框 (XXX为宽度，YYY为高度，ZZZ为比例)
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

  console.log('🎯 avatarTypeToConfig 输入:', type)

  let config

  // 默认配置 (ap132p66)
  const defaultConfig = {
    frame: { width: '1.320rem', height: '1.320rem' },
    avatar: { width: '0.871rem', height: '0.871rem' },
    live: { width: '0.41rem', height: '0.24rem', bottom: '0rem' },
    liveIcon: { width: '96%', height: '93%' }
  }

  // 如果没有type或为空，返回默认配置
  if (!type || type === '') {
    console.log('📦 使用默认配置 (空值)')
    config = defaultConfig
  }
  // 解析格式：aXXX、aXXXpZZZ、aXXX_YYY、aXXX_YYYpZZZ
  else {
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
        console.warn(`❌ 未识别的头像类型格式: ${type}`)
        console.log('📦 使用默认配置 (格式错误)')
        config = defaultConfig
      }
    }

    if (match) {
      console.log('🔍 解析参数:', {
        原始type: type,
        宽度: width,
        高度: height,
        比例: percentage,
        是否为正方形: !type.includes('_'),
        是否使用默认比例: !type.includes('p')
      })

      // 生成配置
      config = {
        frame: {
          width: `${(width * 0.01).toFixed(3)}rem`,
          height: `${(height * 0.01).toFixed(3)}rem`
        },
        avatar: {
          width: `${(width * percentage * 0.01).toFixed(3)}rem`,
          height: `${(height * percentage * 0.01).toFixed(3)}rem`
        },
        live: {
          width: '0.41rem',
          height: '0.24rem',
          bottom: '0rem'
        },
        liveIcon: {
          width: '96%',
          height: '93%'
        }
      }

      console.log('✅ 生成配置成功:', config)
    }
  }

  // 缓存结果
  configCache.set(type, config)
  return config
}
