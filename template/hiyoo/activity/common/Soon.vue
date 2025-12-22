<template>
  <div class="soon-wrap">
    <div v-bg="'soon'" class="soon" :class="TOOL_countryCode">
      <Outline :color="`0.05rem #611903`" :text="TOOL_TEXT[end ? 609 : 607]" noColor />
    </div>
  </div>
</template>

<script lang="ts" setup name="ComingSoon">
import injectTool from '@publicComponents/injectTool'

// 活动下线传入 end，显示已结束
const props = defineProps({
  end: {
    type: Boolean,
    default: false
  }
})

const { TOOL_countryCode, TOOL_TEXT, TOOL_BPFunc } = injectTool()
</script>

<style lang="scss" scoped>
.soon-wrap {
  width: 100%;
  height: auto;
  position: relative;
  z-index: 1;
}

.soon {
  width: 6.79rem;
  height: 8.31rem;
  flex-shrink: 0;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  justify-content: center;

  span {
    margin-top: 1.32rem;
    position: relative;
    z-index: 2;
    color: #fff4a4;
    text-align: center;
    font-family: 'Geeza Pro';
    font-size: 0.64rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.32rem;
    letter-spacing: -0.00805rem;
  }
}
</style>
