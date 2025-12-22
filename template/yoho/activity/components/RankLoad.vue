<template>
  <div
    class="rank-load"
    :style="{ 'min-height': pageInfo.status == -1 || dialog ? 'auto' : '8rem' }"
  >
    <slot name="outFrame" :info="{ ...pageInfo }" />
    <RankFrame :frame="soon && pageInfo.status == -1 ? false : frame" :type="frameType" :status="pageInfo.status">
      <div class="content">
        <slot name="info" :info="{ ...pageInfo }" />
        <slot name="empty" v-if="pageInfo.list.length == 0 && dialog" />
        <van-list
          v-show="pageInfo.status != -1 || dialog"
          v-model:loading="pageInfo.loading"
          loading-text=""
          @load="onLoad"
          offset="100"
        >
          <slot
            name="top3"
            :info="{ list: pageInfo.list, status: pageInfo.status, reward: pageInfo.reward }"
          />
          <slot
            v-for="(item, idx) in pageInfo.list"
            name="card"
            :key="'card' + idx"
            :info="{
              ...item,
              idx: idx + 1,
              status: pageInfo.status,
              reward: pageInfo.reward
            }"
          />
          <uLoad v-show="pageInfo.loading" />
        </van-list>
        <Soon v-if="pageInfo.status == -1 && !dialog" />
      </div>
    </RankFrame>
    <slot
      name="userInfo"
      v-if="pageInfo.status != -1"
      :info="{
        ...pageInfo.userInfo,
        show: pageInfo.list.length < 10,
        relatedToMeUsers: pageInfo.relatedToMeUsers
      }"
    />
  </div>
</template>

<script lang="ts" setup name="RankLoad">
import injectTool from '@publicComponents/injectTool'
import { TRank } from '../../types/rank'

const props = withDefaults(
  defineProps<{
    api: string
    apiParams: object
    soon?: boolean // 未开始如果不需要 frame 就传 true
    noMounted?: boolean // 首次挂载不触发
    rankIndex?: number // 手动触发更新
    frame?: boolean // 是否需要 frame
    frameType?: string // 切换榜单上部分背景 根据 selDate 来判断，然后再去 rankFrame 内修改
    dialog?: boolean // 是否是 dialog 榜单
    paddingBottom?: string // 距离底部的 padding
    needFillTop3?: boolean // 是否需要补充 top3
    listName?: string // list name
  }>(),
  {
    soon: false,
    noMounted: false,
    frame: true,
    frameType: 'rank',
    dialog: false,
    paddingBottom: '1.5rem',
    needFillTop3: true,
    listName: 'list'
  }
)
const emit = defineEmits(['getPageInfo'])

const { TOOL_loading, TOOL_httpClient } = injectTool()

const pageInfo: TRank = reactive({
  status: 1,
  timeLeft: 0,
  pageIndex: 1,
  pageSize: 10,
  loading: false,
  isEndPage: false,
  list: [],
  userInfo: {},
  relatedToMeUsers: {}, // cp 与我相关 list，通用 cp 接口直接返回在 userInfo 中
  reward: [] // 奖励 不一定会有
})

const params = computed(() => {
  return Object.assign(
    {},
    { pageIndex: pageInfo.pageIndex, pageSize: pageInfo.pageSize },
    props.apiParams
  )
})

const getList = async () => {
  if (pageInfo.isEndPage) {
    pageInfo.loading = false
    return
  }
  pageInfo.isEndPage = true
  pageInfo.loading = true
  try {
    const res = await TOOL_httpClient({ method: 'get', url: props.api, params: params.value })
    const { data, errorCode } = res.data
    if (errorCode != 0) throw res

    // 数据处理
    const { list, ...other } = data
    Object.assign(pageInfo, other)
    console.log(pageInfo.list, 'pageInfo.list')
    pageInfo.list = pageInfo.list.concat(data[`${props.listName}`])

    // 返回 pageInfo
    await emit('getPageInfo', pageInfo)

    !data.isEndPage && pageInfo.pageIndex++

    // dialog 就不补充
    while (pageInfo.list.length < 3 && !props.dialog && props.needFillTop3) {
      pageInfo.list.push({})
    }
  } catch (error) {
  } finally {
    pageInfo.loading = false
  }
}

const updateList = async () => {
  TOOL_loading()
  pageInfo.isEndPage = false // 数据重置
  pageInfo.pageIndex = 1
  pageInfo.list = []
  pageInfo.userInfo = {}
  await getList() // 请求
  TOOL_loading(false)
}

const onLoad = async () => {
  // 加载分页
  if (pageInfo.list?.length > 9) {
    await getList()
  } else {
    pageInfo.loading = false
  }
}

onMounted(async () => {
  if (props.noMounted) return
  await updateList()
})

watch(
  () => [props.api, props.apiParams, props.rankIndex],
  async () => {
    await updateList()
  }
)

defineExpose({
  loadInfo: pageInfo
})
</script>

<style lang="scss" scoped>

.content {
  padding-bottom: v-bind(paddingBottom);
}
</style>
