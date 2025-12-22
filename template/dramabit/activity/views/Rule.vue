<template>
  <div class="rule">
    <div class="rule-img">
      <RankTabSelector
        v-model="activeTab"
        :tabs="tabList"
        @change="onTabChange"
      />
      <OssImg :src="`${country}-${ruleImgName}`" class="rule_img" tag="img" />
    </div>
  </div>
</template>

<script lang="ts" setup name="Rule">
import injectTool from "@publicComponents/injectTool";
import RankTabSelector from "../components/RankTabSelector.vue";

const { TOOL_RULE, TOOL_countryCode, TOOL_TEXT } = injectTool();

const country = ["TW", "MY", "ID"].includes(TOOL_countryCode)
  ? TOOL_countryCode
  : "MY";

const rule = computed(() => TOOL_RULE());

// Tab 选择器
const activeTab = ref(0);
const tabList = computed(() => [TOOL_TEXT[5], TOOL_TEXT[6], TOOL_TEXT[7]]);

// 根据 tab 映射图片名称
const ruleImgName = computed(() => {
  const imgNames = ["Rules-1", "Rules-2", "Rewards"];
  return imgNames[activeTab.value] || "Rules";
});

const onTabChange = (index: number) => {
  console.log("Rule Tab changed to:", index);
};
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin";

.rule {
  margin-top: -2.8rem;
  position: relative;
  z-index: 10;

  .rule-img {
    width: 7.5rem;
    height: auto;
    margin: 0.2rem auto;

    img {
      width: 7.5rem !important;
    }
  }
}
</style>
