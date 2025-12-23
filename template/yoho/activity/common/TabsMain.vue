<template>
  <div class="tabs-component-wrap scrollX" ref="scrollRef">
    <div class="tabs-component">
      <div v-for="(item, index) in tabList" :key="index" ref="listItemRef">
        <div
          :key="item.name"
          class="tab fc"
          :class="`${curRouteName == item.name ? 'act' : ''} tab${index}`"
          @click="switchTab(item.name, index)"
          v-show="
            !hideTabIndex.includes(index) &&
            !hideTabName.includes(item.name) &&
            !route.path.includes('rule') &&
            (isHideRule ? item.name != 'rule' : true)
          "
        >
          <img
            class="obg"
            :src="`${ossUrl}/${
              curRouteName == item.name ? 'tab-act' : 'tab'
            }.png`"
            alt=""
          />

          <Outline
            :color="`0.05rem ${
              curRouteName == item.name ? '#094e01' : '#094e01'
            }`"
            :text="item.text"
            class="text fc"
            noColor
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="TabsMainCp">
import injectTool from "@publicComponents/injectTool";
import { scrollFn, getChildrenWithText } from "../tools/tools.js";

const route = useRoute();
const router = useRouter();
const ossUrl = inject("ossUrl");
const { TOOL_TEXT, TOOL_countryCode, TOOL_BPFunc } = injectTool();

const props = defineProps({
  fatherRoute: {
    type: [Number, String],
    default: "home",
  },
  text: {
    type: Array,
    default: [8, 9, 3, 6, 7],
  },
});

const isHideRule = 1; // 屏蔽rule
const hideTabIndex: any = computed(() =>
  ["EG"].includes(TOOL_countryCode) ? [] : []
); // 通过index过滤Tab
const hideTabName: any = computed(() =>
  ["EG"].includes(TOOL_countryCode) ? [] : []
); // 通过name过滤Tab

const scrollRef = ref(null);
const listItemRef = ref(null);
const scrollFnIndex = (index, type = "") => {
  scrollFn(
    scrollRef.value,
    listItemRef.value,
    `x${type}`,
    tabList.value,
    index
  );
};

const filterList = []; // 在路由中过滤
const routesList = router.getRoutes();
const tabList = computed(() =>
  getChildrenWithText(
    props?.fatherRoute,
    routesList,
    filterList,
    TOOL_TEXT,
    props.text
  )
);

const curRouteName = computed(() => {
  let name = "";
  route?.path?.split("/").forEach((item, index, self) => {
    if (item == props?.fatherRoute) name = self?.[index + 1];
  });
  return name;
});

const switchTab = (name, index) => {
  TOOL_BPFunc({ desc: `main_tab${index + 1}_click`, action: "click" }); //固定不变，勿删
  if (curRouteName.value != name) router.replace({ name });
  scrollFnIndex(index);
};

onMounted(() => {
  const tabIndex = tabList.value.findIndex(
    (item) => item.name == curRouteName.value
  );
  scrollFnIndex(
    tabIndex,
    tabIndex == 0 || tabIndex == tabList.value.length - 1 ? "half" : "whole"
  );
});
</script>

<style lang="scss" scoped>
.tabs-component-wrap {
  width: 7.5rem;

  position: relative;
  z-index: 10;

  .tabs-component {
    width: fit-content;
    margin: 0 auto;

    display: flex;
    position: relative;
    z-index: 1;
    gap: 0.15rem;

    .tab {
      width: 2.54rem;
      height: 1.24rem;
      flex-shrink: 0;
      // margin: 0 0.04rem;

      display: flex;
      justify-content: center;
      align-items: center;

      position: relative;
      z-index: 1;

      span {
        width: 2.3rem;

        color: #ff391f;
        text-align: center;
        font-family: "SF UI Text";
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 600;
        line-height: 0.26rem; /* 108.333% */

        position: relative;
        z-index: 2;
      }

      &.act {
        span {
          color: #6e0000;
          text-align: center;
          font-family: "SF UI Text";
          font-size: 0.26rem;
          font-style: normal;
          font-weight: 600;
          line-height: 0.28rem; /* 107.692% */
        }
      }
    }
  }
}
</style>
