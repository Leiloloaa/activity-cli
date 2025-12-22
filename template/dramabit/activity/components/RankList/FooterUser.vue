<template>
  <div class="footer">
    <NormalRankItem
      :item="userInfo"
      :rank="userInfo?.rank ?? '--'"
      :status="1"
      inFooter
      isFooterUser
      :isDailyRank="isDailyRank"
      :isGuildRank="isGuildRank"
      :disableJump="disableJump"
      :hideFlag="hideFlag"
    />
  </div>
</template>

<script lang="ts" setup>
import type { InfoType } from "../../types/rank";
import injectTool from "@publicComponents/injectTool";
import NormalRankItem from "./NormalRankItem.vue";

const { TOOL_TEXT } = injectTool();

withDefaults(
  defineProps<{
    userInfo: InfoType;
    isDailyRank?: boolean;
    isGuildRank?: boolean;
    disableJump?: boolean;
    hideFlag?: boolean;
  }>(),
  {
    isDailyRank: false,
    isGuildRank: false,
    disableJump: false,
    hideFlag: false,
  }
);
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin.scss";
.footer {
  @include bg("footer");
  width: 7.5rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  :deep(.user) {
    background: none !important;
    padding-bottom: 0.1rem;
  }
}
</style>
