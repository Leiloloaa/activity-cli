<template>
  <div class="tab_nav">
    <div class="tab-adorn"></div>
    <div class="tab_row tab_row1">
      <RouterLink
        v-for="(tab, idx) in tabsConfig.slice(0, 2)"
        :key="`tab_nav_${idx}`"
        :to="tab.path"
        class="tab_item"
        :class="{ active: route.path === tab.path }"
        replace
      >
        <Outline
          class="tab_text"
          :color="
            route.path === tab.path ? `0.05rem #FFFDCC` : `0.05rem #303488`
          "
          :text="TOOL_TEXT[tab.labelIndex]"
        />
      </RouterLink>
    </div>
    <div class="tab_row tab_row2">
      <RouterLink
        v-for="(tab, idx) in tabsConfig.slice(2, 4)"
        :key="`tab_nav_${idx + 2}`"
        :to="tab.path"
        class="tab_item"
        :class="{ active: route.path === tab.path }"
        replace
      >
        <Outline
          class="tab_text"
          :color="
            route.path === tab.path ? `0.05rem #FFFDCC` : `0.05rem #303488`
          "
          :text="TOOL_TEXT[tab.labelIndex]"
        />
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
import { useRoute } from "vue-router";

const { TOOL_TEXT } = injectTool();

defineProps<{
  tabsConfig: { labelIndex: number; path: string }[];
}>();

const route = useRoute();
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin";

.tab_nav {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  position: relative;
  .tab-adorn {
    width: 4.48rem;
    height: 4.48rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    @include bg("tab-adorn");
    top: -0.98rem;
  }

  .tab_row {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 0.08rem;
    &.tab_row1 {
      gap: 1.88rem;
      margin-bottom: 0.08rem;
    }
  }

  .tab_item {
    width: 2.62rem;
    height: 1.4rem;
    @include bg("tab");
    @extend %fc;
    padding-top: 0.28rem;
    position: relative;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s ease;

    .tab_bg {
      width: 100%;
      height: auto;
      display: block;
    }

    .tab_text {
      width: 2.4rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #a7abdf;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.25rem;
      font-style: normal;
      line-height: 0.26rem; /* 108.333% */
    }

    &.active {
      z-index: 1;
      @include bg("tab-act");

      .tab_text {
        color: #a92a00;
        text-align: center;
        font-family: "SF Arabic";
        font-style: normal;
        font-weight: 711;
        line-height: 0.28rem; /* 116.667% */
      }
    }
  }
}
</style>
