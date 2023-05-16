<script setup lang="ts">
import {
  Button,
  Img,
  Header,
  RankCard,
  TextStroke,
} from "@yoho/yoho-design-ui";
import { reactive } from "vue";
const list = reactive([
  { rank: 1, name: "123", score: 999 },
  { rank: 2, name: "456", score: 999 },
  { rank: 3, name: "789", score: 999 },
  { rank: 4, name: "0-=", score: 999 },
]);
</script>

<template>
  <TextStroke textStroke="5rem #ff4400" text="yoho design vue">
    <template #content> <span class="text">yoho design vue</span></template>
  </TextStroke>
  <!-- <RankCard
    v-for="(item, index) in list"
    className="card-container"
    :item="item"
  >
    <template #title>
      <div class="title">我是title</div>
    </template>
    <template #avatar>
      <div>头像</div>
    </template>
    <template #footer>
      <div class="footer">我是需要滚动的弹幕</div>
    </template>
  </RankCard> -->
  <Button>123</Button>
  <!-- 传 type -->
  <!-- <Img type="coin" />
  <Img type="live" />
  <Img type="success" className="coin" />
  <Img type="fail" className="coin" /> -->
  <!-- <Header
    src="https://image.waka.media/activity/general_starSign5/starSign5-header-EG.png"
    className="custom-header"
  /> -->
  <!-- 传 src -->
  <!-- <Img
    src="https://image.waka.media/activity/yoho-ui/coin.png"
    className="coin"
  /> -->
  <!-- 需注册组件是传入 前缀地址 -->
  <!-- <Img :src="'coin.png'" className="coin" /> -->

  <!-- 传 fid -->
  <Img :fid="'wakam/3011422bce1a9d2380553cecc78829a1'" className="coin" />
</template>

<style lang="less">
.card-container {
  width: 6.2rem;
  height: 3.68rem;
  padding: 0.25rem 0;
  margin: 0.1rem auto;
  background-color: aqua;
  border-radius: 0.5rem;
  .title {
    width: 50%;
    margin: 0 auto;
    background-color: pink;
  }

  .content {
    display: flex;
    justify-content: space-around;
    align-items: center;

    width: 6.2rem;
    height: 2rem;
    margin: 0rem auto;
    background-color: aqua;
    border-radius: 0.5rem;
    .rank {
      width: 2rem;
      height: 2rem;
      color: black;
    }
    .name {
      color: yellow;
    }
    .score {
      color: red;
      background-color: #fff;
    }
  }

  .footer {
    width: 50%;
    margin: 0 auto;
    background-color: #000;
  }
}
</style>
