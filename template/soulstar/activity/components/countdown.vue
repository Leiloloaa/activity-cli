<template>
    <div class="countdown">
        <div class="public_flex_center" v-if="copTimeText.length != 1">
            <!-- icon -->
            <!-- <uiImg n="xxxxx" /> -->
            <template v-if="copTimeText[0] > '0'">
                <p class="num">{{ copTimeText[0] }}</p>
                <p class="text day">day</p>
            </template>
            <p class="num">{{ copTimeText[1] }}</p>
            <p class="text">:</p>
            <p class="num">{{ copTimeText[2] }}</p>
            <p class="text">:</p>
            <p class="num">{{ copTimeText[3] }}</p>
        </div>
        <div class="public_flex_center" v-else>
            <p class="text">{{ copTimeText[0] }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { timeSplit } from '@library/activityPublic';

const props: {
    readonly timeLeft: number;
    readonly end: string;
} = defineProps({
    timeLeft: {
        type: Number,
        required: true,
        default: -99
    },
    end: {
        type: String,
        required: false,
        default: '- END -'
    }
});

let timeID: any = null;
let refTimeLeft = ref<number>(-99);
const fnTimeIdClear = (): void => clearInterval(timeID);

const copTimeText = computed(() => {
    if (refTimeLeft.value == 0) fnTimeIdClear();
    return timeSplit(refTimeLeft.value, props.end);
});

watch(() => props.timeLeft, (v) => {
    refTimeLeft.value = props.timeLeft;
    fnTimeIdClear();
    if (v > 0) {
        timeID = setInterval(() => (refTimeLeft.value -= 1000), 1000);
    }
}, { deep: true, immediate: true });

onBeforeUnmount(fnTimeIdClear);

</script>

<style lang='scss' scoped>
@use '../static/mixin.scss' as *;
.countdown {
    position: relative;

    p {
        color: black;

        &.num {
            // 
        }

        &.text {
            // 
        }
    }
}
</style>