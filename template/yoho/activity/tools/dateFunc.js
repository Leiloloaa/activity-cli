import dayjs from 'dayjs'

export const dateToTextFunc = (date, TOOL_countryCode) => {
  return dayjs(date).format(TOOL_countryCode == 'EG' ? 'DD/MM' : 'MM/DD') // 中东反向
}

export const getDateList = (date) => {
  let start = dayjs(date.start)
  let end = dayjs(date.end)

  let list: string[] = []
  for (let maxdays = 0, cur = start; maxdays < 365; maxdays++) {
    let curFormat = cur.format('YYYYMMDD')
    let endFormat = end.format('YYYYMMDD')
    list.push(curFormat)
    if (curFormat == endFormat) break
    cur = cur.add(1, 'day')
  }
  return list
}

export const getdayInRange = (dateList, day = dayjs()) => {
  let today = dayjs(day)
  let firstDay = dayjs(dateList[0])
  let lastDay = dayjs(dateList[dateList?.length - 1])
  let res = today.isBefore(firstDay) ? firstDay : today.isAfter(lastDay) ? lastDay : today // 未开始-日期返回第一天，已结束-日期返回最后一天
  return res.format('YYYYMMDD')
}

// 根据index滚动
export const scrollBasic = (
  scrollRef, // 滚动Ref
  listItemRef, // 列表项Ref
  direction = 'y', // 滚动方向
  list = [], // 列表
  targetItemIndex = 0 // 目标索引
) => {
  if (!scrollRef || !listItemRef) {
    console.log('scrollBasic参数不正确', { scrollRef, listItemRef, direction, targetItemIndex })
    return {}
  }

  const scrollRefRect = scrollRef?.getBoundingClientRect()
  const scrollCenter = {
    x: scrollRefRect.left + scrollRefRect.width / 2,
    y: scrollRefRect.top + scrollRefRect.height / 2
  }
  const scrollCenterUsual = direction?.includes('x') ? scrollCenter.x : scrollCenter.y

  const targetRef = listItemRef?.[targetItemIndex]
  const targetRect = targetRef?.getBoundingClientRect()

  const itemHalf = {
    x: targetRect?.width / 2,
    y: targetRect?.height / 2
  }
  const itemHalfUsual = direction?.includes('x') ? itemHalf.x : itemHalf.y

  const itemCenter = {
    x: targetRect?.left + targetRect?.width / 2,
    y: targetRect?.top + targetRect?.height / 2
  }
  const itemCenterUsual = direction?.includes('x') ? itemCenter.x : itemCenter.y

  let space = itemCenterUsual - scrollCenterUsual

  // 获取body style direction是否是rtl
  const bodyDir = document.body.style.direction
  const isRtl = bodyDir === 'rtl' ? true : false
  if (direction?.includes('half')) space = isRtl ? -itemHalfUsual : itemHalfUsual

  if (direction?.includes('x')) {
    scrollRef.scrollLeft += space
  } else if (direction?.includes('y')) {
    scrollRef.scrollTop += space
  } else {
    console.error('Invalid direction. Use "x" or "y".')
  }

  return { scrollRef, listItemRef, direction, targetItemIndex, space }
}

// 根据日期滚动
export const scrollFn = (
  scrollRef, // 滚动Ref
  listItemRef, // 列表项Ref
  direction = 'x', // 滚动方向
  list = [], // 列表
  indexOrDate = 1 // 选中索引或日期
) => {
  if (!scrollRef || !listItemRef || !list || !Array.isArray(list) || list.length == 0) {
    console.log('scrollFn参数不正确', { scrollRef, listItemRef, direction, list, indexOrDate })
    return {}
  }

  let scrollBasicObj = {}
  let realIndex = indexOrDate

  const regex = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/
  if (regex.test(String(indexOrDate)) && dayjs(String(indexOrDate), 'YYYYMMDD', true).isValid()) {
    let findIndex = list.findIndex((item) => item == indexOrDate)

    if (findIndex == -1) {
      console.log('日期不在列表中', { indexOrDate, list })
      return {}
    } else {
      realIndex = findIndex
    }
  }

  scrollBasicObj = scrollBasic(scrollRef, listItemRef, direction, list, realIndex)

  const firstRef = listItemRef?.[0]
  const firstRect = firstRef.getBoundingClientRect()
  const itemSize = direction === 'y' ? firstRect.height : firstRect.width

  return { ...scrollBasicObj, list, indexOrDate, itemSize }
}
