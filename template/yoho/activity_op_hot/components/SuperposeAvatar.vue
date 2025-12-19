<script lang="ts">
import { defineComponent, h } from 'vue'
import injectTool from '@publicComponents/injectTool'

export default defineComponent({
  name: 'SuperposeAvatar',
  components: {},
  props: {
    overlap: {
      // 重叠部分边距,单位rem
      type: Number,
      default: 0.58
    },
    priorityLevel: {
      // 层级优先级
      // 第二个压住第一个则为 true 反之则为 false
      type: Boolean,
      default: false
    }
  },
  setup(props, content) {
    const { TOOL_countryCode } = injectTool()

    // 包装类函数，解决响应式问题
    const wrapFun = (vNodeList) => {
      const children = vNodeList[0].children
      const len = children.length
      vNodeList[0] = children.map((item, idx) => {
        const vnode: any = h('div', {}, item)
        if (idx !== 0) {
          if (TOOL_countryCode == 'EG') {
            vnode.props.style =
              'margin-right:-' +
              props.overlap +
              'rem' +
              `;z-index:${props.priorityLevel ? 100 - idx : idx}`
          } else {
            vnode.props.style =
              'margin-left:-' +
              props.overlap +
              'rem' +
              `;z-index:${props.priorityLevel ? 100 - idx : idx}`
          }
        } else {
          vnode.props.style = `z-index:${props.priorityLevel ? 100 - idx : idx}`
        }
        return vnode
      })
      return vNodeList
    }

    return { TOOL_countryCode, wrapFun }
  },
  render() {
    const slots: any = this.$slots
    return h(
      'div',
      { class: ['superpose-avatar', this.TOOL_countryCode] },
      this.wrapFun(slots.default())
    )
  }
})
</script>

<style lang="scss">
.superpose-avatar {
  display: flex;
  &.EG {
    direction: rtl;
  }
}
</style>
