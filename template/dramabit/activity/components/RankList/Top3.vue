<template>
  <div class="top3">
    <div
      v-for="idx in [1, 0, 2]"
      :key="idx"
      class="user"
      :class="`top_${idx + 1}`"
    >
      <div class="avatar_wrap">
        <Avatar
          :style="{ pointerEvents: disableJump ? 'none' : 'unset' }"
          class="avatar"
          :data="getAvatarData(list?.[idx])"
          :type="idx === 0 ? 'a392p50' : 'a216p62'"
          :option="{
            live: true,
            jump: !disableJump,
            radius: true,
          }"
          :pic="{ frame: `a${idx + 1}` }"
          :styleConfig="{ live: { bottom: idx === 0 ? '0.6rem' : '0.3rem' } }"
        />
        <!-- 国旗标识 -->
        <OssImg
          v-if="!hideFlag && shouldShowFlag(list[idx])"
          :src="`flag-${list[idx]?.country}`"
          tag="img"
          :class="['country-flag', idx === 0 ? 'flag-large' : 'flag-small']"
        />
        <OssImg
          v-if="shouldShowStamp(list[idx])"
          :src="`stamp`"
          tag="img"
          class="winner"
          :class="['winner-' + idx]"
        />
        <!-- 关注按钮 -->
      </div>
      <div class="info">
        <div class="name_wrap">
          <Outline
            class="name ov"
            :color="1 ? `0.05rem #FFFDD0` : `0.05rem #581604`"
            :text="getDisplayName(list[idx]) || '---'"
          />
          <!-- 公会榜：打开成员榜单 -->
          <div
            v-if="isGuildRank"
            class="member-btn"
            @click="openMemberRank(list[idx])"
          ></div>
          <!-- 普通榜：关注按钮 -->
          <div
            v-else-if="!list[idx]?.isFollowed && !list[idx]?.isMe"
            class="add"
            @click="follow(list[idx])"
          ></div>
        </div>
        <Score :score="list[idx]?.score ?? '--'" class="score" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Avatar from "./Avatar.vue";
import { InfoType } from "../../types/rank";
import Score from "./components/Score.vue";
import injectTool from "@publicComponents/injectTool";

const props = defineProps<{
  list: InfoType[];
  status: number;
  activityId?: number | string;
  isGuildRank?: boolean;
  otherParam?: string;
  disableJump?: boolean; // 禁用头像点击跳转
  hideFlag?: boolean; // 隐藏国旗显示
}>();

const emit = defineEmits<{
  (e: "openMemberRank", item: InfoType): void;
}>();

const { TOOL_httpClient, TOOL_loading } = injectTool();

// 获取头像数据 - 公会榜使用公会头像，普通榜使用用户头像
const getAvatarData = (item?: InfoType) => {
  if (!item) return {};
  if (props.isGuildRank) {
    // 公会榜：使用 unionIcon 作为头像，并移除可能触发跳转的字段
    return {
      avatar: props.isGuildRank ? item.unionIcon : item.avatar,
      // 不传递 uid 等会触发跳转的字段
    };
  }
  return item;
};

// 获取显示名称 - 公会榜使用公会名称，普通榜使用用户名称
const getDisplayName = (item?: InfoType) => {
  if (!item) return "";
  return props.isGuildRank ? item.unionName : item.name;
};

// 判断是否显示国旗 - 仅支持 ID, SG, TW, MY
const shouldShowFlag = (item?: InfoType) => {
  if (!item?.country) return false;
  const supportedCountries = ["ID", "SG", "TW", "MY"];
  return supportedCountries.includes(item.country);
};

// 判断是否显示盖戳
// 规则：
// 1. 第一周榜单（"1,1"）结束后TOP10盖戳
// 2. 第二周榜单（"1,2"）结束后TOP10盖戳
// 3. 阶段一总榜（"1"）结束后不盖戳
// 4. 混区赛（"2"）结束后TOP10盖戳
const shouldShowStamp = (item?: InfoType) => {
  if (!item?.stamp) return false;
  if (props.status !== 0) return false; // 活动未结束不显示
  if (props.otherParam === "1") return false; // 阶段一总榜不盖戳
  return true;
};

const openMemberRank = (guild?: InfoType) => {
  if (guild) {
    emit("openMemberRank", guild);
  }
};

const follow = (user?: InfoType) => {
  if (!user?.uid || user.isFollowed) return;
  TOOL_loading();
  TOOL_httpClient({
    method: "POST",
    url: "/api/activity/commonBusiness/followUser",
    params: {
      toUid: user.uid,
      activityId: props.activityId,
    },
  })
    .then((res) => {
      // 返回200表示关注成功
      if (res.status === 200 || res.data?.code === 200) {
        user.isFollowed = true;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      TOOL_loading(false);
    });
};
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin.scss";
.top3 {
  @extend %fc;
  align-items: flex-start;
  position: relative;

  .user {
    @extend %fc;
    flex-direction: column;
    position: relative;

    .avatar_wrap {
      position: relative;

      .country-flag {
        position: absolute;
        object-fit: contain;
        z-index: 4;
        width: 0.48rem;
        height: 0.32rem;
        right: 0.29rem;
        bottom: 0.2rem;
        border-radius: 0.04rem;
        &.flag-large {
          right: 1.12rem;
          bottom: 0.56rem;
        }
      }

      .winner {
        width: 2.28rem;
        height: 1.86rem;
        object-fit: contain;
        position: absolute;
        top: -0.12rem;
        left: 0.65rem;
        z-index: 2;
        &.winner-1 {
          top: -0.12rem;
          left: -0.65rem;
        }
        &.winner-0 {
          top: 0.19rem;
          left: 1.28rem;
        }
      }

      .add {
        width: 0.48rem;
        height: 0.48rem;
        @include bg("add");
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 20;
        cursor: pointer;
      }
    }

    .info {
      // margin-top: 0.12rem;
    }

    .name_wrap {
      @extend %fc;
      gap: 0.04rem;

      .name {
        width: 1.4rem;
        color: #a92a00;
        text-align: center;
        font-family: Arial;
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.32rem; /* 133.333% */
      }

      .add {
        width: 0.28rem;
        height: 0.28rem;
        flex-shrink: 0;
        @include bg("add");
        cursor: pointer;
        z-index: 20;
        position: relative;
      }

      .member-btn {
        width: 0.28rem;
        height: 0.28rem;
        flex-shrink: 0;
        @include bg("1-4");
        cursor: pointer;
        position: relative;
        z-index: 10;

        &:active {
          @include bg("1-4-a");
        }
      }
    }

    .score {
      margin-top: 0.08rem;
      width: 2rem;
      height: 0.4rem;
      @include bg("score");
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fffdd0;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.4rem; /* 133.333% */
    }

    // 第1名（中间，最大）
    &.top_1 {
      margin: -0.5rem;
      margin-top: 0rem;
      z-index: 3;
      .info {
        z-index: 5;
        margin-top: -0.4rem;
      }

      // .name_wrap .name {
      //   max-width: 1.6rem;
      // }
    }

    // 第2、3名
    &.top_2,
    &.top_3 {
      margin-top: 1.43rem;
    }
  }
}
</style>
