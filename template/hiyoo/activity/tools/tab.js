const getTabList = (text) => {
  if (!Array.isArray(text) || text.length === 0) return []
  return text.map((item): { text: string } => ({
    text: typeof item === 'number' ? TOOL_TEXT[item] : String(item) // 确保返回值为字符串
  }))
}

const hideTab = (hideTabIndex) => {
  if (hideTabIndex.length > 0 && hideTabIndex?.includes(0)) {
    let index = 0
    hideTabIndex.forEach((item) => {
      if (item == index + 1) {
        index += 1
      }
    })
    if (index <= -1) {
    } else if (index > -1 && index <= hideTabIndex.length - 1) {
      actTab.value = index + 1
    } else if (index > hideTabIndex.length - 1) {
    }
  }
}

const getChildren = (father, text, TOOL_TEXT) => {
  const router = useRouter()
  const list = router.getRoutes()

  if (!Array.isArray(text)) {
    console.log('【TAB】text不是数组')
    return
  }

  if (text?.length == 0) {
    console.log('【TAB】text为空')
    return
  }

  let children: any = []
  let foundTimes = 0

  list.forEach((fatherItem) => {
    if (fatherItem?.name == father) {
      foundTimes++

      if (fatherItem?.children?.length <= 0) {
        console.log(`【TAB】父路由[${father}]子路由为空`)
      } else {
        console.log(`【TAB】父路由[${father}]子路由为`, fatherItem.children)

        fatherItem.children.forEach((childrenItem, childrenIndex) => {
          let childrenText = text?.[childrenIndex]

          let text
          if (typeof childrenText === 'number') {
            text = TOOL_TEXT[childrenText]
          } else {
            text = childrenText
          }

          children.push({ name: childrenItem?.name, text })
        })
      }
    }
  })
  if (foundTimes <= 0) {
    console.log(`【TAB】未找到父路由[${father}]`)
  }
  return children
}

// import { getTabList, hideTab, getChildren } from '../../tools/tab.js'

export { getTabList, hideTab, getChildren }
