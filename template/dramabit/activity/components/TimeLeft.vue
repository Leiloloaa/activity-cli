<template>
  <div class="countdown" :class="{ small }">
    <div class="public_flex_center" v-if="copTimeText.length != 1">
      <!-- icon -->
      <!-- <uiImg n="countdown_icon1" class="countdown_icon" /> -->
      <template v-if="copTimeText[0] > '0'">
        <p class="num">{{ copTimeText[0] }}</p>
        <p class="text day">
          {{ copTimeText[0] > "1" ? TOOL_TEXT[49] : TOOL_TEXT[48] }}
        </p>
      </template>
      <p class="num">{{ copTimeText[1] }}</p>
      <p class="text">:</p>
      <p class="num">{{ copTimeText[2] }}</p>
      <p class="text">:</p>
      <p class="num">{{ copTimeText[3] }}</p>
    </div>
    <div class="public_flex_center end" v-else>
      <p class="text">{{ copTimeText[0] }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { timeSplit } from "@publicJS/activityPublic";
import injectTool from "@publicComponents/injectTool";

const { TOOL_TEXT } = injectTool();

const props: {
  readonly timeLeft: number;
  readonly end: string;
  readonly small?: boolean;
} = defineProps({
  timeLeft: {
    type: Number,
    required: true,
    default: -99,
  },
  end: {
    type: String,
    required: false,
    default: "- END -",
  },
  small: {
    type: Boolean,
    required: false,
    default: false,
  },
});

let timeID: any = null;
let refTimeLeft = ref<number>(-99);
const fnTimeIdClear = (): void => clearInterval(timeID);

const copTimeText = computed(() => {
  if (refTimeLeft.value == 0) fnTimeIdClear();
  return timeSplit(refTimeLeft.value, TOOL_TEXT[73] ?? props.end);
});

watch(
  () => props.timeLeft,
  (v) => {
    refTimeLeft.value = props.timeLeft;
    fnTimeIdClear();
    if (v > 0) {
      timeID = setInterval(() => (refTimeLeft.value -= 1000), 1000);
    }
  },
  { deep: true, immediate: true }
);

onBeforeUnmount(fnTimeIdClear);
</script>

<style lang="scss" scoped>
// @use '../static/mixin.scss' as *;
@import "../scss/public_mixin.scss";

.countdown {
  position: relative;
  width: 100%;
  // height: 0.5rem;
  overflow: hidden;

  .text_style {
    color: #fffdd0;
    text-align: center;
    font-family: Arial;
    font-size: 0.3rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.32rem; /* 106.667% */
    /* 100% */
  }

  .countdown_icon {
    width: 1.74rem;
    height: 0.18rem;
    margin: 0 0.04rem;
  }

  p {
    @extend %fc;

    &.num {
      min-width: 0.64rem;
      height: 0.46rem;
      @extend .text_style;
      // @include bg('countdown_num');
      border-radius: 0.08rem;
      @include bg("timer");
    }

    &.text {
      margin: 0 0.08rem;
      @extend .text_style;

      &.day {
        margin: 0 0.1rem;
      }
    }
  }

  &.small {
    .text_style {
      color: #ffea7f;
      text-align: center;
      font-family: Arial;
      font-size: 0.14rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.14191rem; /* 101.366% */
    }
    .num {
      min-width: 0.28rem;
      height: 0.2rem;
      border-radius: 0.03548rem;
    }
    .text {
      margin: 0 0.03rem;
      &.day {
        margin: 0 0.03rem;
      }
    }
  }
}
</style>
