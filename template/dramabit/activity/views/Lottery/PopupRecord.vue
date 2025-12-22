<template>
  <div class="popup-content">
    <div class="title fc">
      <span>{{ TOOL_TEXT[31] }}</span>
    </div>
    <!-- <div class="th">
      <div class="item">
        <span>{{ TOOL_TEXT[32] }}</span>
      </div>
      <div class="item">
        <span>{{ TOOL_TEXT[33] }}</span>
      </div>
    </div> -->
    <div class="scroll-area">
      <ScrollList
        api="/api/activity/annualGala2025/lotteryRecords"
        :apiParams="{}"
        dialog
      >
        <template #default="{ list }">
          <div v-for="item in list" class="item">
            <Space :val="0.18" :h="0" />
            <div class="date text">
              {{ new Date(item?.createTime).toLocaleString() }}
            </div>
            <Space :val="1" :h="0" />
            <div class="reward">
              <cdnImg
                :fid="item?.dynamicImage || item?.staticImage"
                class="reward-img"
              />
              <div class="unit text">{{ getRewardNum(item) }}</div>
            </div>
          </div>
        </template>
      </ScrollList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
import ScrollList from "../../components/ScrollList.vue";
import useReward from "../../hooks/useReward";

const { TOOL_TEXT } = injectTool();
const { getRewardNum } = useReward();
const visible = ref(false);
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin.scss";

.popup-content {
  width: 6.69rem;
  height: 6.96rem;
  @include bg("d-bg");

  .title {
    width: 4.18rem;
    height: 1.06rem;
    @include bg("d-title");
    margin: 0 auto;

    span {
      color: #702b09;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 711;
      line-height: 0.28rem; /* 107.692% */
    }
  }

  .th {
    margin-top: 0.24rem;
    margin-bottom: 0.08rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .item {
      color: #fffdd0;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.32rem; /* 133.333% */
    }
  }

  .scroll-area {
    width: 5.84rem;
    height: 5rem;
    overflow-y: scroll;
    margin: 0 auto;
    margin-top: 0.24rem;

    .item {
      width: 5.84rem;
      height: 0.84rem;
      @include bg("d-card");
      margin-bottom: 0.08rem;

      display: flex;
      align-items: center;

      .text {
        color: #fffdd0;
        font-family: "SF Arabic";
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 400;
        line-height: 0.24rem; /* 100% */
      }
      .date {
        width: 3rem;
      }
      .reward {
        @extend %fc;
        .reward-img {
          width: 0.48rem;
          height: 0.48rem;
          object-fit: contain;
        }
        .unit {
          min-width: 0.7rem;
          text-align: end;
        }
      }
    }
  }
}
</style>
