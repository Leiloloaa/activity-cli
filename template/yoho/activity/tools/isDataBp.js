import { getQueryString } from '@libraryParams/params'
import injectTool from '@publicComponents/injectTool'

export default () => {
  const route = useRoute()
  const router = useRouter()
  const routes = router.getRoutes()

  const isData = getQueryString('isData') || getQueryString('isdata') || 0
  const h5_source = Number(getQueryString('h5_source'))
  const hot = Number(getQueryString('hot')) || 0
  const lb = Number(getQueryString('lb')) || 0

  const { TOOL_TEXT, TOOL_BPFunc, TOOL_countryCode } = injectTool()

  TOOL_BPFunc({ desc: `h5source${h5_source}_page${isData}`, action: 'click' })

  if (lb) {
    TOOL_BPFunc({ desc: `live_banner${lb}_click`, action: 'click' })
  }

  if (isData == 999) {
    TOOL_BPFunc({ desc: 'special hot banner', action: 'click' })
  }

  if (h5_source == 1 && (hot == 0 || !hot)) {
    TOOL_BPFunc({ desc: 'hot_banner_default', action: 'click' })
  }

  if (hot) {
    TOOL_BPFunc({ desc: 'hot_banner_avatar', action: 'click' })
  }
}
