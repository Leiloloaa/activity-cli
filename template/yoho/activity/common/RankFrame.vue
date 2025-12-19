<template>
  <div class="frame-wrap">
    <!-- 标题 -->
    <div v-bg="'dia-title'" class="title" v-if="title">
      <Outline :color="'0.05rem #581604'" :text="title" noColor />
    </div>

    <div class="rank-body" v-if="frame">
      <!-- 上 -->
      <slot name="up">
        <div
          class="rank-up"
          :style="{
            width: processedOptions?.[type]?.up?.styles?.width + 'rem',
            height: processedOptions?.[type]?.up?.styles?.height + 'rem'
          }"
        >
          <img :src="`${ossUrl}/${options?.[type]?.up?.name}.png`" alt="" />
        </div>
      </slot>
      <!-- 中 -->
      <Lazy :lazy="!lazy ? false : appInfo.routerHistory?.length == 1 ? true : lazy">
        <div
          class="rank-middle"
          :style="{
            width: processedOptions?.[type]?.mid?.styles?.width + 'rem',
            minHeight: processedOptions?.[type]?.mid?.styles?.height + 'rem',
            'background-image': `url(${ossUrl}/${options?.[type]?.mid?.name}.png)`,
            'background-size': `100% ${processedOptions?.[type]?.mid?.styles?.height}rem`,
            height: '100%'
          }"
        >
          <div
            class="rank-middle-content"
            :style="{
              marginTop: `-${processedOptions?.[type]?.up?.styles?.height}rem`,
              marginBottom: `-${processedOptions?.[type]?.down?.styles?.height}rem`
            }"
          >
            <slot></slot>
          </div>
        </div>
      </Lazy>
      <!-- 下 -->
      <div
        class="rank-down"
        :style="{
          width: processedOptions?.[type]?.down?.styles?.width + 'rem',
          height: processedOptions?.[type]?.down?.styles?.height + 'rem'
        }"
      >
        <img :src="`${ossUrl}/${options?.[type]?.down?.name}.png`" alt="" />
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<script lang="ts" setup name="RankFrame">
const appInfo: any = inject('appInfo')
const ossUrl = inject('ossUrl')

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'rank'
  },
  frame: {
    type: Boolean,
    default: true
  },
  lazy: {
    // rank-middle是否懒加载，如果有 等级轮播 就设置为 false
    type: Boolean,
    default: false
  }
})

const options = {
  // 配置不同的 rank frame, 默认 type 为 rank
  rank: {
    up: {
      name: 'up',
      styles: `` || 'width: 7.5rem; height: 4rem;'
    },
    mid: {
      name: 'mid',
      styles: `` || 'width: 7.5rem; height: 0.02rem;'
    },
    down: {
      name: 'down',
      styles: `` || 'width: 7.5rem; height: 1.3rem;'
    }
  },
  dialog: {
    up: {
      name: 'd-up',
      styles: `` || 'width: 7.5rem; height: 2.94rem;'
    },
    mid: {
      name: 'd-mid',
      styles: `` || 'width: 7.5rem; height: 1rem;'
    },
    down: {
      name: 'd-down',
      styles: `` || 'width: 7.5rem; height: 2.15rem;'
    }
  }
}

// 将字符串样式转换为对象的通用函数
const parseStyleString = (styleString: string) => {
  if (!styleString) return {}

  const styleArray = styleString.split(';').filter((style) => style.trim())

  const styleObject = {}
  styleArray.forEach((style) => {
    const [property, value] = style.split(':').map((s) => s.trim())
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      // 移除 rem 单位，因为模板中会自动添加
      styleObject[camelProperty] = value.replace('rem', '')
    }
  })

  return styleObject
}

// 处理配置对象中的样式
const processedOptions = computed(() => {
  const result = {}
  for (const [key, value] of Object.entries(options)) {
    result[key] = {
      up: {
        name: value.up.name,
        styles: parseStyleString(value.up.styles)
      },
      mid: {
        name: value.mid.name,
        styles: parseStyleString(value.mid.styles)
      },
      down: {
        name: value.down.name,
        styles: parseStyleString(value.down.styles)
      }
    }
  }
  return result
})
</script>

<style lang="scss" scoped>
.frame-wrap {
  position: relative;

  .title {
    width: 5.49rem;
    height: 0.8rem;
    flex-shrink: 0;

    position: absolute;
    top: 0.16rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;

    display: flex;
    justify-content: center;
    align-items: center;

    span {
      color: #fff;
      text-align: center;
      font-family: 'SF UI Text';
      font-size: 0.28rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.3rem; /* 107.143% */
    }
  }
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
    }
  }
}
</style>
