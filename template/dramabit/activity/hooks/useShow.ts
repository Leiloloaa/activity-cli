// 用途：当页面滚动到一定位置才展示，例如 userInfo，传入控制显隐藏的 ref 变量
export default async function useShow(flag, height: number = 300) {
  onMounted(() => {
    ; (window as any).addEventListener('scroll', appScroll, false)
  })
  onUnmounted(() => {
    ; (window as any).addEventListener('scroll', appScroll, false)
  })

  function appScroll() {
    setTimeout(() => {
      // 触发加载更多
      let scrollTop =
        window.pageYOffset || document.documentElement?.scrollTop || document.body?.scrollTop
      if (scrollTop > height) {
        flag.value = true
      } else {
        flag.value = false
      }
    }, 100)
  }
}
