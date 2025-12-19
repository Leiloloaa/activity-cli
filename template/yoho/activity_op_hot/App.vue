<template>
  <div
    class="hot-banner"
    :class="`hot-banner-${isIOS ? 'ios' : 'android'} hot-banner-${TOOL_countryCode}`"
  >
    <img class="hot-banner-bg" :src="`${ossUrl}/hot-banner.png${resize_banner_bg}`" alt="" />
    <div class="hot-banner-safe-area"><HomeAvatar /></div>
  </div>
</template>

<script lang="ts" setup name="App">
import injectTool from '@publicComponents/injectTool'
import { config } from './config'
import HomeAvatar from './HomeAvatar.vue'
import { isIOS } from './components/plat'
import { getRewFunc } from '@publicComponents/methods/reward/index.js'

const getRew = (reward: object) => getRewFunc(reward, TOOL_TEXT, TOOL_countryCode)

const resize_banner_bg = '?x-oss-process=image/format,webp/quality,Q_80/resize,m_fill,w_750,h_250'

const { TOOL_TEXT, TOOL_countryCode } = injectTool()
watchEffect(() => {
  document.title = TOOL_TEXT[2] || 'Loading...'
})

const ossUrl = window.hostConfig.oss + config.projectName
provide('ossUrl', ossUrl)
provide('imgUrl', ossUrl)
provide('activityId', config.activityId)
provide('getRew', getRew)
</script>

<style lang="scss" scoped>
.hot-banner {
  direction: ltr;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  .hot-banner-bg {
    width: 7.5rem;
    height: 2.5rem;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .hot-banner-safe-area {
    width: 6.86rem;
    height: 2.28rem;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    overflow: hidden;
  }
}

.hot-banner-ios {
  width: auto;
  height: auto;
  min-width: 6.86rem;
  min-height: 2.28rem;

  .hot-banner-safe-area {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(0, -50%);
  }
}

.hot-banner-android {
  width: 7.5rem;
  height: 2.5rem;
}
</style>
