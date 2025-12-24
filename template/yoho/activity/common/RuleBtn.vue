<template>
  <div v-bg="'rule'" :class="`rule-btn rule-btn-${TOOL_countryCode} fc`" @click="toRule">
    <Outline
      :color="`0.05rem #a3cde0`"
      :text="TOOL_TEXT[!route.path.includes('rule') ? 602 : 604]"
      noColor
    />
  </div>
</template>

<script lang="ts" setup name="RuleBtn">
import injectTool from '@publicComponents/injectTool'
import { useAppStore } from '../store'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { TOOL_countryCode, TOOL_TEXT, TOOL_BPFunc, TOOL_httpClient } = injectTool()

const toRule = () => {
  if (route.path.includes('rule')) {
    TOOL_BPFunc({ desc: 'back_button_click', action: 'click' }) //固定不变，勿删
    if (window?.history?.state?.back) {
      router.go(-1)
    } else {
      if (appStore.historyBack == 'home') {
        router.replace('/home')
      } else {
        router.replace({ name: appStore.historyBack })
      }
    }
  } else {
    TOOL_BPFunc({ desc: 'rule_button_click', action: 'click' }) //固定不变，勿删
    appStore.historyBack = route.name // 记录点击rule按钮前的路由
    router.replace({ name: 'rule' })
  }
}
</script>

<style lang="scss" scoped>
// 规则按钮样式
.rule-btn {
  width: 1.44rem;
  height: 0.54rem;
  flex-shrink: 0;

  position: fixed;
  top: 5.52rem;
  right: 0;
  z-index: 20;
  padding-left: 0.22rem;

  animation: slideIn 0.6s forwards; /* 动画持续1秒，完成后保持最终状态 */

  span {
    color: #fff;
    text-align: center;
    font-family: Arial;
    font-size: 0.24rem;
    font-style: normal;
    font-weight: 700;
    line-height: 0.24rem; /* 100% */
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%); /* 从右侧开始 */
  }
  to {
    transform: translateX(0); /* 移动到原位置 */
  }
}
</style>
