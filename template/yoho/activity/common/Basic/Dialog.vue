<!-- 实例 -->
<!--
<Dialog v-model="ruleDialog">
</Dialog>
-->

<template>
  <teleport to="body">
    <div class="dialog-c" :style="{ zIndex: zIndex }">
      <Component
        :is="
          isVideo
            ? `animate-${TOOL_countryCode == 'EG' ? 'l' : 'r'}`
            : 'animate-p'
        "
      >
        <template #shade>
          <div
            class="public-mask-bg"
            v-if="show"
            @click="close(hasMaskClose)"
          ></div>
        </template>
        <template #content>
          <div
            class="public-fixed-fullScreen dialog-wrap"
            :class="{ allClose: allClose }"
            @click="toClose"
            v-if="show"
          >
            <!-- 关闭按钮 -->
            <div
              class="toast-box public-fixed-center"
              :class="{ live: isLiveBanner }"
            >
              <div class="panel">
                <img
                  src="https://image.hoko.media/static/close.png"
                  class="close-btn"
                  @click="btnCloseFunc"
                  :style="isVideo ? videoClose : closeOpt"
                />
                <slot></slot>
              </div>
            </div>
          </div>
        </template>
      </Component>
    </div>
  </teleport>
</template>

<script lang="ts" setup name="Dialog">
import {
  closeWindowScroll,
  isLiveBanner,
  openWindowScroll,
} from "@publicComponents/shared";
import injectTool from "@publicComponents/injectTool";
const { TOOL_countryCode } = injectTool();

// 默认height为运营位时弹出的高度8rem
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  closeOpt: {
    type: Object,
    default: {
      width: "0.72rem",
      height: "0.72rem",
      bottom: "-1rem",
    },
  },
  maskAlpha: {
    type: Number,
    default: 0.6,
  },
  hasMaskClose: {
    type: Boolean,
    default: false,
  },
  allClose: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: 100,
  },
  isVideo: {
    type: Boolean,
    default: false,
  },
  btnClose: {
    type: Boolean,
    default: true,
  },
  subDialog: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  type: {
    // 榜单类型
    type: String,
    default: "dialog",
  },
});

const videoClose = {
  width: "0.72rem",
  height: "0.72rem",
  left: "0.32rem",
  top: "0.32rem",
};

const toClose = () => {
  if (props.allClose) {
    close(true);
  }
};

const emit = defineEmits([
  "update:modelValue",
  "open",
  "beforeClose",
  "btnCloseFunc",
]);

const btnCloseFunc = () => {
  if (props?.btnClose) {
    close(true);
  } else {
    emit("btnCloseFunc");
  }
};

const show = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const showToast = () => {
  // console.log('dia-show')
  closeWindowScroll();
};

const close = (switchVal: boolean = true) => {
  // console.log('dia-close')
  if (switchVal) {
    emit("beforeClose");
    show.value = false;
    !props?.subDialog && openWindowScroll();
  }
};

watch(
  () => {
    return show.value;
  },
  () => {
    if (show.value) {
      emit("open");
      showToast();
    } else {
      close();
    }
  }
);

provide("close", close);
</script>

<style lang="scss" scoped>
.dialog-c {
  position: relative;
}
.public-mask-bg {
  background: #000000;
  opacity: 0.6;
  z-index: 100;
  pointer-events: all;
}

.dialog-wrap {
  overscroll-behavior: contain;
  z-index: 200;
  pointer-events: none;
  &.allClose {
    pointer-events: auto;
  }
  .toast-box {
    // &.live {
    //   transform: scale(0.75);
    // }
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    .panel {
      position: relative;
      pointer-events: auto;
      width: 7.5rem;
      min-height: 3rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      flex-direction: column;
    }
    .close-btn {
      z-index: 10;
      position: absolute;
    }
  }
}
</style>
