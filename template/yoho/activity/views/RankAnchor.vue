<template>
  <div class="rank-view-wrap">
    <FixedTop>
      <TabsDate v-model="dayTotal" />
      <SlotDateAvatar
        v-if="dayTotal == 0"
        :api="tempConfig.top1Url"
        :apiParams="{ activityId }"
        v-model="selDate"
      />
    </FixedTop>

    <RankTemplate
      frameType="rank"
      :dayTotal="dayTotal"
      :selDate="selDate"
      :url="tempConfig.url"
      :params="tempConfig.params"
      :top1Url="tempConfig.top1Url"
      :infoText="tempConfig.infoText"
      paddingBottom="0.72rem"
    ></RankTemplate>
  </div>
</template>

<script lang="ts" setup>
import RankTemplate from '../../components/Base/RankTemplate.vue'
import { useRankPage } from './SuperRank/useRankPage'

// 使用通用榜单页面逻辑
const { dayTotal, selDate, tempConfig, activityId } = useRankPage('RankAnchor')
</script>

<style lang="scss" scoped>
.rank-view-wrap {
  min-height: 6rem; // 不需要可以移除，主要目的是防止切换路由时高度变化
}
</style>
