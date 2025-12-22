import { getQueryString } from '@libraryParams/params'
import injectTool from '@publicComponents/injectTool'

function processRoutes(routes, parentOrder = '', isData = '') {
  const orderChars = '123456789abcdefghijklmnopqrstuvwxyz'
  routes.forEach((item, index) => {
    const curOrder = parentOrder + orderChars[index % orderChars.length]
    console.log(`${String().padEnd(curOrder.length, '>')}【&isData=${curOrder} = ${item.path}】`)
    const children = item.children ? processRoutes(item.children, curOrder, isData) : []
    item.order = curOrder
    item.children = children
  })
  return routes
}

export default () => {
  const route = useRoute()
  const router = useRouter()
  const routes = router.getRoutes()

  const isData = getQueryString('isData') // isData

  let filterRoutes = routes
    .filter((item) => {
      let arr = item.path?.split('/') || []
      if (arr.length == 3) {
        return true
      } else if (arr.length == 4 && arr[3]?.startsWith(':')) {
        return false
      } else {
        return false
      }
    })
    .map((item) => {
      return {
        path: item.path,
        name: item.name,
        children: item.children
      }
    })

  if (isData !== '' && routes.length > 0) {
    processRoutes(filterRoutes, '', isData)

    function findAndPushRoute(routes) {
      routes.forEach((item) => {
        if (isData == 999) {
          router.replace('/home/rank') // 如果是 999，跳转路由
        } else if (isData == item.order) {
          router.replace(item)
        }

        if (item.children && item.children.length > 0) {
          findAndPushRoute(item.children)
        }
      })
    }
    findAndPushRoute(filterRoutes)
  }
}
