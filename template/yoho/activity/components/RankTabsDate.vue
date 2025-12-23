<template>
  <div class="tabs-component-wrap">
    <div class="tabs-component">
      <img class="obg" :src="`${ossUrl}/date-tab-bg.png`" alt="" />

      <div v-for="(item, index) in tabList" :key="index">
        <div
          class="tab fc"
          :class="`${actTab == index ? 'act' : ''} tab${index}`"
          @click="switchTab(index)"
          v-show="!hideTabIndex.includes(index)"
        >
          <img
            v-if="actTab == index"
            class="obg"
            :src="`${ossUrl}/${actTab == index ? 'date-tab-act' : 'date-tab'}.png`"
          />
          <Outline :color="`0.05rem #77220B`" :text="item.text" noColor />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="tabsRank">
import injectTool from '@publicComponents/injectTool'
import { normalToWithText } from '../../common/Tabs/tab'

const route = useRoute()
const router = useRouter()
const ossUrl = inject('ossUrl')
const activityId = inject('activityId')
const { TOOL_TEXT, TOOL_countryCode, TOOL_BPFunc } = injectTool()

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  text: {
    type: Array,
    default: [614, 615]
  }
})
const emit = defineEmits(['update:modelValue'])

const tabList = computed(() => normalToWithText(TOOL_TEXT, props.text))

const actTab = ref(props.modelValue)
const switchTab = (index) => {
  TOOL_BPFunc({ desc: `rank_tab${index + 1}_click`, action: 'click' }) //固定不变，勿删
  actTab.value = index
  emit('update:modelValue', index)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal != actTab.value) actTab.value = newVal
  }
)

const hideTabIndex: any = computed(() => (['EG'].includes(TOOL_countryCode) ? [] : [])) // 通过index过滤Tab
</script>

<style lang="scss" scoped>
.tabs-component-wrap {
  width: 6.46rem;
  height: 0.8rem;
  margin: 0 auto;
  margin-top: 0.4rem;
  margin-bottom: 0.31rem;

  position: relative;
  z-index: 10;

  .tabs-component {
    width: fit-content;
    margin: 0 auto;

    display: flex;
    position: relative;
    z-index: 1;

    .tab {
      width: 3.1rem;
      height: 0.8rem;
      flex-shrink: 0;

      display: flex;
      justify-content: center;
      align-items: center;

      position: relative;
      z-index: 1;

      span {
        width: 2.24rem;

        color: #ff391f;
        text-align: center;
        font-family: 'SF UI Text';
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 600;
        line-height: 0.28rem; /* 107.692% */

        position: relative;
        z-index: 1;
      }

      &.act {
        margin-top: -0.06rem;

        span {
          margin-top: 0.16rem;

          color: #6e0000;
          text-align: center;
          font-family: 'SF UI Text';
          font-size: 0.26rem;
          font-style: normal;
          font-weight: 600;
          line-height: 0.3rem; /* 115.385% */
        }
      }
    }
  }
}
</style>
