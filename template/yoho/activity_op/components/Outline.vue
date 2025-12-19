<!-- 描边组件示例 -->
<!--
  <Outline
    :color="1 ? '0.05rem #9CFFFB' : '0.025rem #FFFB9C'"
    :text="1"
  />
-->

<script lang="ts">
export default defineComponent({
  name: 'Outline',
  components: {},
  props: {
    color: {
      type: String,
      default: '0.05rem #f40'
    },
    text: {
      type: [String, Number],
      default: '---'
    },
    noColor: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const cur: any = getCurrentInstance()
    const isOverflow = cur?.attrs?.class?.split(' ').find((item) => item == 'ov' || item == 'ow')
    const o = isOverflow ? 'hidden' : 'visible'
    const t = isOverflow ? 'ellipsis' : 'clip'
    const w = isOverflow ? 'nowrap' : 'normal'
    return { o, t, w, ...toRefs(props) }
  },
  render() {
    return (
      this.text !== null &&
      this.text !== undefined &&
      h('span', { class: this.noColor ? '' : 'text-outline', 'data-text': this.text }, this.text)
    )
  }
})
</script>

<style lang="scss" scoped>

.text-outline {
  position: relative;
  z-index: 1;
  display: inline-block;
  -webkit-text-stroke-width: 0 !important;
  -webkit-text-stroke-color: unset !important;
  
  &::before {
    content: attr(data-text);
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    z-index: -1;
    -webkit-text-stroke: v-bind(color);
    text-stroke: v-bind(color);
    overflow: v-bind(o);
    text-overflow: v-bind(t);
    white-space: v-bind(w);
  }
}
</style>
