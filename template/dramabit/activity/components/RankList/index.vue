<template>
    <div class="rank_list">
        <ScrollList 
            :api 
            :apiParams
        >
            <template #default="{ list, status }">
                <Top3 
                    v-if="props.type === 'rank'"
                    :list="list.slice(0, 3)"
                    :status="status"
                />
                <Component
                    :is="props.type === 'rank' ? NormalRankItem : FollowRankItem"
                    v-for="(item, idx) in props.type === 'rank' ? list.slice(3) : list"
                    :key="idx"
                    :item="item"
                    :status="status"
                    :rank="idx + (props.type === 'rank' ? 3 : 1)"
                />
            </template>
        </ScrollList>
    </div>
</template>

<script lang="ts" setup>
import ScrollList from '../ScrollList.vue';

import NormalRankItem from './FollowRankItem.vue';
import FollowRankItem from './FollowRankItem.vue';
import Top3 from './Top3.vue';

const props = withDefaults(defineProps<{
    type?: 'rank' | 'follow'
    api: string;
    apiParams: object;
    footerApi?: string;
}>(), {
    type: 'rank',
});

</script>

<style lang="scss" scoped>

</style>