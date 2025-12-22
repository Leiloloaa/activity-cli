<template>
    <div v-if="tag === 'div'" class="oss-bg">
        <OssCdnImg :src="ossSrc" class="oss-bg-img" :style="{ zIndex: index }" :key="ossSrc" v-if="props.src" />
        <slot></slot>
    </div>
    <OssCdnImg v-else :src="ossSrc" :key="ossSrc" />
</template>

<script lang="ts" setup name="OssImg">
import OssCdnImg from "./OssCdnImg";
/**
 * 组件属性定义
 * @property {string} src    - 图片资源名或完整路径（如 'rule' 或 'rule.png'）
 * @property {string} suffix - 图片后缀，默认 'png'
 * @property {string} tag    - 渲染模式，'div' 为背景图模式，其他为图片模式
 */
const props = defineProps({
    src: {
        type: String,
        default: ''
    },
    suffix: {
        type: String,
        default: 'png'
    },
    tag: {
        type: String,
        default: 'div'
    },
    index: { // 层级
        type: [Number, String],
        default: -1
    }
})

// 计算最终的图片地址：如果 src 已包含后缀则直接使用，否则自动拼接后缀
const ossSrc = computed(() => {
    return props.src.includes('.') ? props.src : (props.src + '.' + props.suffix)
})
</script>

<style lang="scss" scoped>
// 背景模式样式
.oss-bg {
    position: relative;

    .oss-bg-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
    }
}
</style>