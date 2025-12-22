<!-- <RewMsg :reward="reward || {}" :look="false">
  <template #message="{ reward, name: _name, num, day, count, coin, fidLength, oss }">
    <div class="picture fc">
        <cdnImg v-if="fidLength > 30" :info="reward"></cdnImg>
        <img v-else :src="oss" alt="" />
      </div>
    </div>
  </template>
</RewMsg> -->

<template>
  <div class="rew-msg-comp" @click="showBigReward">
    <slot
      name="message"
      :ui="ui"
      :ossUrl="ossUrl"
      :_reward="reward"
      :msg="getRew(reward)"
      :_name="getRew(reward)?.name"
      :num="getRew(reward)?.num"
      :days="getRew(reward)?.days"
      :count="getRew(reward)?.count"
      :coin="TOOL_NUM(getRew(reward)?.coin)"
      :fid="fid"
      :fidLength="fidLength"
      :oss="oss"
    />
  </div>
</template>

<script lang="ts" setup name="Rew">
import injectTool from '@publicComponents/injectTool'

const getRew = inject('getRew')
const ossUrl = inject('ossUrl')
const showReward = inject('showReward')
const { TOOL_countryCode, TOOL_NUM } = injectTool()

const props = withDefaults(
  defineProps<{
    reward: {
      type: Object
      default: () => {} // 确保返回一个对象
    }
    look: boolean // 将 look 定义为布尔值
  }>(),
  {
    reward: {}, // 默认值为空对象
    look: false // 默认值为 false
  }
)

const ui = '//image.waka.media/activity/yoho-ui'
const fid = computed(() => props?.reward?.fid || props?.reward?.avatar || props?.reward?.src || '')
const fidLength = computed(() => fid?.value?.length || 0)
const oss = computed(() => `${ossUrl}/${fid?.value}${fid.value.includes('.') ? '' : '.png'}`)

const showBigReward = () => props?.look && showReward(props.reward)
</script>
