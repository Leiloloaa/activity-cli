// 将常用的组件注册为全局组件（异步加载）
import { defineAsyncComponent } from "vue";

// === 异步组件配置
const asyncComponents = {
  // Basic 基础组件
  Rep: () => import("./Basic/Rep.vue"),
  Dialog: () => import("./Basic/Dialog.vue"),
  Space: () => import("./Basic/Space.vue"),
  Honor: () => import("./Basic/Honor.vue"),
  Outline: () => import("./Basic/Outline.vue"),
  NoticeBar: () => import("./Basic/NoticeBar.vue"),
  FixedTop: () => import("./Basic/FixedTop.vue"),

  // 通用组件
  Head: () => import("./Head.vue"),
  Soon: () => import("./Soon.vue"),
  Timer: () => import("./Timer.vue"),
  RuleBtn: () => import("./RuleBtn.vue"),
  RankFrame: () => import("./RankFrame.vue"),
  TabsMain: () => import("./TabsMain.vue"),

  // GiftReward 组件
  GRSwiper: () => import("./GiftReward/GRSwiper.vue"),
  GRPreview: () => import("./GiftReward/GRPreview.vue"),
};

export default (Vue: any) => {
  // 注册异步组件
  for (const [name, loader] of Object.entries(asyncComponents)) {
    Vue.component(name, defineAsyncComponent(loader));
  }
};
