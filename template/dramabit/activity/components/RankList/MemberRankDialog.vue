<template>
  <Dialog v-model="show" :frame="false">
    <div class="member-rank-dialog">
      <!-- 标题 -->
      <div class="dialog-title">
        <OssImg src="d-title" tag="img" class="title-bg" />
        <span class="title-text">{{
          guildInfo?.name ||
          guildInfo?.nickname ||
          TOOL_TEXT[65] ||
          "Peringkat Agency"
        }}</span>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <!-- 成员列表 -->
        <div class="member-list">
          <ScrollList
            v-if="show"
            :key="scrollKey"
            :api="api"
            :apiParams="apiParams"
            dialog
          >
            <template #default="{ list }">
              <div
                v-for="(member, idx) in list"
                :key="member.uid"
                class="member-item"
              >
                <div class="rank">{{ member.rank || idx + 1 }}</div>
                <Avatar
                  class="avatar"
                  :data="member"
                  type="a84"
                  :option="{ live: false, jump: true, radius: true }"
                  :pic="{ frame: 'a' }"
                />
                <div class="info">
                  <div class="name oe">
                    {{ member.name || member.nickname }}
                  </div>
                  <div class="score-wrap">
                    <Score :score="Number(member?.score ?? 0)" class="score" />
                  </div>
                </div>
                <div class="action">
                  <div
                    v-if="!member.isFollowed && !member.isMe"
                    class="follow-btn"
                    @click="followMember(member)"
                  ></div>
                </div>
              </div>
            </template>
          </ScrollList>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import Dialog from "../../common/Basic/Dialog.vue";
import ScrollList from "../ScrollList.vue";
import Avatar from "./Avatar.vue";
import Score from "./components/Score.vue";
import injectTool from "@publicComponents/injectTool";
import type { InfoType } from "../../types/rank";

const props = defineProps<{
  modelValue: boolean;
  guildInfo?: InfoType;
  activityId?: number | string;
  other?: string; // 阶段参数
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const { TOOL_TEXT, TOOL_httpClient, TOOL_loading } = injectTool();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// ScrollList 配置
const api = "/api/activity/annualGala2025/unionMemberRank";
const scrollKey = ref(0);

const apiParams = computed(() => ({
  leaderId: props.guildInfo?.uid,
  other: props.other,
}));

// 监听弹框打开时刷新列表
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      scrollKey.value++;
    }
  }
);

// 关注成员
const followMember = (member: InfoType) => {
  if (!member?.uid || member.isFollowed) return;
  TOOL_loading();
  TOOL_httpClient({
    method: "POST",
    url: "/api/activity/commonBusiness/followUser",
    params: {
      toUid: member.uid,
      activityId: props.activityId,
    },
  })
    .then((res) => {
      if (res.status === 200 || res.data?.code === 200) {
        member.isFollowed = true;
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

.member-rank-dialog {
  width: 6.69rem;
  height: 8.69rem;
  @include bg("d-bg");
  background-size: 100% 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  .dialog-title {
    position: relative;
    width: 4.18rem;
    height: 1.06rem;
    margin: 0 auto;
    margin-top: -0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;

    .title-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .title-text {
      position: relative;
      z-index: 1;
      color: #702b09;
      font-family: Arial;
      font-size: 0.28rem;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
    }
  }

  .dialog-content {
    flex: 1;
    padding: 0.2rem 0.4rem;
    overflow: hidden;
  }

  .member-list {
    height: 100%;
    max-height: 6.8rem;
    overflow-y: auto;

    .member-item {
      display: flex;
      align-items: center;
      height: 1.04rem;
      padding: 0 0.2rem;
      margin-bottom: 0.08rem;
      @include bg("d-card");
      background-size: 100% 100%;

      &:last-child {
        margin-bottom: 0;
      }

      .rank {
        width: 0.44rem;
        color: #fffdd0;
        font-family: Arial;
        font-size: 0.32rem;
        font-weight: 700;
        text-align: center;
        flex-shrink: 0;
      }

      .avatar {
        margin-left: 0.24rem;
        flex-shrink: 0;
      }

      .info {
        flex: 1;
        margin-left: 0.16rem;
        min-width: 0;

        .name {
          color: #fffdd0;
          font-family: Arial;
          font-size: 0.26rem;
          font-weight: 700;
          line-height: 0.32rem;
          @extend %oe;
        }

        .score-wrap {
          margin-top: 0.06rem;

          .score {
            width: 1.54rem;
            height: 0.29rem;
            @include bg("d-score");
            background-size: 100% 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            :deep(.score_inner) {
              color: #fff;
              font-size: 0.2rem;
            }
          }
        }
      }

      .action {
        flex-shrink: 0;
        margin-left: 0.1rem;

        .follow-btn {
          width: 0.48rem;
          height: 0.48rem;
          @include bg("add");
          cursor: pointer;
        }
      }
    }
  }
}
</style>
