<template>
    <div class="user">
        <div class="rank">
            <OssImg v-if="rank <= 3" :src="`icon_rank_${rank}`" tag="img" />
            <template v-else>{{ rank }}</template>
        </div>
        <div class="avatar_wrap">
            <OptAvatar 
                class="avatar"
                :data="item"
                :option="{
                    w: 1.43,
                    h: 1.43,
                    adorns: [
                        {
                            img: 'frame',
                            w: '1.43rem',
                            h: '1.43rem'
                        }
                    ],
                    avatar: {
                        top: 0.18,
                        w: 1,
                        h: 1
                    },
                    live: {
                        display: 'none'
                    }
                }"
            />
            <div 
                v-if="!item.isFollowed" 
                class="follow_wrap"
                @click="follow(item)"
            >
                <div v-animate  class="follow_btn">
                    {{ TOOL_TEXT[45] }}
                </div>
            </div>
        </div>
        <div class="center">
            <div class="name oe">{{ item.name }}</div>
            <Score :score="Number(item?.score ?? 0)" class="score" />
        </div>
        <div 
            v-animate 
            class="btn" 
            :class="{ disabled: status !== 1 }"
            @click="handleBtn"
        >
            {{ TOOL_TEXT[status === 1 ? 46 : 47] }}
        </div>
        <OssImg v-if="status === 0 && item.stamp" src="stamp" tag="img" class="stamp" />
    </div>
</template>

<script lang="ts" setup>
import type { InfoType } from '../../types/rank';
import OptAvatar from '../OptAvatar.vue';
import Score from './components/Score.vue';
import injectTool from '@publicComponents/injectTool';

const props = defineProps<{ item: InfoType; rank: number; status: number }>();
const emit = defineEmits<{(e: 'clickBtn', item: InfoType): void}>();

const { TOOL_TEXT, TOOL_httpClient, TOOL_loading } = injectTool();

const handleBtn = () => {
    if (props?.status === 1) {
        emit('clickBtn', props.item);
    }
}


const follow = (user?: InfoType) => {
    if (!user?.uid) return;
    TOOL_loading();
    TOOL_httpClient({
        method: 'POST',
        url: '/api/activity/halloween2025/follow',
        params: { toUid: user.uid }
    }).then(res => {
        const { data } = res.data;
        user.isFollowed = data === true;
    }).catch(err => {
        console.error(err);
        user.isFollowed = false;
    }).finally(() => {
        TOOL_loading(false);
    })
}

</script>

<style lang="scss" scoped>
@import '../../scss/public_mixin.scss';
.user {
    @extend %fc;
    position: relative;
    height: 1.58rem;
    &::after {
        content: '';
        display: block;
        width: 5.68rem;
        height: .01rem;
        background: #712834;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }
    .rank {
        @extend %fc;
        width: .6rem;
        height: .6rem;
        color: #FFEEDE;
        text-align: center;
        // font-family: "SF UI Text";
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        img {
            width: 100%;
            height: 100%;
        }
    }
    .avatar_wrap {
        margin-inline: .14rem;
        position: relative;
        .follow_wrap {
            position: absolute;
            bottom: .09rem;
            left: 50%;
            transform: translateX(-50%);
            .follow_btn {
                @extend %fc;
                min-width: 0.7rem;
                padding-inline: .11rem;
                height: 0.38rem;
                border-radius: 0.21rem;
                border: .01rem solid #FFE660;
                background: linear-gradient(226deg, #00D6B9 0%, #90F 90.82%);
                white-space: nowrap;
    
                color: #FFEA7F;
                text-align: center;
                // font-family: "SF UI Text";
                font-size: 0.24rem;
                font-style: normal;
                font-weight: 500;
                line-height: 0.3rem; /* 125% */
            }
        }
    }
    .center {
        color: #FF6A39;
        margin-inline-end: .1rem;
        .name {
            width: 100%;
            width: 1.82rem;
            @extend %oe;
            /* 内文 */
            font-family: Arial;
            font-size: 0.24rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.3rem; /* 125% */
        }
        .score {
            margin-top: .12rem;
        }
    }
    .btn {
        width: 1.62rem;
        height: .6rem;
        @include bg('btn_get');
        @extend %fc;
        color: #FFEA7F;
        text-align: center;
        // font-family: "SF UI Text";
        font-size: 0.28rem;
        font-style: normal;
        font-weight: 500;
        line-height: 1;
        &.disabled {
            opacity: .5;
        }
    }

    .stamp {
        width: 1.66rem;
        height: 1rem;
        position: absolute;
        top: -.25rem;
        right: -.9rem;
    }
}

#ID .user {
    .btn {
        font-size: .24rem;
    }
}
</style>