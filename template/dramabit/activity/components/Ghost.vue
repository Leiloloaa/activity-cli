<template>
    <div class="ghost" :class="{ 'show_light': isShowLight }">
        <OssImg src="ghost_animation_small" class="ghost_img" tag="img" />
        <OssImg v-if="isShowText" src="bubble" class="bubble">
            <div v-marquee class="text">{{ TOOL_TEXT[6] }}</div>
        </OssImg>
    </div>
</template>
<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'

const { TOOL_TEXT } = injectTool()

defineProps<{
    isShowText?: boolean;
    isShowLight?: boolean;
}>()
</script>
<style lang="scss" scoped>
@import '../scss/public_mixin.scss';
.ghost {
    position: relative;
    width: 1.42rem;
    height: 1.42rem;
    &.show_light {
        &::before {
            content: '';
            display: block;
            width: 1.42rem;
            height: 1.42rem;
            @include bg('ghost_light_v3');
            transform: translateX(-.1rem);
        }
    }
    &.rotating {
        .ghost_img {
            transform-origin: center center;
        }
    }
    &.rotating::before, &.in_home::before {
        display: none;
    }
    
    .ghost_img {
        position: absolute;
        top: 0;
        left: 0;
        width: 1.42rem;
        aspect-ratio: 1 / 1;
        // animation: ghostFloat 1s ease-in-out infinite alternate;
    }
    .bubble {
        width: 1.84rem;
        height: .77rem;
        position: absolute;
        top: -.66rem;
        left: -.92rem;
        .text {
            height: .6rem;
            width: 100%;
            @extend %fc;
            color: #FFEA7F;
            font-family: Arial;
            font-size: 0.24rem;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
        }
    }
}
</style>