<template>
  <div class="rank-tab-selector">
    <!-- 背景条 -->
    <OssImg src="rank-tab-bg" tag="img" class="tab-bg" />

    <!-- Tab 项 -->
    <div class="tab-list">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: modelValue === index }"
        @click="handleSelect(index)"
      >
        <OssImg
          :src="modelValue === index ? 'rank-tab-act' : 'rank-tab'"
          tag="img"
          class="tab-btn"
        />
        <span class="tab-text">{{ tab }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: number;
    tabs: string[];
  }>(),
  {
    modelValue: 0,
    tabs: () => ["Tab 1", "Tab 2", "Tab 3"],
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
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin";

.rank-tab-selector {
  position: relative;
  width: 7.5rem;
  height: 1.21rem;
  display: flex;
  justify-content: center;
  align-items: center;

  .tab-bg {
    position: absolute;
    width: 7.41762rem;
    height: 1.21rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    object-fit: contain;
    z-index: 0;
  }

  .tab-list {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.02rem;
    margin-top: 0.1rem;
  }

  .tab-item {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    .tab-btn {
      width: 2.38rem;
      height: 0.72rem;
      object-fit: contain;
    }

    .tab-text {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: #adb9e4;
      font-family: "SF Arabic", sans-serif;
      font-size: 0.24rem;
      font-weight: 700;
      line-height: 0.26rem;
      text-align: center;
      white-space: nowrap;
    }

    &.active {
      margin-top: 0.2rem;
      .tab-btn {
        width: 2.38rem;
        height: 0.9rem;
      }
      .tab-text {
        margin-top: -0.1rem;
        color: #702b09;
      }
    }
  }
}
</style>
