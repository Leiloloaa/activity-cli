<template>
  <van-list
    v-show="pageInfo.status != -1"
    v-model:loading="pageInfo.loading"
    loading-text=""
    @load="onLoad"
    offset="100"
  >
    <slot
      name="default"
      :list="pageInfo.list"
      :userInfo="pageInfo.userInfo"
      :status="pageInfo.status"
    />
    <uLoad v-show="pageInfo.loading" />
  </van-list>
  <ComingSoon v-if="pageInfo.status == -1 && !dialog" class="coming_soon" />
  <div class="empty_text" v-if="dialog && !pageInfo.list">
    {{ TOOL_TEXT[52] || "no record" }}
  </div>
  <Teleport v-if="pageInfo.userInfo?.isOnTheRank && !dialog" to="body">
    <div class="footer">
      <slot name="footer" :userInfo="pageInfo.userInfo" />
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
import ComingSoon from "./ComingSoon.vue";
const { TOOL_httpClient, TOOL_loading, TOOL_TEXT } = injectTool();

const props = withDefaults(
  defineProps<{
    api: string;
    apiParams: object;
    insertEle?: () => void;
    dialog?: boolean; // 是否是 dialog 榜单
    paddingBottom?: string; // 距离底部的 padding
    limitPageIndex?: number; // 限制加载页数
  }>(),
  {
    frameType: "up",
    paddingBottom: "2rem",
    dialog: false,
  }
);
const emit = defineEmits(["getPageInfo"]);

const pageInfo = reactive({
  dailyStatus: 1,
  status: 1,
  timeLeft: 9999,
  pageIndex: 1,
  pageSize: 10,
  loading: false,
  isEndPage: false,
  list: [],
  newUserInfo: {},
  reward: [], // 奖励 不一定会有
});

const params = computed(() => {
  return Object.assign(
    {},
    { pageIndex: pageInfo.pageIndex, pageSize: pageInfo.pageSize },
    props.apiParams
  );
});

const getList = async () => {
  if (props.limitPageIndex && pageInfo.pageIndex > props.limitPageIndex) {
    pageInfo.isEndPage = true;
  }
  if (pageInfo.isEndPage) {
    pageInfo.loading = false;
    return;
  }
  pageInfo.isEndPage = true;
  pageInfo.loading = true;
  try {
    const res = await TOOL_httpClient({
      method: "get",
      url: props.api,
      params: params.value,
    });
    // mark
    // res.data = {
    //     "data": {
    //         "status": 1,
    //         "timeLeft": 123123123,
    //         "isEndPage": true,
    //         "list": [
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "test1234",
    //                 "name": "123",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "222",
    //                 "name": "2222",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "test1234",
    //                 "name": "333",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "test1234",
    //                 "name": "44444",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "test1234",
    //                 "name": "5555",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //             {
    //                 "uid": 1935324,
    //                 "nickname": "test1234",
    //                 "name": "6666",
    //                 "gender": 2,
    //                 "avatar": "avatar/video_default_head",
    //                 "area": "ID",
    //                 "region": "ID",
    //                 "country": "ID",
    //                 "level": 50,
    //                 "userTag": [
    //                     1
    //                 ],
    //                 "stamp": true,
    //                 "presenter": 0,
    //                 "liveStatus": 0,
    //                 "rank": "1",
    //                 "score": 1000,
    //                 "isMe": true,
    //                 // 是否关注
    //                 "isFollowed": false,
    //                 "isOnTheRank": true,
    //                 "diffPreviousScore": 0,
    //                 "extraScore": null,
    //                 "isAnchor": false
    //             },
    //         ],
    //         "userInfo": {
    //             "uid": 1935324,
    //             "nickname": "test1234",
    //             "name": "777",
    //             "gender": 2,
    //             "avatar": "avatar/video_default_head",
    //             "area": "ID",
    //             "region": "ID",
    //             "country": "ID",
    //             "level": 50,
    //             "userTag": [
    //                 1
    //             ],
    //             "liveStatus": 0,
    //             "rank": "10",
    //             "score": 1000,
    //             "isOnTheRank": true,
    //             "diffPreviousScore": 1000,
    //             "extraScore": null
    //         }
    //     },
    //     "errorCode": 0,
    //     "errorMsg": "SUCCESS"
    // }
    const { data, errorCode } = res.data;
    if (errorCode != 0) throw res;

    // 数据处理
    const { list, ...other } = data;
    Object.assign(pageInfo, other);
    pageInfo.list = pageInfo.list.concat(data.list ?? [...data]);

    // 返回 pageInfo
    await emit("getPageInfo", pageInfo);

    // 处理插入
    pageInfo.pageIndex == 1 && props.insertEle && props.insertEle();

    !data.isEndPage && pageInfo.pageIndex++;

    // while (pageInfo.list.length < 3) {
    // pageInfo.list.push({});
    // }
  } catch (error) {
    pageInfo.status = -1;
  } finally {
    pageInfo.loading = false;
  }
};

const onLoad = async () => {
  // 加载分页
  if (pageInfo.list?.length > 9) {
    await getList();
  } else {
    pageInfo.loading = false;
  }
};

const updateList = async () => {
  TOOL_loading();
  pageInfo.isEndPage = false; // 数据重置
  pageInfo.pageIndex = 1;
  pageInfo.list = [];
  pageInfo.newUserInfo = {};
  await getList();
  TOOL_loading(false);
};

onMounted(async () => {
  await updateList();
});

watch(
  () => [props.api, props.apiParams],
  async () => {
    await updateList();
  }
);
</script>

<style lang="scss" scoped>
.empty_text {
  margin-top: 0.63rem;

  color: #ffebce;
  text-align: center;
  font-family: "SF Arabic";
  font-size: 0.32rem;
  font-style: normal;
  font-weight: 400;
  line-height: 0.4rem; /* 125% */
}
.coming_soon {
  margin: 0.63rem auto 0;
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 30;
}
</style>
