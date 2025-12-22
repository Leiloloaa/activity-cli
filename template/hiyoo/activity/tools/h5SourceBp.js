import { getQueryString } from '@libraryParams/params'
import injectTool from '@publicComponents/injectTool'

export default () => {
  const route = useRoute()
  const router = useRouter()
  const routes = router.getRoutes()

  const isData = getQueryString('isData') || getQueryString('isdata') || 0
  const h5_source = Number(getQueryString('h5_source')) || 0
  const room = Number(getQueryString('room')) || 0

  const { TOOL_TEXT, TOOL_BPFunc, TOOL_countryCode } = injectTool()

  // 根据 h5_source 区分埋点
  const h5SourceMap = {
    1: 'banner', // h5_source 为 1 时，对应的 desc 为 'banner'
    4: 'splash', // h5_source 为 4 时，对应的 desc 为 'splash'
    5: 'live banner', // h5_source 为 5 时，对应的 desc 为 'live banner'
    6: 'private message', // h5_source 为 6 时，对应的 desc 为 'private message'
    7: 'boot', // h5_source 为 7 时，对应的 desc 为 'boot'
    30: 'room_popup_click' // h5_source 为 30 时，对应的 desc 为 'room_popup_click'
  }
  // hot banner

  TOOL_BPFunc({ desc: `h5_source${h5_source}`, action: 'click' })

  if (h5SourceMap[h5_source]) {
    TOOL_BPFunc({ desc: h5SourceMap[h5_source], action: 'click' })
  }

  if (room) {
    TOOL_BPFunc({ desc: `room_popup_click${room}`, action: 'click' })
  }
}
