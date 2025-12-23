<template>
  <div class="rule">
    <div class="rule-tabs">
      <div
        class="tabs-component"
        v-for="(item, index) in [602, 603]"
        :key="'tab' + item"
      >
        <div
          class="tab fc"
          :class="`${actTab == index ? 'act' : ''} tab${index}`"
          @click="switchTab(index)"
          v-bg="`actTab == index ? 'tab-act' : 'tab`"
        >
          <Outline :color="`0.05rem #77220B`" :text="TOOL_TEXT[item]" noColor />
        </div>
      </div>
    </div>

    <GRSwiper
      :type="ruleTab == 0 ? 'gift' : 'reward'"
      :listConfig="listConfig"
    />

    <div
      v-show="ruleTab == 1"
      class="reward-tabs scrollX"
      ref="rewardScrollRef"
    >
      <div class="reward-tabs-inner">
        <div
          class="reward-tabs-component"
          v-for="(item, index) in rewardTabList"
          :key="'reward-tab' + item"
          ref="rewardListItemRef"
        >
          <div
            class="tab fc"
            :class="`${rewardTab == index ? 'act' : ''} tab${index}`"
            @click="switchRewardTab(index)"
            v-bg="`${rewardTab == index ? 'reward-tab-act' : 'reward-tab'}`"
          >
            <Outline
              :color="`0.05rem #77220B`"
              :text="TOOL_TEXT[item]"
              noColor
            />
          </div>
        </div>
      </div>
    </div>

    <div class="rule-content">
      <img
        :key="`index_${ruleIndex}`"
        :src="`//${appInfo.cdn}/${TOOL_RULE()[`index_${ruleIndex}`]}`"
        :alt="'rule_' + ruleIndex"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="Rule">
import injectTool from "@publicComponents/injectTool";
import { scrollFn } from "../tools/tools.js";

const route = useRoute();
const router = useRouter();
const appInfo = inject("appInfo");
const { TOOL_BPFunc, TOOL_countryCode, TOOL_TEXT, TOOL_RULE } = injectTool();
TOOL_BPFunc({ desc: "rule_page", action: "show" }); //固定不变，勿删

const ruleTab = ref<number>(0);
const rewardTab = ref<number>(0);
const ruleIndex = computed(() => (ruleTab.value == 0 ? 1 : 2));

// reward tabs 滚动相关
const rewardTabList = [173, 174, 175];
const rewardScrollRef = ref(null);
const rewardListItemRef = ref(null);
const rewardScrollFnIndex = (index: number, type = "") => {
  scrollFn(
    rewardScrollRef.value,
    rewardListItemRef.value,
    `x${type}`,
    rewardTabList,
    index
  );
};

const switchTab = (index: number) => {
  ruleTab.value = index;
  TOOL_BPFunc({ desc: `rule_tab${index + 1}_click`, action: "click" });
};

const switchRewardTab = (index: number) => {
  rewardTab.value = index;
  TOOL_BPFunc({ desc: `reward_page_tab${index + 1}_click`, action: "click" });
  rewardScrollFnIndex(index);
};

const type = Number(route.params.type) || Number(route.query.type) || 0;
onMounted(() => {
  if (type > 1) {
    ruleTab.value = 1; // 跳转至奖励页
    rewardTab.value = type - 2; // 选中指定Tab
    nextTick(() => {
      const tabIndex = rewardTab.value;
      const tabListLength = rewardTabList.length;
      rewardScrollFnIndex(
        tabIndex,
        tabIndex == 0 || tabIndex == tabListLength - 1 ? "half" : "whole"
      );
    });
  }
});

const listConfig = computed(() => {
  if (TOOL_countryCode == "EG") {
    return [];
  } else {
    return [];
  }
});
</script>

<style lang="scss" scoped>
.rule {
  width: 100%;
  height: auto;

  position: relative;
  z-index: 1;

  .rule-tabs {
    margin-top: 0.06rem;

    position: relative;
    z-index: 1;

    .tabs-component {
      width: fit-content;
      margin: 0 auto;

      display: flex;
      position: relative;
      z-index: 1;
      gap: 0.15rem;

      .tab {
        width: 2.54rem;
        height: 1.24rem;
        flex-shrink: 0;
        // margin: 0 0.04rem;

        display: flex;
        justify-content: center;
        align-items: center;

        position: relative;
        z-index: 1;

        span {
          width: 2.3rem;

          color: #ff391f;
          text-align: center;
          font-family: "SF UI Text";
          font-size: 0.24rem;
          font-style: normal;
          font-weight: 600;
          line-height: 0.26rem; /* 108.333% */

          position: relative;
          z-index: 2;
        }

        &.act {
          span {
            color: #6e0000;
            text-align: center;
            font-family: "SF UI Text";
            font-size: 0.26rem;
            font-style: normal;
            font-weight: 600;
            line-height: 0.28rem; /* 107.692% */
          }
        }
      }
    }
  }

  .reward-tabs {
    width: 7.5rem;
    margin: 0.4rem auto 0;

    position: relative;
    z-index: 1;

    .reward-tabs-inner {
      width: fit-content;
      margin: 0 auto;

      display: flex;
      position: relative;
      z-index: 1;

      .reward-tabs-component {
        .tab {
          width: 2.04rem;
          height: 0.72rem;
          flex-shrink: 0;
          margin: 0 0.12rem;

          display: flex;
          justify-content: center;
          align-items: center;

          position: relative;
          z-index: 1;

          span {
            width: 2.24rem;

            color: #5ef8b8;
            text-align: center;
            font-family: "SF UI Text";
            font-size: 0.24rem;
            font-style: normal;
            font-weight: 600;
            line-height: 0.3rem;

            position: absolute;
            z-index: 1;
          }

          &.act {
            span {
              color: #c45c00;
              text-align: center;
              font-family: "SF UI Text";
              font-size: 0.24rem;
              font-style: normal;
              font-weight: 600;
              line-height: 0.28rem;
            }
          }
        }
      }
    }
  }

  .rule-content {
    width: 7.5rem;
    height: auto;
    min-height: 20rem;

    margin: 0 auto;
    margin-top: 0.16rem;
    padding-bottom: 1rem;

    color: red;
    font-size: 0.38rem;

    position: relative;
    z-index: 3;

    > img {
      width: 100vw;
      margin: 0 auto;
    }
  }
}
</style>
