<!--
  "间隙组件": {
  "scope": "html",
  "prefix": "space",
  "body": [
  "<Space :val=\"$1\" />"
],
  "description": "间隙组件引入"
},
-->
<template>
  <div class="space-wrap" :style="{
    width: Number(val) <= 0 ? '0rem' : val + 'rem',
    'margin-left': Number(val) < 0 ? Number(val) / 2 + 'rem' : '',
    'margin-right': Number(val) < 0 ? Number(val) / 2 + 'rem' : '',
    height: h && Number(val) > 0 ? val + 'rem' : '0rem'
  }"></div>
</template>

<script lang="ts" setup>
interface spaceType {
  val: number | string
  h?: boolean
}

withDefaults(defineProps<spaceType>(), {
  val: 0,
  h: false
})
</script>

<style lang="scss" scoped>
</style>
