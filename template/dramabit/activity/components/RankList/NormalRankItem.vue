<template>
  <div
    class="user"
    :class="{
      'is-top3': isTop3,
      [`top-${rank}`]: isTop3,
      'is-footer-user': isFooterUser,
    }"
  >
    <div class="rank">
      <span>{{ rank }}</span>
    </div>
    <div class="avatar_wrap">
      <Avatar
        :style="{ pointerEvents: disableJump ? 'none' : 'unset' }"
        class="avatar"
        :data="getAvatarData()"
        type="a143p80"
        :option="{ live: true, jump: !disableJump, radius: true }"
        :pic="{ frame: 'a' }"
      />
      <!-- 国旗标识 -->
      <OssImg
        v-if="!hideFlag && shouldShowFlag()"
        :src="`flag-${item?.country}`"
        tag="img"
        class="country-flag"
      />
    </div>
    <div class="center">
      <div class="name oe">{{ getDisplayName() }}</div>
      <Score :score="Number(item?.score ?? 0)" class="score" />
    </div>
    <div class="right">
      <!-- 公会榜：打开成员榜单 -->
      <div v-if="isGuildRank" class="member-btn" @click="openMemberRank"></div>
      <!-- 普通榜：关注按钮 -->
      <div
        v-else-if="!item.isFollowed && !item.isMe"
        class="add"
        @click="follow(item)"
      ></div>
    </div>
    <OssImg v-if="shouldShowStamp()" src="stamp" tag="img" class="stamp" />
  </div>
</template>

<script lang="ts" setup>
import type { InfoType } from "../../types/rank";
import Avatar from "./Avatar.vue";
import Score from "./components/Score.vue";
import injectTool from "@publicComponents/injectTool";

const props = defineProps<{
  item: InfoType;
  rank: number | string;
  status: number;
  inFooter?: boolean;
  isDailyRank?: boolean;
  isTop3?: boolean;
  isFooterUser?: boolean;
  activityId?: number | string;
  isGuildRank?: boolean;
  otherParam?: string;
  disableJump?: boolean; // 禁用头像点击跳转
  hideFlag?: boolean; // 隐藏国旗显示
}>();

const emit = defineEmits<{
  (e: "openMemberRank", item: InfoType): void;
}>();

const { TOOL_TEXT, TOOL_httpClient, TOOL_loading } = injectTool();

// 获取头像数据 - 公会榜使用公会头像，普通榜使用用户头像
const getAvatarData = () => {
  if (props.isGuildRank) {
    // 公会榜：使用 unionIcon 作为头像，并移除可能触发跳转的字段
    return {
      avatar: props.isGuildRank ? props.item.unionIcon : props.item.avatar,
      // 不传递 uid 等会触发跳转的字段
    };
  }
  return props.item;
};

// 获取显示名称 - 公会榜使用公会名称，普通榜使用用户名称
const getDisplayName = () => {
  return props.isGuildRank ? props.item.unionName : props.item.name;
};

// 判断是否显示国旗 - 仅支持 ID, SG, TW, MY
const shouldShowFlag = () => {
  if (!props.item?.country) return false;
  const supportedCountries = ["ID", "SG", "TW", "MY"];
  return supportedCountries.includes(props.item.country);
};

// 判断是否显示盖戳
// 规则：
// 1. 第一周榜单（"1,1"）结束后TOP10盖戳
// 2. 第二周榜单（"1,2"）结束后TOP10盖戳
// 3. 阶段一总榜（"1"）结束后不盖戳
// 4. 混区赛（"2"）结束后TOP10盖戳
const shouldShowStamp = () => {
  if (props.inFooter) return false; // 底部用户信息不显示盖戳
  if (!props.item?.stamp) return false;
  if (props.status !== 0) return false; // 活动未结束不显示
  if (props.otherParam === "1") return false; // 阶段一总榜不盖戳
  return true;
};

const openMemberRank = () => {
  emit("openMemberRank", props.item);
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

const rankNumber = computed(() => (props.rank === "99+" ? 100 : +props.rank));
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin.scss";
.user {
  display: flex;
  align-items: center;
  position: relative;
  width: 7.4rem;
  height: 1.96rem;
  @include bg("card");
  .rank {
    margin-inline-start: 0.54rem;
    @extend %fc;
    width: 0.6rem;
    height: 0.6rem;
    color: #fffdd0;
    text-align: center;
    font-family: Arial;
    font-size: 0.3rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .avatar_wrap {
    margin-inline-start: 0.16rem;
    margin-inline-end: 0.04rem;
    position: relative;

    .country-flag {
      position: absolute;
      width: 0.48rem;
      height: 0.32rem;
      right: 0;
      bottom: 0.05rem;
      object-fit: contain;
      z-index: 4;
      border-radius: 0.04rem;
    }
  }
  .center {
    margin-inline-end: 1.6rem;
    color: #fffdd0;
    font-family: "SF Arabic";
    font-size: 0.24rem;
    font-style: normal;
    font-weight: 711;
    line-height: 0.32rem; /* 133.333% */
    width: 1.82rem;
    .name {
      width: 100%;
      width: 3rem;
      @extend %oe;
      /* 内文 */
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.3rem; /* 125% */
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
  }
  .btn {
    width: 1.62rem;
    height: 0.6rem;
    @include bg("btn_get");
    @extend %fc;
    &.disabled {
      opacity: 0.5;
    }
  }
  .right {
    .distance_text {
      color: #ff6a39;
      text-align: end;
      // font-family: "SF UI Text";
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.3rem; /* 125% */
    }
    .distance_value {
      width: 1.97rem;
      color: #ffea7f;
      text-align: end;
      // font-family: "SF UI Text";
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.3rem;
    }
    .add {
      width: 0.48rem;
      height: 0.48rem;
      @include bg("add");
    }
    .member-btn {
      width: 0.48rem;
      height: 0.48rem;
      @include bg("1-4");
      cursor: pointer;

      &:active {
        @include bg("1-4-a");
      }
    }
  }

  .stamp {
    width: 2.28rem;
    height: 1.86rem;
    position: absolute;
    top: -0.72rem;
    right: -0.47rem;
  }

  // 前三名特殊样式
  &.is-top3 {
    @include bg("card1");

    .rank {
      color: #570300;
    }

    .center {
      .name {
        color: #570300;
      }
      .score {
        @include bg("score1");
        :deep(.score_inner) {
          color: #890005;
        }
      }
    }
  }
  &.top-1 {
    margin-top: 2rem;
  }

  // 底部用户信息特殊样式
  &.is-footer-user {
    background: none !important;
    width: 100%;
    height: auto;

    .right {
      .add {
        display: none;
      }
    }
    .rank {
      color: #570300;
    }

    .center {
      .name {
        color: #570300;
      }
    }
  }
}
</style>
