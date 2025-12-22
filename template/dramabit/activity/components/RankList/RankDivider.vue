<template>
  <div class="rank-divider">
    <OssImg src="line-adorn1" tag="img" class="divider-line" />
    <span class="divider-text">{{ text }}</span>
    <OssImg src="line-adorn2" tag="img" class="divider-line" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text: string;
}>();
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin.scss";

.rank-divider {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 0.09rem;
  direction: ltr;

  .divider-line {
    width: 0.7rem;
    height: 0.14rem;
    flex-shrink: 0;
    object-fit: contain;
  }

  .divider-text {
    margin-top: 0.12rem;
    color: #fffdd0;
    text-align: center;
    font-family: Arial;
    font-size: 0.24rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.32rem;
  }
}
</style>
