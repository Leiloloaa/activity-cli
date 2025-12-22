<template>
    <OssImg :src="`reward_bg${!title ? '_small' : ''}`" class="reward_item fc" :class="{ small, big, no_title: !title }">
        <div class="img_wrap">
            <cdnImg v-if="img" :fid="img" class="img" />
        </div>
        <!-- <OssImg :src="img" tag="img" /> -->
        <div v-if="!!title" v-marquee class="title">{{ title }}</div>
    </OssImg>
</template>

<script lang="ts" setup>
defineProps<{ img?: string, title?: string | null, small?: boolean, big?: boolean, isOss?: boolean }>();
</script>

<style lang="scss" scoped>
.reward_item {
    width: 1.68rem;
    height: 1.88rem;
    flex-direction: column;
    .img_wrap {
        width: 1.2rem;
        height: 1.2rem;
        .img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
    .title {
        width: 80%;
        color: #FFEA7F;
        text-align: center;
        font-family: Arial;
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
    }
    &.small {
        width: .99rem;
        height: 1.16rem;
        .img_wrap {
            width: .73rem;
            height: .76rem;
        }
        .title {
            font-size: .14rem;
            line-height: .187rem;
        }
    }
    &.big {
        width: 2.42rem;
        height: 2.72rem;
        .img_wrap {
            width: 1.78rem;
            height: 1.78rem;
        }
        .title {
            font-size: .34rem;
            line-height: .46rem;
        }
    }

    &.no_title {
        height: 1.68rem;
    }
}
</style>