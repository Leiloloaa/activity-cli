import { defineStore } from "pinia";
import { config } from "../config";

// import { useAppStore } from "../store";
// const appStore = useAppStore();

// // 访问状态
// appStore.cdn
// appStore.historyBack
// appStore.routerHistory

// // 调用方法
// appStore.showReward(item)

// 获取项目类型
const projectType = (window as any).PROJECT;
const ENV = (window as any).ENV;

export const useAppStore = defineStore("app", {
  state: () => ({
    activityDownStatus: 1 as number, // 活动是否下线 1 未下线 0 下线
    routerHistory: [] as string[], // 页面路由历史
    loadMp4list: [] as string[], // 页面加载的 mp4 列表
    loadMp4FirstKey: null as string | null, // 页面加载的 mp4 列表的第一个 key
    historyBack: "home" as string | null, // 历史返回
    // 奖励弹框相关
    isShowReward: false,
    rewardResource: {} as any,
  }),

  getters: {
    // 设置不同路由，不同背景颜色
    backgroundColor: () => config.backgroundColor,
    // 设置不同路由，不同沙发
    defaultSofa: () => (config as any).defaultSofa || "",
    // static 图地址
    yohoUi: () => (window as any).hostConfig.oss + "/activity/yoho-ui",
    // 二级域名 domain
    domain: () =>
      projectType == 2 ? "chatchill" : (window as any).hostConfig.domain,
    // oss 域名前缀
    oss: () => (window as any).hostConfig.oss,
    // cdn 域名前缀
    cdn: () =>
      ENV == "build"
        ? (window as any).hostConfig.cdn
        : (window as any).hostConfig.cdnTest,
  },

  actions: {
    showReward(item: any) {
      this.rewardResource = item;
      this.isShowReward = true;
    },
    hideReward() {
      this.isShowReward = false;
    },
    pushRouterHistory(path: string) {
      this.routerHistory.push(path);
    },
    clearMp4List() {
      this.loadMp4list = [];
      this.loadMp4FirstKey = null;
    },
    setActivityDownStatus(status: number) {
      this.activityDownStatus = status;
    },
  },
});
