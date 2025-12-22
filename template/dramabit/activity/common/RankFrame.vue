<template>
  <div class="frame-wrap">
    <div class="rank-body" v-if="frame">
      <!-- 上 -->
      <slot name="up">
        <div
          class="rank-up"
          :style="{
            width: options?.[type]?.up?.styles?.width + 'rem',
            height: options?.[type]?.up?.styles?.height + 'rem',
          }"
        >
          <img :src="`${imgUrl}/${options?.[type]?.up?.name}.png`" alt="" />
        </div>
      </slot>
      <!-- 中 -->
      <div
        class="rank-middle"
        :style="{
          width: options?.[type]?.mid?.styles?.width + 'rem',
          minHeight: options?.[type]?.mid?.styles?.height + 'rem',
          'background-image': `url(${imgUrl}/${options?.[type].mid.name}.png)`,
          'background-size': `100% ${options?.[type]?.mid?.styles?.height}rem`,
          height: '100%',
        }"
      >
        <div
          class="rank-middle-content"
          :style="{
            marginTop: `-${options?.[type]?.up?.styles?.height}rem`,
            marginBottom: `-${options?.[type]?.down?.styles?.height}rem`,
          }"
        >
          <OssImg v-if="title" src="box_title_v2" class="title">
            <div class="text fc">{{ title }}</div>
          </OssImg>
          <slot />
        </div>
      </div>
      <!-- 下 -->
      <div
        class="rank-down"
        :style="{
          width: options?.[type]?.down?.styles?.width + 'rem',
          height: options?.[type]?.down?.styles?.height + 'rem',
        }"
      >
        <img :src="`${imgUrl}/${options?.[type]?.down?.name}.png`" alt="" />
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<script lang="ts" setup name="RankFrame">
const imgUrl = inject("imgUrl");

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "rank",
  },
  frame: {
    type: Boolean,
    default: true,
  },
  lazy: {
    // rank-middle是否懒加载，如果有 等级轮播 就设置为 false
    type: Boolean,
    default: false,
  },
});

const options = {
  // 配置不同的 rank frame, 默认 type 为 rank
  rank: {
    up: {
      name: "up",
      styles: {
        width: "7.5",
        height: "8.5",
      },
    },
    mid: {
      name: "mid",
      styles: {
        width: "7.5",
        // height: ".82",
        height: "4.45",
      },
    },
    down: {
      name: "down",
      styles: {
        width: "7.5",
        height: "2.5",
      },
    },
  },
  rankList: {
    up: {
      name: "up2",
      styles: {
        width: "7.5",
        height: "8.5",
      },
    },
    mid: {
      name: "mid",
      styles: {
        width: "7.5",
        // height: ".82",
        height: "4.45",
      },
    },
    down: {
      name: "down",
      styles: {
        width: "7.5",
        height: "2.5",
      },
    },
  },
  popup: {
    up: {
      name: "up_pop",
      styles: {
        width: "6.02",
        height: "3.6",
      },
    },
    mid: {
      name: "middle_pop",
      styles: {
        width: "6.02",
        // height: ".77",
        height: ".2",
      },
    },
    down: {
      name: "down_pop",
      styles: {
        width: "6.02",
        height: "1.74",
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin.scss";

.frame-wrap {
  position: relative;
}
.rank-body {
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  position: relative;

  .rank-up {
    margin: 0 auto;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .rank-down {
    margin-top: -0.01rem;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .rank-middle {
    position: relative;
    z-index: 1;

    background-repeat: repeat-y;
    background-position: 0 0;

    // BFC避免内部margin-top的影响
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: -0.01rem;

    .rank-middle-content {
      display: flex;
      flex-direction: column;
      align-items: center;

      position: relative;

      .title {
        @extend %fc;
        align-items: flex-end;
        margin: -0.5rem auto 0;
        width: 5.35rem;
        height: 0.86rem;
        text-align: center;
        .text {
          min-height: 0.6rem;
          width: 2.3rem;
          color: #ffeede;
          // font-family: "SF UI Text";
          font-size: 0.32rem;
          font-style: normal;
          font-weight: 700;
          line-height: 1;
        }
      }
    }
  }
}

#ID {
  .title {
    .text {
      width: 2.9rem;
    }
  }
}
</style>
