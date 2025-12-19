<template>
  <teleport to="body">
    <div class="popup-c" :style="{ zIndex: zIndex }">
      <animate-u>
        <template #shade>
          <div class="public-mask-bg" v-if="show" @click="close"></div>
        </template>
        <template #content>
          <div class="public-fixed-fullScreen popup-wrap" v-if="show">
            <!-- 关闭按钮 -->
            <div class="toast-box public-fixed-center">
              <div class="panel">
                <RankFrame :frame="frame">
                  <div v-bg="'close'" class="close-btn" @click="close" :style="closeOpt"></div>
                  <div class="scroll-content">
                    <slot></slot>
                  </div>
                </RankFrame>
              </div>
            </div>
          </div>
        </template>
      </animate-u>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
// 默认height为运营位时弹出的高度8rem
import injectTool from '@publicComponents/injectTool'
import { closeWindowScroll, openWindowScroll } from '@publicComponents/shared'

const { TOOL_TEXT } = injectTool()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '8rem'
  },
  closeOpt: {
    type: Object,
    default: {
      width: '0.72rem',
      height: '0.72rem',
      top: '-0.96rem',
      right: '0.32rem'
    }
  },
  maskAlpha: {
    type: Number,
    default: 0.8
  },
  hasMaskClose: {
    type: Boolean,
    default: true
  },
  zIndex: {
    type: Number,
    default: 100
  },
  frame: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'open', 'beforeClose'])

const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const showToast = () => {
  // console.log('pop-show')
  closeWindowScroll()
}

const close = () => {
  emit('beforeClose')
  // console.log('pop-close')
  show.value = false
  openWindowScroll()
}

watchEffect(() => {
  if (show.value) {
    emit('open')
    showToast()
  }
})
provide('close', close)
</script>

<style lang="scss" scoped>
.popup-c {
  position: relative;
}
.public-mask-bg {
  background: #000000;
  opacity: 0.8;
  // z-index: 201;
}

.popup-wrap {
  pointer-events: none;
  z-index: 200;

  .toast-box {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    .panel {
      // padding-bottom: 1.04rem;
      pointer-events: all;
      width: 7.5rem;
      flex-shrink: 0;
      position: absolute;
      bottom: 0;
      .scroll-content {
        height: auto;
      }
    }
    .close-btn {
      z-index: 10;
      position: absolute;
    }
  }
}
</style>
