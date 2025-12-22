<template>
  <div class="anchor-rank" :class="{ coming: status === -1 }">
    <TabSelector v-model="activeTab" :tabs="tabList" @change="onTabChange" />
    <RankTabSelector
      v-if="activeTab === 0"
      v-model="activeRankTab"
      :tabs="rankTabList"
      @change="onRankTabChange"
    />
    <TimeLeft :timeLeft="timeLeft" style="margin-top: 0.2rem" />
    <div class="tip" v-html="tipText"></div>

    <!-- Coming Soon 状态 -->
    <div v-show="status === -1" class="coming-soon">
      <OssImg src="soon" class="soon-bg" tag="img" />
      <span class="soon-text">{{ TOOL_TEXT[18] || "coming soon" }}</span>
    </div>

    <!-- 正常榜单 -->
    <RankFrame
      v-show="status !== -1"
      style="margin-top: -0.35rem"
      type="rankList"
    >
      <div class="content">
        <ScrollList
          :key="otherParam"
          :api="api"
          :apiParams="params"
          @getPageInfo="getPageInfo"
        >
          <template #default="{ list, status: listStatus }">
            <!-- 阶段1总榜 或 阶段2 显示 Top3 -->
            <Top3
              v-if="showTop3"
              :list="list.slice(0, 3)"
              class="top3"
              :status="listStatus"
              :activityId="config.activityId"
              :otherParam="otherParam"
              :hideFlag="otherParam !== '2'"
            />
            <template
              v-for="(item, idx) in showTop3 ? list.slice(3) : list"
              :key="idx"
            >
              <NormalRankItem
                :item="item"
                :status="listStatus"
                :rank="showTop3 ? idx + 4 : idx + 1"
                :isTop3="!showTop3 && idx < 3"
                :activityId="config.activityId"
                :otherParam="otherParam"
                :hideFlag="otherParam !== '2'"
              />
              <!-- 阶段一总榜：在第20名后显示分割线 -->
              <RankDivider
                v-if="
                  otherParam === '1' && (showTop3 ? idx + 4 : idx + 1) === 20
                "
                :text="TOOL_TEXT[25]?.replace('X', 20)"
              />
            </template>
          </template>
          <template #footer="{ userInfo }">
            <FooterUser :userInfo="userInfo" :isDailyRank="false" />
          </template>
        </ScrollList>
      </div>
    </RankFrame>
  </div>
</template>

<script lang="ts" setup>
import RankFrame from "../common/RankFrame.vue";
import ScrollList from "../components/ScrollList.vue";
import TimeLeft from "../components/TimeLeft.vue";
import TabSelector from "../components/TabSelector.vue";
import RankTabSelector from "../components/RankTabSelector.vue";
import Top3 from "../components/RankList/Top3.vue";
import NormalRankItem from "../components/RankList/NormalRankItem.vue";
import FooterUser from "../components/RankList/FooterUser.vue";
import RankDivider from "../components/RankList/RankDivider.vue";
import { config } from "../config";
import injectTool from "@publicComponents/injectTool";

const { TOOL_BPFunc, TOOL_TEXT, TOOL_httpClient } = injectTool();

// 埋点上报
TOOL_BPFunc({ desc: "pvuv_show_rank_anchor", type: "show" });

const api = "/api/activity/commonBusiness/anchorTotalRank";

const timeLeft = ref(0);
const status = ref(-1);
const currentStage = ref(""); // 当前阶段

// Tab 选择器 (一级)
const activeTab = ref(0);
const tabList = computed(() => [TOOL_TEXT[13], TOOL_TEXT[14]]);

const onTabChange = (index: number) => {
  console.log("Tab changed to:", index);
};

// Rank Tab 选择器 (二级)
const activeRankTab = ref(0);
const rankTabList = computed(() => [
  TOOL_TEXT[62] || "Minggu 1",
  TOOL_TEXT[63] || "Minggu 2",
  TOOL_TEXT[64] || "Total Peringkat",
]);

const onRankTabChange = (index: number) => {
  console.log("Rank Tab changed to:", index);
};

// 获取当前阶段
const getCurrentStage = () => {
  TOOL_httpClient({
    method: "GET",
    url: "/api/activity/annualGala2025/currentStage",
  })
    .then((res) => {
      const stage = res.data?.data;
      currentStage.value = stage;

      // 根据阶段设置 tab 默认值
      // -1: 活动未开始 -> 定位到阶段 1-1
      // 0: 活动已结束 -> 定位到阶段 2
      // "1,1": 阶段1 第一周
      // "1,2": 阶段1 第二周
      // "2": 阶段2
      if (stage === -1 || stage === "-1") {
        // 活动未开始，定位到阶段 1-1
        activeTab.value = 0;
        activeRankTab.value = 0;
      } else if (stage === 0 || stage === "0") {
        // 活动已结束，定位到阶段 2
        activeTab.value = 1;
      } else if (stage === "1.1") {
        // 阶段1 第一周
        activeTab.value = 0;
        activeRankTab.value = 0;
      } else if (stage === "1.2") {
        // 阶段1 第二周
        activeTab.value = 0;
        activeRankTab.value = 1;
      } else if (stage === "2") {
        // 阶段2
        activeTab.value = 1;
      }
    })
    .catch((err) => {
      console.error("获取当前阶段失败:", err);
    });
};

// 页面加载时获取当前阶段
onMounted(() => {
  getCurrentStage();
});

// 是否显示 Top3 组件（阶段1的第一周和第二周不显示，阶段1总榜和阶段2显示）
const showTop3 = computed(() => {
  // 阶段2 显示 Top3
  if (activeTab.value === 1) return true;
  // 阶段1 只有总榜(activeRankTab=2)显示 Top3
  return activeRankTab.value === 2;
});

// 根据 tab 选择计算 other 参数
const otherParam = computed(() => {
  // 阶段2
  if (activeTab.value === 1) {
    return "2";
  }
  // 阶段1
  if (activeRankTab.value === 0) {
    return "1,1"; // 第一周
  } else if (activeRankTab.value === 1) {
    return "1,2"; // 第二周
  } else {
    return "1"; // 总榜
  }
});

const params = computed(() => {
  return {
    activityId: config.activityId,
    other: otherParam.value,
  };
});

const getPageInfo = (pageInfo: any) => {
  timeLeft.value = pageInfo.timeLeft ?? 0;
  status.value = pageInfo.status ?? -1;
};

// 处理 tip 文案，在逗号处换行
const tipText = computed(() => {
  const text = TOOL_TEXT[otherParam.value === "2" ? 22 : 19] || "";
  return text.replace(/，/g, "，<br>");
});
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin";

.anchor-rank {
  padding-bottom: 1rem;

  .content {
    padding-top: 0.35rem;
  }

  .tip {
    margin: 0 auto;
    margin-top: 0.16rem;
    width: 6.22rem;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 0.26rem;
    font-style: normal;
    font-weight: 400;
    line-height: 0.34rem;
  }

  // Coming Soon 样式
  .coming-soon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: -0.35rem;
    margin-bottom: 0.35rem;
    position: relative;

    .soon-bg {
      width: 6.8rem;
      height: auto;
      object-fit: contain;
    }

    .soon-text {
      position: absolute;
      white-space: nowrap;
      top: 3.01rem;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #870303;
      text-align: center;
      font-family: "SF UI Text";
      font-size: 0.6rem;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }
  }
}

.coming {
  :deep(.rank-down) {
    margin-top: -0.82rem !important;
  }
}
</style>
