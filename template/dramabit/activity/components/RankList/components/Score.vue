<template>
  <div v-marquee class="score">
    <div class="score_inner">{{ TOOL_NUM(score, true) }}</div>
  </div>
</template>
<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
const { TOOL_NUM } = injectTool();
defineProps<{ score: number | string }>();
</script>
<style lang="scss" scoped>
@import "../../../scss/public_mixin.scss";
.score {
  width: 1.88rem;
  height: 0.48rem;
  border-radius: 0.46rem;
  background: rgba(0, 0, 0, 0.3);
  @extend %fc;
  .score_inner {
    width: 100%;
    @extend %fc;
    color: #ffea7f;
    text-align: center;
    /* 内文 */
    font-family: Arial;
    font-size: 0.24rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.3rem; /* 125% */
  }
}
</style>
