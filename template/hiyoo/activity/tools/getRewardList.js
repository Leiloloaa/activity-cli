// 奖励列表
export const getRewardList = (listConfig) => {
  let res = []

  for (let i = 0; i < listConfig?.length; i++) {
    const item = listConfig[i]

    const {
      prefix = 'reward-img', // 奖励图片自定义命名前缀
      playIcon = false, // 点击放大查看播放同名视频/图片
      goodsType = 'kAvatar', // 展示奖励name时，可使用goodsType判断
      range = [] // 根据产品实际提供的资源,配置展示的列表
    } = item

    // 后缀数组
    const suffixArray = ['webp', 'png', 'jpg', 'jpeg', 'gif']

    // 确定后缀
    let suffix = '.webp' // 默认后缀
    for (const key of suffixArray) {
      if (item?.suffix?.includes(key)) {
        suffix = `.${key}` // 根据后缀生成文件扩展名
        break
      } else {
        console.log('请检查是否参数是否应该使用 listValue')
      }
    }

    for (let k = 0; k < range.length; k++) {
      const rangeItem = range[k]

      if (String(rangeItem).includes('-')) {
        const [start, end] = rangeItem.split('-').map(Number)
        for (let j = start; j <= end; j++) {
          res.push({ goodsType, src: `${prefix}${j}${suffix}`, playIcon })
        }
      } else {
        res.push({ goodsType, src: `${prefix}${rangeItem}${suffix}`, playIcon })
      }
    }
  }

  console.log('奖励轮播配置listValue-生成的奖励列表:', res)
  return res
}
