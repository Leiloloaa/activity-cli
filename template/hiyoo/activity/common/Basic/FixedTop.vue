<template>
  <div class="fixed-top-wrap">
    <van-sticky @change="stickyChange" offset-top="0">
      <div class="fixed-top" :class="{ fixed: isFixed }">
        <slot />
      </div>
    </van-sticky>
  </div>
</template>

<script lang="ts" setup>
import useSticky from '@hooks/useSticky'

defineProps({
  bg: {
    type: String,
    default: 'linear-gradient(180deg, rgba(18, 14, 28, 0.9) 64.42%, rgba(18, 14, 28, 0) 98.88%)'
  }
})

const { isFixed, stickyChange } = useSticky()
</script>

<style lang="scss" scoped>
.fixed-top-wrap {
  .fixed-top {
    &.fixed {
      width: 7.5rem;
      height: auto;
      flex-shrink: 0;
      background: v-bind(bg);
      padding-top: 0.08rem;
      padding-bottom: 0.24rem;
    }
  }
}
</style>
