<template>
  <div class="timer fc">
    <div v-if="status == -1 || status == 1">
      <van-count-down :time="timeLeft" format="DD 天 HH 时 mm 分 ss 秒" class="fc">
        <template #default="timeData">
          <template v-if="timeData?.days > 0">
            <div v-bg="'timer'" class="fc block">
              <span class="text">{{ timeData.days }}</span>
            </div>
            <span class="text days">{{ timeData.days == 1 ? day : days }}</span>
          </template>
          <div v-bg="'timer'" class="fc block">
            <span class="text">{{ formatTime(timeData.hours) }}</span>
          </div>
          <span class="text colon">:</span>
          <div v-bg="'timer'" class="fc block">
            <span class="text">{{ formatTime(timeData.minutes) }}</span>
          </div>
          <span class="text colon">:</span>
          <div v-bg="'timer'" class="fc block">
            <span class="text">{{ formatTime(timeData.seconds) }}</span>
          </div>
        </template>
      </van-count-down>
    </div>
    <div v-else class="text char">{{ status == 0 ? ended : '--' }}</div>
  </div>
</template>

<script lang="ts" setup name="Timer">
import injectTool from '@publicComponents/injectTool'

const ossUrl = inject('ossUrl')
const { TOOL_TEXT, TOOL_countryCode } = injectTool()

const props = defineProps({
  timeLeft: {
    type: [Number, String],
    default: -99
  },
  status: {
    type: [Number, String],
    default: -2
  }
})

const ended = computed(() => TOOL_TEXT[609])
const day = computed(() => TOOL_TEXT[610])
const days = computed(() => TOOL_TEXT[611])

const formatTime = (value) => (value < 10 ? '0' + value : value)
</script>

<style scoped lang="scss">
// 计时器样式
.timer {
  width: auto;
  height: 0.56rem;

  // 所有text的样式
  .text {
    color: #fff;

    text-align: center;
    font-family: Arial;
    font-size: 0.32rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.32rem;
    /* 100% */
  }

  // 冒号的样式
  .colon {
    display: inline-block;
    margin: 0 0.12rem;
  }

  // 时分秒的样式
  .block {
    width: 0.64rem;
    height: 0.5rem;
    line-height: 0.5rem;
    flex-shrink: 0;
  }

  // days的样式
  .days {
    margin: 0 0.12rem;
  }

  // 未开始、已结束文字的样式
  .char {
  }
}
</style>
