<template>
  <div class="tabs-component-wrap scrollX" ref="scrollRef">
    <div class="tabs-component">
      <div v-for="(item, index) in tabList" :key="index" ref="listItemRef">
        <div
          class="tab fc"
          :class="`${actTab == index ? 'act' : ''} tab${index}`"
          @click="switchTab(index)"
          v-show="!hideTabIndex.includes(index)"
        >
          <img
            class="obg"
            :src="`${ossUrl}/${actTab == index ? 'rank-tab-act' : 'rank-tab'}.png`"
          />
          <Outline :color="`0.05rem #77220B`" :text="item.text" noColor />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="tabsRank">
import injectTool from '@publicComponents/injectTool'
import { scrollFn } from '../../tools/dateFunc.js'
import { normalToWithText } from '../../tools/tab.js'

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
    default: [173, 174, 175]
  }
})
const emit = defineEmits(['update:modelValue'])

const tabList = computed(() => normalToWithText(TOOL_TEXT, props.text))

const scrollRef = ref(null)
const listItemRef = ref(null)
const scrollFnIndex = (index) => {
  scrollFn(scrollRef.value, listItemRef.value, 'x', tabList.value, index)
}

const actTab = ref(props.modelValue)
const switchTab = (index) => {
  TOOL_BPFunc({ desc: `rank_tab${index + 1}_click`, action: 'click' }) //固定不变，勿删
  actTab.value = index
  emit('update:modelValue', index)
  scrollFnIndex(index)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal != actTab.value) actTab.value = newVal
  }
)

const hideTabIndex: any = computed(() => (['EG'].includes(TOOL_countryCode) ? [] : [])) // 通过index过滤Tab

onMounted(() => {
  const tabIndex = tabList.value.findIndex((item, index) => actTab.value == index)
  const tabListLength = tabList.value.length
  scrollFnIndex(tabIndex == 0 ? 1 : tabIndex == tabListLength - 1 ? tabListLength - 2 : tabIndex)
})
</script>

<style lang="scss" scoped>
.tabs-component-wrap {
  width: 7.5rem;
  margin-top: 0.4rem;

  position: relative;
  z-index: 10;

  .tabs-component {
    width: fit-content;
    margin: 0 auto;

    display: flex;
    position: relative;
    z-index: 1;

    .tab {
      width: 2.04rem;
      height: 0.71999rem;
      flex-shrink: 0;
      margin: 0 0.12rem;

      display: flex;
      justify-content: center;
      align-items: center;

      position: relative;
      z-index: 1;

      span {
        width: 2.24rem;

        color: #5ef8b8;
        text-align: center;
        font-family: 'SF UI Text';
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 600;
        line-height: 0.3rem; /* 125% */

        position: absolute;
        z-index: 1;
      }

      &.act {
        span {
          color: #c45c00;
          text-align: center;
          font-family: 'SF UI Text';
          font-size: 0.24rem;
          font-style: normal;
          font-weight: 600;
          line-height: 0.28rem; /* 116.667% */
        }
      }
    }
  }
}
</style>
