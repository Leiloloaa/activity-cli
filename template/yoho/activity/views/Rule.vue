<template>
  <div class="rule">
    <div class="rule-tabs"><TabsRule v-model="ruleTab" /></div>

    <GRSwiper :type="ruleTab == 0 ? 'gift' : 'reward'" :listConfig="listConfig" />

    <div v-show="ruleTab == 1" class="reward-tabs"><TabsReward v-model="rewardTab" /></div>

    <div class="rule-content">
      <img
        :key="`index_${ruleIndex}`"
        :src="`//cdn${addTest}.${domain}.media/${rule[`index_${ruleIndex}`]}`"
        :alt="'rule_' + ruleIndex"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="Rule">
import injectTool from '@publicComponents/injectTool'

const route = useRoute()
const router = useRouter()
const domain = PROJECT == 1 ? 'waka' : 'chatchill'
const addTest = ENV == 'build' ? '' : '-test'
const { TOOL_BPFunc, TOOL_countryCode, TOOL_TEXT, TOOL_RULE } = injectTool()
TOOL_BPFunc({ desc: 'rule_page', action: 'show' }) //固定不变，勿删
const rule = computed(() => TOOL_RULE())

const listConfig = computed(() => {
  if (TOOL_countryCode == 'TR') {
    return [
      {
        range: ['1-2'],
        prefix: 'reward-',
        playIcon: false,
        suffix: 'webp'
      },
      {
        range: ['3-4'],
        prefix: 'reward-',
        playIcon: false,
        suffix: 'png'
      },
      {
        range: ['5-12'],
        prefix: 'reward-',
        playIcon: false,
        suffix: 'webp'
      },
      {
        range: ['13-14'],
        prefix: 'reward-',
        playIcon: false,
        suffix: 'png'
      },
      {
        range: ['15'],
        prefix: 'reward-',
        playIcon: true,
        suffix: 'png'
      },
      {
        range: ['16-18'],
        prefix: 'reward-',
        playIcon: false,
        suffix: 'png'
      }
    ]
  } else {
    return [
      {
        range: ['1-2'],
        prefix: 'rew-img-hiyoo',
        playIcon: false,
        suffix: 'webp'
      },
      {
        range: ['3-4'],
        prefix: 'rew-img-hiyoo',
        playIcon: false,
        suffix: 'png'
      },
      {
        range: ['5-12'],
        prefix: 'rew-img-hiyoo',
        playIcon: false,
        suffix: 'webp'
      },
      {
        range: ['13-14'],
        prefix: 'rew-img-hiyoo',
        playIcon: false,
        suffix: 'png'
      },
      {
        range: ['15'],
        prefix: 'rew-img-hiyoo',
        playIcon: true,
        suffix: 'png'
      }
    ]
  }
})

const ruleTab = ref<number>(0)
const rewardTab = ref<number>(0)

const ruleIndex = computed(() =>
  ruleTab.value == 0 ? 1 : rewardTab.value == 0 ? 2 : 2 + rewardTab.value
)

const type = Number(route.params.type) || Number(route.query.type) || 0
onMounted(() => {
  if (type > 1) {
    ruleTab.value = 1 // 跳转至奖励页
    rewardTab.value = type - 2 // 选中指定Tab
  }
})
</script>

<style lang="scss" scoped>
.rule {
  width: 100%;
  height: auto;

  position: relative;
  z-index: 1;

  .rule-tabs {
    margin-top: 0.06rem;

    position: relative;
    z-index: 1;
  }

  .reward-tabs {
    margin-top: 0.06rem;

    position: relative;
    z-index: 1;
  }

  .rule-content {
    width: 7.5rem;
    height: auto;
    min-height: 20rem;

    margin: 0 auto;
    margin-top: 0.16rem;
    padding-bottom: 1rem;

    color: red;
    font-size: 0.38rem;

    position: relative;
    z-index: 3;

    > img {
      width: 100vw;
      margin: 0 auto;
    }
  }
}
</style>
