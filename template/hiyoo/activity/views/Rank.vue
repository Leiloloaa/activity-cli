<template>
  <div class="rank">
    <TabsRank v-model="rankType" />
    <router-view />
  </div>
</template>

<script lang="ts" setup name="Rank">
import injectTool from '@publicComponents/injectTool'

const { TOOL_TEXT } = injectTool()

const rankType = ref(0) // 0 送礼榜 1 收礼榜 2欢迎榜 3 CP榜...
</script>

<style lang="scss" scoped>
.rank {
}
</style>
