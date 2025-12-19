// 全局检测锁（防止重复检测）
let detectionPromise = null
const CACHE_KEY = 'webp_support_v3'

// 日志工具
const log = (message, data = null) => {
  // const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  // console.log(`[WebP检测 ${timestamp}] ${message}`, data || '')
}

// 检查缓存
const checkCache = () => {
  const forceCheck = window.location.search.includes('forceWebpCheck=true')
  if (forceCheck) {
    // log('强制检测模式，跳过缓存')
    return null
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached !== null) {
      const result = cached === 'true'
      // log('从缓存读取结果', { result })
      return result
    }
  } catch (e) {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached !== null) {
        const result = cached === 'true'
        // log('从 sessionStorage 读取结果', { result })
        return result
      }
    } catch (e2) {
      // 忽略错误
    }
  }

  return null
}

// Canvas 检测方法（同步）
const detectByCanvas = () => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const dataURL = canvas.toDataURL('image/webp')
    const isWebP = dataURL.indexOf('data:image/webp') === 0
    // log('Canvas 检测结果', { isWebP })
    return isWebP
  } catch (e) {
    // log('Canvas 检测失败', { error: e.message })
    return false
  }
}

// Image 检测方法（异步）
const detectByImage = () => {
  return new Promise((resolve) => {
    const testImage = new Image()
    let imageChecked = false
    let timeoutId = null

    const checkComplete = (supported, reason) => {
      if (imageChecked) return
      imageChecked = true
      if (timeoutId) clearTimeout(timeoutId)
      // log('Image 检测完成', { supported, reason })
      resolve(supported)
    }

    testImage.onload = () => checkComplete(true, 'onload')
    testImage.onerror = () => checkComplete(false, 'onerror')

    timeoutId = setTimeout(() => {
      // log('Image 检测超时')
      checkComplete(false, 'timeout')
    }, 3000)

    testImage.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA=='
  })
}

// 缓存结果
const cacheResult = (supported) => {
  try {
    localStorage.setItem(CACHE_KEY, supported.toString())
  } catch (e) {
    try {
      sessionStorage.setItem(CACHE_KEY, supported.toString())
    } catch (e2) {
      // 忽略错误
    }
  }
}

// 主检测函数
export const checkWebPSupport = async () => {
  // console.log('='.repeat(60))
  // console.log('[WebP检测] 开始检测')
  // console.log('='.repeat(60))

  // 输出浏览器信息
  const ua = navigator.userAgent
  // log('浏览器信息', {
  //   userAgent: ua,
  //   platform: navigator.platform,
  //   isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
  //   isChrome: /Chrome/.test(ua) && !/Edg/.test(ua),
  //   isEdge: /Edg/.test(ua),
  //   isFirefox: /Firefox/.test(ua)
  // })

  // 检查缓存
  const cachedResult = checkCache()
  if (cachedResult !== null) {
    detectionPromise = Promise.resolve(cachedResult)
    // console.log('='.repeat(60))
    // console.log(`[WebP检测] 检测完成（使用缓存）: ${cachedResult ? '支持' : '不支持'}`)
    // console.log('='.repeat(60))
    return cachedResult
  }

  // 执行实际检测
  if (!detectionPromise) {
    detectionPromise = new Promise(async (resolve) => {
      // 方法1: Canvas 检测（同步，更可靠）
      const canvasResult = detectByCanvas()

      if (canvasResult) {
        cacheResult(true)
        // console.log('='.repeat(60))
        // console.log('[WebP检测] 检测完成: 支持 WebP (Canvas检测)')
        // console.log('='.repeat(60))
        resolve(true)
        return
      }

      // 方法2: Image 检测（异步，备用）
      // log('Canvas 检测未通过，使用 Image 检测作为备用')
      const imageResult = await detectByImage()

      const finalResult = canvasResult || imageResult
      cacheResult(finalResult)

      // console.log('='.repeat(60))
      // console.log(
      //   `[WebP检测] 检测完成: ${finalResult ? '支持' : '不支持'} WebP (${
      //     imageResult ? 'Image' : 'Canvas'
      //   }检测)`
      // )
      // console.log('='.repeat(60))
      resolve(finalResult)
    })
  }

  const result = await detectionPromise
  return result
}
