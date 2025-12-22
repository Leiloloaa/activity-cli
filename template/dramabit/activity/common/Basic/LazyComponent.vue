<!-- 荣耀勋章组件 -->
<template>
  <template v-if="lazy">
    <lazy-component>
      <slot />
    </lazy-component>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script lang="ts" setup name="LazyComponent">
const props = defineProps({
  lazy: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped></style>
