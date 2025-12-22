<template>
    <div class="date_select">
        <div v-if="opening" @click="opening = false" class="overlay"></div>
        <div class="current" @click.stop="opening = !opening">
            <div class="date">{{ props.modelValue ? getFormatDate(dateList[props.modelValue - 1]) : '--' }}</div>
            <svg class="arrow" :class="{ active: opening }" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.933 23.5281C15.1781 24.3211 13.9071 24.3014 13.1772 23.4852L2.79448 11.8749C1.71425 10.6669 2.57163 8.75 4.19213 8.75L25.6266 8.75C27.2748 8.75 28.1211 10.7239 26.9847 11.9178L15.933 23.5281Z" fill="#FFEA7F"/>
            </svg>
        </div>
        <div v-if="opening" class="date_list">
            <div 
                v-for="date, index in dateList" 
                :key="date" 
                class="date_item" 
                :class="{ active: props.modelValue === index + 1 }"
                @click.stop="updateDate(date, index)"
            >
                {{ getFormatDate(date) }}
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool';
import { config } from '../config';
import dayjs from 'dayjs';

const { TOOL_httpClient, TOOL_loading, TOOL_countryCode } = injectTool();

const props = defineProps<{
    modelValue?: number
}>();

const emits = defineEmits<{
    (e: 'update:modelValue', value: number): void
    (e: 'updateDate', date: string): void
}>();

const dateList = ref([]);

const opening = ref(false);

const getDateInfo = () => {
    console.log("获取日期");
    TOOL_loading();
    TOOL_httpClient({
        url: '/api/activity/commonBusiness/getActivityTimeRangeDates',
        params: {
            activityId: config.activityId
        }
    }).then(response => {
        const { data, errorCode, errorMsg } = response.data;
        if (errorCode !== 0) throw new Error(errorMsg);

        console.log("日期", data);
        dateList.value = data ?? [];
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        TOOL_loading(false);
    });
}

getDateInfo();

const getFormatDate = (date: string) => {
    return dayjs(date).format(['MY', 'ID'].includes(TOOL_countryCode) ? 'DD/MM' : 'MM/DD');
}

const updateDate = (date: string, index: number) => {
    emits('update:modelValue', index + 1);
    opening.value = false;
    emits('updateDate', date);
}

</script>
<style lang="scss" scoped>
@import '../scss/public_mixin.scss';

.date_select {
    width: max-content;
    .overlay {
        display: block;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20;
        // background: rgba(0, 0, 0, 0.5);
    }
    .current {
        width: 1.76rem;
        height: .68rem;
        @extend %fc;
        gap: .04rem;
        @include bg('date_bg');
        position: relative;
        z-index: 21;
        .date {
            color: #FFEA7F;
            text-align: center;
            font-family: Arial;
            font-size: 0.24rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.34rem; /* 141.667% */
            letter-spacing: -0.001rem;
        }
        .arrow {
            width: .3rem;
            height: .3rem;
            &.active {
                transform: rotateZ(180deg);
            }
        }
    }
    .date_list {
        width: 1.76rem;
        border-radius: .16rem;
        border: .01rem solid #FF8D1C;
        background: rgba(208, 72, 34, .96);
        position: absolute;
        z-index: 22;
        .date_item {
            width: 1.38rem;
            height: .72rem;
            margin: auto;
            @extend %fc;
            border-bottom: 1px solid rgba(131, 48, 0, .6);
            color: rgba(255, 234, 127, .5);
            text-align: center;
            // font-family: "SF UI Text";
            font-size: 0.32rem;
            font-style: normal;
            font-weight: 400;
            line-height: 0.48rem;
            &.active {
                color: #FFEA7F;
                // font-weight: 700;
            }
        }
    }
}
</style>