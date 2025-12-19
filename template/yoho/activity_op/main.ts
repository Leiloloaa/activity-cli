import { createApp } from 'vue'
import App from './App.vue'

import developTool from '@publicComponents/developTool_TS/index'
import { Pretreatment } from '@publicJS/activity_pretreatment/index'
import './scss/public.scss'

import { Swipe, SwipeItem, CountDown } from 'vant'
import components from './components/all.components'
import pluginToWebp from 'plugin-to-webp'

//  配置文件
import { config } from './config'

const app = createApp(App)
app.config.globalProperties.PROJECT = PROJECT
const rootDom = document.createElement('div')
document.body.appendChild(rootDom)

const pretreatment = new Pretreatment(app, [
  'EG',
  'TR',
  'IN',
  'PK',
  'BD',
  'MY',
  'FR',
  'ID',
  'VN',
  'TW',
  'IT',
  'TH'
])

pretreatment.init(true).then(({ profile, LANG }) => {
  // 注意 timer 组件会使用到 day
  app
    .use(developTool, { activityId: config.activityId, countryCode: LANG })
    .use(Swipe)
    .use(SwipeItem)
    .use(CountDown)
    .use(components) // 固定组件与常用组件
    .use(pluginToWebp, {
      quality: 80, // 压缩质量，默认 80
      excludesName: ['live'] // 不转换的图片名称
      // useCDN: false, // 是否处理 cdn 图，默认 true
    })
    .mount(rootDom)
})
