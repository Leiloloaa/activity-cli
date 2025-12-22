<template>
    <div class="tab_sub">
        <div 
            v-for="item, index in tabsConfig" 
            :key="`${item.value}_${index}`"
            class="tab" 
            :class="{active: modelValue === item.value}"
            @click="emits('update:modelValue', item.value)"
        >
            <BorderText v-if="modelValue === item.value" :text="TOOL_TEXT[item.labelIndex]" />
            <div v-else class="tab_text">{{ TOOL_TEXT[item.labelIndex] }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import BorderText from "../BorderText.vue";
import injectTool from "@publicComponents/injectTool";
const { TOOL_TEXT } = injectTool();

type TValue = number | string;

const props = defineProps<{ 
    tabsConfig: { labelIndex: number, value: TValue }[]
    modelValue?: TValue
}>();

const emits = defineEmits<{
    (e: 'update:modelValue', value: TValue): void
}>();


</script>

<style lang="scss" scoped>
@import '../../scss/public_mixin.scss';

.tab_sub {
    @extend %fc;
    gap: .16rem;
    .tab {
        width: 2.34rem;
        height: 1.02rem;
        @include bg('tab');
        @extend %fc;
        padding: .06rem .1rem 0;
        .tab_text {
            text-align: center;
            color: #C95501;
            font-size: 0.3rem;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
        }
        &.active {
            @include bg('tab_active');
        }
    }
}

</style>

<style lang="scss">
#ID, #MY {
    .tab_sub {
        .tab {
            .tab_text {
                > div, > span {
                    font-size: .26rem!important;
                }
            }
        }
    }
}
</style>