<template>
  <div class="home">
    <transition name="fade">
      <template v-if="homeInfo.showHeadDesc">
        <RuleBtn />
        <backTop />
        <!-- <img class="footer" src="`${ossUrl}/footer.png`" alt="" /> -->
      </template>
    </transition>

    <div class="main-wrap">
      <TabsMain />
      <div v-if="homeInfo.showComponent">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" />
        </router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="Home">
import injectTool from "@publicComponents/injectTool";
import { useTimer } from "@hooks/useTimer";

import isDataRouter from "../tools/isDataRouter";
import h5SourceBp from "../tools/h5SourceBp";
import isDataBp from "../tools/isDataBp";

const {
  TOOL_TEXT,
  TOOL_BPFunc,
  TOOL_httpClient,
  TOOL_loading,
  TOOL_countryCode,
} = injectTool();
const { startTimer } = useTimer();

const homeInfo = reactive({
  showHeadDesc: false, // 是否显示头部描述
  showComponent: false, // 是否显示组件
});

onMounted(() => {
  // 延迟加载主体内容，优先让头图加载
  startTimer(() => {
    homeInfo.showComponent = true;
  }, 300);
  // 延迟加载规则按钮等，优先让主体内容加载
  startTimer(() => {
    homeInfo.showHeadDesc = true;
  }, 1500);

  h5SourceBp();
  isDataBp();
  isDataRouter();
});
</script>

<style lang="scss" scoped>
.home {
  width: 7.5rem;
  padding-top: 13.34rem;
  min-height: 100vh;
  overflow: hidden;
  position: relative;

  .footer {
    width: 7.5rem;
    height: 3.39rem;

    position: absolute;
    bottom: -0.01rem;
  }

  .main-wrap {
    width: 7.5rem;
    margin: 0 auto;
    margin-top: -2.6rem;

    position: relative;
    z-index: 1;
  }

  .head-icon {
    width: 1.45792rem;
    height: 1.3608rem;

    position: absolute;
    top: 4.05rem;
    left: 0.11rem;

    .head-text-wrap {
      width: 1.296rem;
      height: 0.4rem;

      position: absolute;
      bottom: 0.04rem;
      left: 50%;
      transform: translateX(-50%);

      span {
        color: #fff7f0;

        text-align: center;
        font-family: Arial;
        font-size: 0.2rem;
        font-style: normal;
        font-weight: 400;
        line-height: 0.2rem;
        /* 100% */
      }
    }
  }
}
</style>
