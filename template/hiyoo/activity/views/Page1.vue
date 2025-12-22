<template>
  <div class="page1-wrap"></div>
</template>

<script lang="ts" setup name="page1">
import injectTool from '@publicComponents/injectTool'

const ossUrl = inject('ossUrl')
const activityId = inject('activityId')
const {
  TOOL_BPFunc,
  TOOL_countryCode,
  TOOL_TEXT,
  TOOL_loading,
  TOOL_httpClient,
  TOOL_toast,
  TOOL_NUM
} = injectTool()
</script>

<style lang="scss" scoped>
.page1-wrap {
  margin-top: 0.32rem;
  min-height: 6rem;
}
</style>
