import { createApp } from 'vue'
import App from './App.vue'
import developTool from '@publicComponents/developTool_TS/index'
import { Pretreatment } from '@publicJS/activity_pretreatment/index'
import animate from '@publicComponents/Vue3-Animate/index'
import { iosAddViewportFit } from '@publicComponents/shared'
import router from './router/index'
import { List, Sticky, BackTop, CountDown, Lazyload, Toast, NoticeBar } from 'vant'
import 'vant/lib/index.css'
import '@publicComponents/index.scss' // 全局静态样式
import './scss/index.scss'
import { config } from './config'

import pluginToWebp from 'plugin-to-webp'
import components from './common/all.components'

// ios终端 添加 viewport-fit
iosAddViewportFit()

// createApp
const app = createApp(App)
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
pretreatment.init(false, router).then(({ LANG }) => {
  app
    .use(animate)
    .use(router)
    .use(Toast)
    .use(List)
    .use(Sticky)
    .use(BackTop)
    .use(CountDown)
    .use(NoticeBar)
    .use(Lazyload, {
      lazyComponent: true
    })
    .use(components) // 固定组件与常用组件
    .use(pluginToWebp, {
      quality: 80, // 压缩质量
      excludesName: ['live'] // 不转换的图片名称
    })
    .use(developTool, { activityId: config.activityId, countryCode: LANG })
    .mount(rootDom)
})
