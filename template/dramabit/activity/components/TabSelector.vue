<template>
  <div class="tab-selector">
    <!-- 进度条背景 -->
    <div class="progress-bar">
      <OssImg src="1-7" tag="img" class="bar-bg" />
      <div class="bar-fill" :style="{ width: fillWidth }"></div>
    </div>

    <!-- Tab 项 -->
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: modelValue === index }"
      @click="handleSelect(index)"
    >
      <OssImg
        :src="modelValue === index ? '1-6-a' : '1-6'"
        tag="img"
        class="tab-icon"
      />
      <span class="tab-text">{{ tab }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    tabs: string[];
  }>(),
  {
    modelValue: 0,
    tabs: () => ["Tab 1", "Tab 2"],
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
  (e: "change", value: number): void;
}>();

const handleSelect = (index: number) => {
  if (props.modelValue !== index) {
    emit("update:modelValue", index);
    emit("change", index);
  }
};

// 进度条填充宽度，根据选中的 tab 计算
const fillWidth = computed(() => {
  return props.modelValue === 0 ? "0" : "4.34rem";
});
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin";

.tab-selector {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 7.5rem;
  height: 1.59rem;
  padding: 0 1.2rem;
  box-sizing: border-box;

  .progress-bar {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0.46rem;
    width: 4.57rem;
    height: 0.32rem;
    border-radius: 0.07rem;
    overflow: hidden;

    .bar-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bar-fill {
      position: absolute;
      left: 0.1rem;
      top: 50%;
      transform: translateY(-50%);
      height: 0.2rem;
      background: linear-gradient(90deg, #ffd54f 0%, #ffb300 100%);
      border-radius: 0.7rem;
      transition: width 0.3s ease;
    }
  }

  .tab-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    z-index: 2;
    padding-bottom: 0.46rem;

    .tab-icon {
      width: 0.57rem;
      height: 1.00135rem;
      object-fit: contain;
      transition: transform 0.2s ease;
    }

    .tab-text {
      width: 2.5rem;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -0.1rem;
      margin-top: 0.06rem;
      color: #deaf6b;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.34rem; /* 130.769% */
    }

    &.active {
      .tab-icon {
        width: 1.13rem;
        height: 1.19rem;
      }
      .tab-text {
        color: #ffe771;
        text-align: center;
        font-family: "SF Arabic";
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 711;
        line-height: 0.34rem; /* 130.769% */
      }
    }
  }
}
</style>
