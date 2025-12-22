<template>
  <div id="wrap">
    <HeaderImg class="header_img" />
    <RouterView />
    <div class="m-adorn"></div>

    <Dialog v-model="showLoginDialog" :frame="false"
      ><LoginReward :rewardList="rewardList" @close="closeLoginDialog" />
    </Dialog>
  </div>
</template>

<script lang="ts" setup name="App">
import injectTool from "@publicComponents/injectTool";
import HeaderImg from "./components/HeaderImg.vue";
import { config } from "./config";
import { useRouter } from "vue-router";
import LoginReward from "./views/LoginReward.vue";

const router = useRouter();
const showLoginDialog = ref(false);
const rewardList = ref([]);

const closeLoginDialog = () => {
  showLoginDialog.value = false;
};

// const getStage = ref(0);
// provide("getStage", getStage);
const { TOOL_httpClient, TOOL_BPFunc, TOOL_TEXT, TOOL_loading } = injectTool();

const getLoginInfo = async () => {
  try {
    const url = "/api/activity/commonBusiness/login";
    const res = await TOOL_httpClient({
      url: url,
      method: "post",
      params: { activityId: config.activityId, other: 11 },
    });
    const { data, errorCode } = res.data;
    console.log(data, data?.isPopUp, "data?.isPopUp");
    if (data?.isPopUp) {
      // 弹出弹框
      console.log(data?.rewards, "弹出弹框 data?.rewards");
      showLoginDialog.value = true;
      rewardList.value = data?.rewards;
    }
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
  }
};
getLoginInfo();

// const imgUrl = computed(() => {
//   return `//static.dramabite.media/activity-image/${config.imgUrl}/${themeTypeString.value}`;
// });
const imgUrl = config.imgUrl;
provide("imgUrl", imgUrl);
provide("ossUrl", imgUrl);
// const ossUrl =
//   `//static.dramabite.media/activity-image/${config.imgUrl}`;
// provide("ossUrl", ossUrl);
// const isThemeType = ref(false)

watchEffect(() => (document.title = TOOL_TEXT[2] || "Loading..."));

TOOL_httpClient({
  url: "/api/activity/commonBusiness/activityStatus",
  params: {
    activityId: config.activityId,
  },
})
  .then((res) => {
    const status = res.data?.data?.status ?? -1;
    console.log("status", status);
    // router.replace(status === 1 ? "/home/anchor-rank" : "/home/lottery");

    if (status !== 1) {
      // 埋点上报
      TOOL_BPFunc({ desc: "pvuv_show_game1", type: "show" });
    }
    watch(
      () => router.currentRoute.value.path,
      (newPath) => {
        if (newPath === "/home/lottery") {
          // 埋点上报
          TOOL_BPFunc({ desc: "pvuv_show_game1", type: "show" });
        }
      }
    );
  })
  .catch((err) => {
    console.log(err);
  });
</script>

<style lang="scss">
@import "./scss/public_mixin.scss";
#wrap {
  width: 100%;
  height: auto;
  // background: v-bind(bgc_color);
  min-height: 100vh;

  overflow: hidden;
  position: relative;
  .m-adorn {
    width: 7.5rem;
    height: 7.5rem;
    position: absolute;
    top: 11.62rem;
    @include bg("m-adorn");
    z-index: -1;
  }

  .header_img {
    margin-bottom: -2.13rem;
  }

  // .last {
  //   width: 2.05rem;
  //   height: 0.54rem;

  //   position: absolute;
  //   top: 5.6rem;
  //   left: 0rem;
  //   z-index: 10;

  //   text-align: center;
  //   font-family: Arial;
  //   font-size: 0.28rem;
  //   font-weight: 400;
  //   line-height: 0.54rem;
  // }

  // .footer {
  //   width: 7.5rem;
  //   height: 1.7rem;

  //   position: absolute;
  //   bottom: -0.01rem;
  // }
}
</style>
