import { createApp } from "vue";
import App from "./App.vue";
import developTool from "@publicComponents/developTool_TS/index";
import { Pretreatment } from "@publicJS/activity_pretreatment/index";
import animate from "@publicComponents/Vue3-Animate/index";
import { iosAddViewportFit } from "@publicComponents/shared";
import { List, Sticky, BackTop, Image as VanImage, Lazyload } from "vant";
import "vant/lib/index.css";
import OssImg from "./components/OssImg.vue";
import { vMarquee } from './directive/vMarquee'
import RankFrame from './common/RankFrame.vue';

import "@publicComponents/index.scss"; // 全局静态样式
import "./scss/index.scss";

import components from "./common/all.components";
import router from "./router/index";
// import { createPinia } from 'pinia' // 使用 provide 和 inject 解决祖孙数据传递
import { config } from "./config";

// ios终端 添加 viewport-fit
iosAddViewportFit();


// createApp
const app = createApp(App);
app.config.globalProperties.ENV = ENV;
const rootDom = document.createElement("div");
document.body.appendChild(rootDom);
const pretreatment = new Pretreatment(app, config.countryList.split(","));
pretreatment.init().then(({ LANG }) => {
  app
    .use(animate)
    .use(router)
    .use(List)
    .use(Sticky)
    .use(BackTop)
    .use(VanImage)
    .use(Lazyload)
    .use(components) // 固定组件与常用组件
    // .use(createPinia())
    .use(developTool, { activityId: config.activityId, countryCode: LANG })
    .component("OssImg", OssImg)
    .directive("marquee", vMarquee)
    .component("RankFrame", RankFrame)
    .mount(rootDom);
});
