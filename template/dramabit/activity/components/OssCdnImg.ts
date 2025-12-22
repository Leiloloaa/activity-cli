import { isSupportWebp, isEmptyObject } from '@publicComponents/shared'

export default {
  name: 'oss-cdn-img',
  props: {
    src: {
      default: ''
    }
  },
  setup(props) {
    const ossUrl = inject('ossUrl')
    // props 参数
    const { src } = toRefs(props)
    // 创建 VNode 属性
    const VNodeProps = reactive({
      src: '',
      onError: async () => {
        VNodeProps.src = VNodeProps.src.replace(/(\.png).*$/, '$1')
      }
    })
    watchEffect(() => {
      if (ossUrl) {
        VNodeProps.src = `${ossUrl.endsWith('/') ? ossUrl : ossUrl + '/'}${
          src.value
        }`
        return
      }
    })
    return () => h('img', VNodeProps)
  }
}
