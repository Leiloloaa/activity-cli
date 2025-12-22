const getKeyword = (hostName = window.location.hostname, defaultHost = 'hoko') => {
  const match = hostName.match(/\b(\w+)\b\.(?:media|com)/)
  return match ? match[1] : defaultHost
}

export const getImgType = (ossUrl, src) => {
  const addTest = ENV == 'build' ? '' : '-test'

  const keyword = getKeyword()
  const address = `//static.dramabite.media/activity-image/202511_annualGala` // 🔥域名

  const apiImg = src?.includes('http') ? src : address + '/' + src || '接口图片未返回' // 接口图片
  const ossImg = `${ossUrl}/${src}${String(src).includes('.') ? '' : '.png'}` // 阿里云图片

  return {
    apiImg,
    ossImg
  }
}

export const judgeImgSrc = (ossUrl, src) => {
  const apiImg = getImgType(ossUrl, src).apiImg
  const ossImg = getImgType(ossUrl, src).ossImg
  return src?.length > 30 && !ossUrl?.includes('wakam') ? apiImg : ossImg
}
