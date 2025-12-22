<template>
    <div class="rank" :class="{ coming: status === -1 }">
        <TabSub :tabsConfig="tabsConfig" v-model="activeTab" class="tabs" />
        <RankFrame style="margin-top: .05rem;">
            <div class="content">
                <TimeLeft :timeLeft="timeLeft" />
                <ScrollList 
                    :api="rankConfig[activeTab].api"
                    :apiParams="params"
                    @getPageInfo="getPageInfo"
                >
                    <template #default="{ list, status }">
                        <Top3 
                            :list="list.slice(0, 3)" 
                            class="top3"
                            :status="status"
                        />
                        <NormalRankItem
                            v-for="(item, idx) in list.slice(3)"
                            :key="idx"
                            :item="item"
                            :status="status"
                            :rank="idx + 4"
                        />
                    </template>
                    <template #footer="{ userInfo }">
                        <FooterUser :userInfo="userInfo" :isDailyRank="false" />
                    </template>
                </ScrollList>
            </div>
        </RankFrame>
    </div>
</template>

<script lang="ts" setup>
import RankFrame from '../common/RankFrame.vue';
import TabSub from '../components/Tab/TabSub.vue';
import ScrollList from '../components/ScrollList.vue';
import TimeLeft from '../components/TimeLeft.vue';
import Top3 from '../components/RankList/Top3.vue';
import NormalRankItem from '../components/RankList/NormalRankItem.vue';
import FooterUser from '../components/RankList/FooterUser.vue';
import { config } from '../config';
import injectTool from '@publicComponents/injectTool';

const { TOOL_BPFunc } = injectTool();

const activeTab = ref(1);
watch(activeTab, (newVal) => {
    // 埋点上报
    TOOL_BPFunc({ desc: `pvuv_show_rank_${newVal === 1 ? 'vj' : 'user'}`, type: 'show' });
}, { immediate: true })

const tabsConfig = [
    { labelIndex: 60, value: 1 },
    { labelIndex: 61, value: 2 },
]

const timeLeft = ref(0);
const status = ref(-1);

const rankConfig = {
    1: { api: '/api/activity/commonBusiness/anchorTotalRank' },
    2: { api: '/api/activity/commonBusiness/userTotalRank' }
}

const params = computed(() => {
    return {
        activityId: config.activityId,
    }
})

const getPageInfo = (pageInfo) => {
    timeLeft.value = pageInfo.timeLeft ?? 0;
    status.value = pageInfo.status ?? -1;
}

</script>

<style lang="scss" scoped>
.rank {
    padding-bottom: 1rem;
    .tabs {
        margin-top: .18rem;
    }
    .content {
        margin-top: .05rem;
        padding: .84rem 0 .66rem;
        .top3 {
            margin-top: .45rem;
        }
    }
}

.coming {
    :deep(.rank-down) {
        margin-top: -.82rem !important;
    }
}
</style>