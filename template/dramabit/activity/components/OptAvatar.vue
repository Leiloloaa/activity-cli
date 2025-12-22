<!--
  外部使用示例，option用于构造样式
  例1:
  <OptAvatar
    :data="pageInfo.userInfo"
    :option="{
      w: 1.06,
      h: 1.02,
      adorns: [
        {
          img: 'avatar',
          w: '100%',
          h: '100%'
        }
      ],
      avatar: {
        top: 0.14,
        w: 0.795,
        h: 0.795
      },
      live: {
        display: 'none'
      }
    }"
  />
  例2:
  <OptAvatar :data="list[item]" :type="item + 1"></OptAvatar>
-->

<template>
  <div class="avatar-wrap">
    <div
      class="avatar"
      v-jump="data"
      :class="[type, `ava-${type}`]"
      :style="{ width: option.w, height: option.h }"
    >
      <cdnImg v-if="data?.avatar || data?.fid" class="avatar-img" :fid="data?.avatar || data?.fid" :style="option?.avatar" />
      <OssImg v-else tag="img" class="avatar-img" src="sofa" :style="option?.avatar" />
      <img
        v-for="adorn in option.adorns"
        v-lazyload.webp="adorn?.img.startsWith('http') ? adorn?.img : `${imgUrl}/${adorn?.img}.png`"
        :style="adorn?.style"
        alt=""
      />
      <div class="live_wrap" v-if="data?.liveStatus == 1" :style="option?.live">
        <img src="//image.waka.media/static/icon/liveIcon.png" class="live" :style="option?.liveIcon" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface IData {
  avatar?: string | number
  fid?: string | number
  liveStatus?: string | number
}

interface IAvatar {
  data: IData
  type?: any // 可以是数字、字符串、枚举值
  option?: any
}

type NumStr = number | string

interface IStyle {
  img?: string
  w?: NumStr
  h?: NumStr
  top?: NumStr
  left?: NumStr
  bottom?: NumStr
  right?: NumStr
  zIndex?: string
  width: string
  height: string
  position: string
  style?: string
}

interface IOption {
  w: NumStr
  h: NumStr
  adorns: Array<IStyle>
  avatar: IStyle
  liveIcon?: IStyle
  live?: IStyle
}

const props = withDefaults(defineProps<IAvatar>(), {
  type: '',
  data: () => ({})
})

const imgUrl = inject('imgUrl')

// 通用配置项

const turnStyle = (opt) => {
  //  所以标签都是绝对定位
  const style: IStyle = {
    width: '',
    height: '',
    position: 'absolute'
  }
  //   字符串默认使用其key和val，数字需要进行转换rem
  for (let key in opt) {
    let val = opt[key]
    val = typeof val == 'number' ? `${val}rem` : val
    if (key == 'w') {
      style.width = val
    } else if (key == 'h') {
      style.height = val
    } else {
      style[key] = val
    }
  }
  return style
}

const normalizeOpt = (option) => {
  const optObj = Object.assign({}, commonOpt, option)
  for (const optKey in optObj) {
    if (optKey == 'adorns') {
      optObj[optKey] = optObj[optKey].map((item) => {
        const copyItem = { ...item }
        delete copyItem.img
        item.style = turnStyle(copyItem)
        return item
      })
    } else if (optKey == 'w' || optKey == 'h') {
      let val = optObj[optKey]
      val = typeof val == 'number' ? `${val}rem` : val
      optObj[optKey] = val
    } else {
      optObj[optKey] = turnStyle(optObj[optKey])
    }
  }
  return optObj
}

const commonOpt = {
  live: {
    w: 0.4,
    h: 0.24,
    bottom: .1
  },
  liveIcon: {
    w: 0.2
  },
  avatar: {
    w: 1.4,
    h: 1.4
  }
}

let option = {
  w: 1.4,
  h: 1.34,
  adorns: [
    {
      img: 'frame',
      w: '100%',
      h: '100%'
    }
  ],
  avatar: {
    top: 0.19,
    w: 1.05,
    h: 1.05
  }
}

// !!!在此处添加type对应的option对象
const optDict = {
  option,
  option1: Object.assign({}, option, {
    w: 1.6,
    h: 1.6,
    adorns: [
      { img: 'avatar1', w: '100%', h: '100%' },
      {
        img: 'cap-1',
        width: 1.325,
        height: 1.325,
        top: -0.59,
        right: -0.36
      }
    ]
  }),
  option2: Object.assign({}, option, {
    w: 1.6,
    h: 1.6,
    adorns: [
      { img: 'avatar2', w: '100%', h: '100%' },
      {
        img: 'cap-2',
        width: 1.325,
        height: 1.325,
        top: -0.59,
        right: -0.36
      }
    ],
    avatar: {
      w: 1.2,
      h: 1.2
    }
  }),
  option3: Object.assign({}, option, {
    w: 1.6,
    h: 1.6,
    adorns: [
      { img: 'avatar3', w: '100%', h: '100%' },
      {
        img: 'cap-3',
        width: 1.325,
        height: 1.325,
        top: -0.59,
        right: -0.36
      }
    ],
    avatar: {
      w: 1.2,
      h: 1.2
    }
  })
}

// 序列化option的选项
option = normalizeOpt(props.option || optDict[`option${props.type}`])
// console.log((option))

// console.log('props.option', props)
</script>

<style lang="scss" scoped>
@import '../scss/public_mixin.scss';
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  .avatar-img {
    border-radius: 50%;
  }
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    .live_wrap {
      @include bg('live');
      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;
      border-radius: 0.12rem;
      border: 1px solid #FFE660;
      background: linear-gradient(226deg, #00D6B9 0%, #90F 90.82%);
      @extend %fc;
      .live {
          width: .2rem;
          height: .2rem;
          object-fit: contain;
      }
    }
  }
}
</style>
