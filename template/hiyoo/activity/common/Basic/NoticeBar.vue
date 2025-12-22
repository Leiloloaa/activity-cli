<template>
  <div class="text-wrap fc" :class="TOOL_countryCode" :style="{ width: w + 'rem', height: h + 'rem' }">
    <van-notice-bar background="none" color="#fff" :style="{ width: w + 'rem' }" :speed="speed">
      <div class="txt-c">
        <slot></slot>
      </div>
    </van-notice-bar>
  </div>
</template>

<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'

const { TOOL_BPFunc, TOOL_countryCode, TOOL_TEXT, TOOL_NUM } = injectTool()
const ossUrl = inject('ossUrl')
const props = defineProps({
  w: { type: Number },
  h: { type: Number },
  speed: { type: Number, default: 30 }
})

const route = useRoute()

const h = computed(() => props.h + 'rem')
</script>

<style lang="scss" scoped>
.van-notice-bar {
  height: v-bind(h);
}

.text-wrap {
  overflow: hidden;
  display: flex;
  align-items: center;
  direction: ltr;

  .txt-c {
    display: flex;
    align-items: center;
  }

  &.EG {
    transform: scaleX(-1);

    .txt-c {
      direction: rtl;
      transform: scaleX(-1);
    }
  }
}
</style>
