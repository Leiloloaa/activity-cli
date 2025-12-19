// 将常用的组件注册为全局组件（异步加载）
import { defineAsyncComponent } from 'vue'

// === 异步组件配置
const asyncComponents = {
  // Basic 基础组件
  Rep: () => import('./Basic/Rep.vue'),
  Dialog: () => import('./Basic/Dialog.vue'),
  Popup: () => import('./Basic/Popup.vue'),
  Space: () => import('./Basic/Space.vue'),
  Honor: () => import('./Basic/Honor.vue'),
  Outline: () => import('./Basic/Outline.vue'),
  NoticeBar: () => import('./Basic/NoticeBar.vue'),
  FixedTop: () => import('./Basic/FixedTop.vue'),

  // 通用组件
  Head: () => import('./Head.vue'),
  Soon: () => import('./Soon.vue'),
  Timer: () => import('./Timer.vue'),
  RuleBtn: () => import('./RuleBtn.vue'),
  RankFrame: () => import('./RankFrame.vue'),

  // Tabs 组件
  TabsMain: () => import('./Tabs/TabsMain.vue'),
  TabsRank: () => import('./Tabs/TabsRank.vue'),
  TabsRule: () => import('./Tabs/TabsRule.vue'),
  TabsReward: () => import('./Tabs/TabsReward.vue'),

  // GiftReward 组件
  GRSwiper: () => import('./GiftReward/GRSwiper.vue'),
  GRToast: () => import('./GiftReward/GRToast.vue'),

  // 榜单组件
  TabsDate: () => import('./Tabs/TabsDate.vue'),
  RankLoad: () => import('./Basic/RankLoad.vue')
}

export default (Vue: any) => {
  // 注册异步组件
  for (const [name, loader] of Object.entries(asyncComponents)) {
    Vue.component(name, defineAsyncComponent(loader))
  }
}
