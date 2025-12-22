<template>
    <div class="tabs tab_router">
        <OssImg src="tab_sub_bg" class="tabs_bg fc">
            <RouterLink 
                v-for="(tab, idx) in tabsConfig" 
                :key="`tabs_item_${idx}`" 
                :to="tab.path" 
                class="tab fc" 
                :class="{active: route.path === tab.path}"
                replace
            >
                <OssImg v-if="route.path === tab.path" :src="`tab_sub_${idx + 1}`" class="tab_bg fc">
                    <BorderText :text="TOOL_TEXT[tab.labelIndex]" />
                </OssImg>
                <div v-else class="tab_text">{{ TOOL_TEXT[tab.labelIndex] }}</div>
            </RouterLink>
        </OssImg>
    </div>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
// import TextStroke from '@activity-business/h5-package-textStroke';
import { useRoute } from 'vue-router';
import BorderText from "../BorderText.vue";
const { TOOL_TEXT } = injectTool();

defineProps<{ tabsConfig: { labelIndex: number, path: string }[] }>();
const route = useRoute();
</script>

<style lang="scss" scoped>
// @use '../../static/mixin.scss' as *;
.tabs {
    width: 6.77rem;
    height: 1.02rem;
    gap: .12rem;
    align-items: flex-end;
    padding: .16rem 0 0;
    .tabs_bg {
        width: 100%;
        height: .84rem;
    }
    .tab {
        width: 2.52rem;
        .tab_text {
            width: 100%;
            color: #C95501;
            text-align: center;
            text-align: center;
            // font-family: "SF UI Text";
            font-size: 0.32rem;
            font-style: normal;
            font-weight: 700;
            line-height: 1;
        }
        &.active {
            margin-top: -.16rem;
            .tab_bg {
                padding-top: .1rem;
                width: 2.52rem;
                height: 1.04rem;
                padding-inline: .2rem .3rem;
                :deep(>.oss-bg-img) {
                    object-fit: contain!important;
                }
            }
        }
    }
}
</style>

<style lang="scss">
#TW {
    .tab_router {
        .tab {
            .tab_text {
                width: 80%;
            }
            &.active {
                .tab_bg {
                    padding-inline: 0.3rem 0.5rem;
                    div, span {
                        font-size: .3rem;
                    }
                }
            }
        }
    }
}
#ID, #MY {
    .tab_router {
        .tab {
            .tab_text {
                width: 80%;
                font-size: .24rem;
            }
            &.active {
                .tab_bg {
                    padding-inline: 0.3rem 0.5rem;
                    div, span {
                        font-size: .26rem;
                    }
                }
            }
        }
    }
}

</style>