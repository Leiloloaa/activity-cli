<template>
  <div class="home">
    <TabNav :tabsConfig="tabsConfig" class="tabs" />

    <!-- 礼物轮播组件 -->
    <div class="gift-swiper-wrap" v-if="giftList.length > 0">
      <!-- 标题区域 -->
      <div class="title-wrap">
        <OssImg src="1-3" class="decor-left" tag="img" />
        <span class="title">{{ TOOL_TEXT[12] || "Hadiah Event" }}</span>
        <OssImg src="1-3" class="decor-right" tag="img" />
      </div>

      <!-- 背景 -->
      <OssImg src="1-1" class="swiper-bg" tag="img" />

      <!-- 轮播内容 -->
      <div class="swiper-content">
        <!-- 左箭头 -->
        <OssImg src="1-2" class="arrow arrow-left prev-gift" tag="img" />

        <SwiperTemp
          :list="giftList"
          :maxNumber="4"
          :navigation="{ nextEl: '.next-gift', prevEl: '.prev-gift' }"
          :centeredSlides="false"
          :initialSlide="0"
          :slidesPerGroup="1"
          :forceLoop="true"
          :SwiperSelfStyle="{ width: '5.8rem' }"
        >
          <template #default="{ item }">
            <div class="gift-item">
              <OssImg src="rew" class="gift-bg" tag="img" />
              <cdnImg
                v-if="(item as TEventGift)?.giftImage"
                :fid="(item as TEventGift)?.giftImage"
                class="gift-img"
              />
            </div>
          </template>
        </SwiperTemp>

        <!-- 右箭头 -->
        <OssImg src="1-2-r" class="arrow arrow-right next-gift" tag="img" />
      </div>
    </div>

    <RouterView v-slot="{ Component, route }">
      <Component :is="Component" :key="route.path" />
    </RouterView>
  </div>
</template>

<script lang="ts" setup name="Home">
import { useRoute } from "vue-router";
// @ts-ignore
import injectTool from "@publicComponents/injectTool";

import TabNav from "../components/Tab/TabNav.vue";
import SwiperTemp from "../components/SwiperTemp.vue";
import type { TEventGift } from "../types/Reward";
import { config } from "../config";

const { TOOL_httpClient, TOOL_TEXT } = injectTool();

const giftList = ref<TEventGift>([
  { img: "icon_help", titleIndex: 1 },
  { img: "icon_help", titleIndex: 1 },
  { img: "icon_help", titleIndex: 1 },
  { img: "icon_help", titleIndex: 1 },
]);
// { img: 'icon_help', titleIndex: 1 },
// { img: 'icon_help', titleIndex: 1 },
// { img: 'icon_help', titleIndex: 1 },
// { img: 'icon_help', titleIndex: 1 },
// { img: 'icon_help', titleIndex: 1 },

const getGiftList = async () => {
  TOOL_httpClient({
    url: "/api/activity/commonBusiness/gifts",
    params: { activityId: config.activityId },
  })
    .then((res) => {
      const { data, errorCode, errorMsg } = res.data;
      if (errorCode != 0) throw new Error(errorMsg);
      console.log(data);
      // giftList.value = (data ?? []).map(item => ({
      //   img: item.giftImage,
      //   titleIndex: item.giftName,
      // }));
      Object.assign(giftList.value, data);
    })
    .catch((error) => {
      console.log(error);
    });
};
getGiftList();

const tabsConfig = [
  { labelIndex: 8, path: "/home/anchor-rank" }, // 主播榜
  { labelIndex: 9, path: "/home/user-rank" }, // 用户榜
  { labelIndex: 10, path: "/home/guild-rank" }, // 公会榜
  { labelIndex: 11, path: "/home/lottery" }, // 盛典转盘
];
const route = useRoute();
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin";

.home {
  width: 100%;
  position: relative;
  margin-top: -2.6rem;

  .tabs {
    margin: 0.11rem auto 0;
  }

  // 礼物轮播组件样式
  .gift-swiper-wrap {
    position: relative;
    width: 7.5rem;
    margin: 0 auto;
    margin-top: 0.24rem;
    padding-top: 0.08rem;
    padding-bottom: 0.5rem;

    // 标题区域
    .title-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      margin-top: -0.2rem;
      margin-bottom: 0.25rem;

      .title {
        color: #fffdd0;
        text-align: center;
        font-family: Arial;
        font-size: 0.3rem;
        font-weight: 700;
        line-height: 0.32rem;
        padding: 0 0.12rem;
      }

      .decor-left {
        width: 1.74rem;
        height: 0.18rem;
      }

      .decor-right {
        width: 1.74rem;
        height: 0.18rem;
        transform: scaleX(-1);
      }
    }

    // 背景
    .swiper-bg {
      position: absolute;
      top: 0.28rem;
      left: 50%;
      transform: translateX(-50%);
      width: 7.4rem;
      height: 2.34rem;
      flex-shrink: 0;
      z-index: 0;
    }

    // 轮播内容区域
    .swiper-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem 0;

      // 箭头
      .arrow {
        width: 0.72rem;
        height: 0.72rem;
        cursor: pointer;
        flex-shrink: 0;
        z-index: 3;
        transition: opacity 0.2s ease;

        &:active {
          opacity: 0.7;
        }
      }

      .arrow-left {
        margin-right: -0.08rem;
      }

      .arrow-right {
        margin-left: -0.08rem;
      }

      // 礼物项
      .gift-item {
        position: relative;
        width: 1.28rem;
        height: 1.28rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .gift-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .gift-img {
          position: relative;
          z-index: 1;
          width: 1.04rem;
          height: 1.04rem;
          object-fit: contain;
        }
      }
    }

    // Swiper 样式覆盖
    :deep(.swiper-self) {
      width: 5.8rem;
    }

    :deep(.swiper-slide) {
      width: 1.28rem !important;
      margin: 0 0.08rem;
    }
  }
}
</style>
