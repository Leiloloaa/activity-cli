<template>
  <div class="lottery">
    <Timer
      :timeLeft="pageInfo.lotteryTimeLeft"
      :status="pageInfo.lotteryStatus"
      :style="{ 'margin-top': '0.2rem' }"
    />

    <!-- 文案区域 -->
    <div class="desc-box">
      <div class="desc-text">
        {{ TOOL_TEXT[isAdvanced ? 29 : 28] }}
      </div>
    </div>

    <div class="frame">
      <img
        :src="`${ossUrl}/draw-record.png`"
        alt=""
        class="draw-record"
        @click="showRecord"
      />

      <!-- 高级奖池模式 - 返回按钮 -->
      <div class="back-btn fc" @click="switchPool" v-if="isAdvanced">
        <span>{{ TOOL_TEXT[40] }}</span>
      </div>

      <!-- 低级模式 -- 显示钥匙多少，点击切换奖池 -->
      <div class="key-info fc" @click="switchPool" v-else>
        <img :src="`${ossUrl}/draw-key-icon.png`" alt="" class="key-icon" />
        <span class="key-num">*{{ displayKeys || 0 }}</span>
      </div>

      <div class="my-count">
        <span class="text">
          <Rep
            :content="TOOL_TEXT[isAdvanced ? 35 : 34]"
            :rule="[
              {
                reg: '%s',
                eg: false,
                val: 'draw-key-icon',
                type: 'img',
                options: { width: 0.4, translateY: -0.02, gap: 0.02 },
              },
            ]"
          />
        </span>
        <span class="count">
          <img
            v-if="isAdvanced"
            :src="`${ossUrl}/draw-key-icon.png`"
            alt=""
            class="count-key-icon"
          />
          {{ isAdvanced ? pageInfo.lotteryHammerCount : pageInfo.lotteryPoint }}
        </span>
      </div>

      <!-- 抽奖区域 -->
      <div class="game-area">
        <div class="eggs-wrap">
          <div
            class="egg-item"
            v-for="item in [3, 1, 2]"
            :class="`egg-item-${item}`"
            :key="item"
          >
            <img
              v-show="currentHammer === item"
              :src="`${ossUrl}/hammer.png`"
              alt=""
              class="hammer"
              :class="{ hitting: isHitting && currentHammer === item }"
            />

            <img
              :src="`${ossUrl}/egg${isAdvanced ? 0 : item}.png`"
              alt=""
              class="egg"
              :class="`egg-${item}`"
            />

            <img
              :src="`${ossUrl}/egg-bottom.png`"
              alt=""
              class="egg-bottom"
              :class="{
                'egg-bottom-offset': !isAdvanced && [2].includes(item),
              }"
            />
          </div>
        </div>

        <div
          class="draw-btn fc"
          :class="{ 'high-btn': isAdvanced }"
          @click="lottery"
        >
          <span>{{ TOOL_TEXT[44] || "抽奖" }}</span>
        </div>
      </div>

      <!-- 倍数控制（仅低级模式显示） -->
      <div class="multiply-bar" v-if="!isAdvanced">
        <div class="multiply-label">
          {{ TOOL_TEXT[32] }}
        </div>
        <div class="multiply-control">
          <div
            class="btn-minus fc"
            :class="{ disabled: !canDecrease }"
            @click="decreaseMultiple"
          ></div>
          <div class="multiply-value fc">
            <span>*{{ multiple }}</span>
          </div>
          <div
            class="btn-plus fc"
            :class="{ disabled: !canIncrease }"
            @click="increaseMultiple"
          ></div>
        </div>
      </div>

      <!-- 我的积分/钥匙 -->
      <div class="bottom-show fc">
        <template v-if="isAdvanced">
          <Rep
            class="points-text"
            :content="TOOL_TEXT[36]"
            :rule="[
              {
                reg: '%s',
                eg: false,
                val: 'draw-key-icon',
                type: 'img',
                options: { width: 0.4, translateY: -0.02, gap: 0.02 },
              },
            ]"
          />
          <div
            class="fc"
            :class="{ 'low-points': !isAdvanced, 'points-value': isAdvanced }"
          >
            <span>*1</span>
          </div>
        </template>
        <template v-else>
          <span class="points-text">{{ TOOL_TEXT[33] }}</span>
          <div
            class="fc"
            :class="{ 'low-points': !isAdvanced, 'points-value': isAdvanced }"
          >
            <span>*{{ consumePoints }}</span>
          </div>
        </template>
      </div>
    </div>

    <Dialog v-model="showRewardDialog" :frame="false">
      <MICOReward :rewardList="rewardList" />
    </Dialog>

    <Dialog v-model="showRecordDialog" :frame="false">
      <PopupRecord />
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import injectTool from "@publicComponents/injectTool";
import Timer from "../../components/TimeLeft.vue";
import PopupRecord from "./PopupRecord.vue";
import MICOReward from "./MICOReward.vue";
import Rep from "../../common/Basic/Rep.vue";

const { TOOL_TEXT, TOOL_httpClient, TOOL_loading, TOOL_toast, TOOL_BPFunc } =
  injectTool();

TOOL_BPFunc({ desc: "4", type: "show" });

const showRecordDialog = ref(false);
const showRewardDialog = ref(false);
const ossUrl = inject("ossUrl");
const pageInfo = reactive<any>({ status: -1, timeLeft: 0 });
const getInfo = async () => {
  try {
    TOOL_loading();
    const url = "/api/activity/annualGala2025/lotteryInfo";
    const res = await TOOL_httpClient({
      url: url,
      method: "get",
    });
    const { data, errorCode } = res.data;
    if (errorCode != 0) throw res;
    Object.assign(pageInfo, data);
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    TOOL_loading(false);
  }
};
getInfo();

// 当前锤子显示在哪个蛋上方（1、2、3 或 null）
const currentHammer = ref<number | null>(null);
// 是否正在抽奖中
const isLottering = ref(false);
// 锤子是否处于敲击状态
const isHitting = ref(false);

// 锤子轮流切换动画（带缓动效果）
const hammerAnimation = (targetEgg: number): Promise<void> => {
  return new Promise((resolve) => {
    const eggs = [3, 1, 2]; // 按显示顺序：左、中、右
    const totalRounds = 2; // 转几圈
    const totalSteps = eggs.length * totalRounds;

    // 找到目标蛋在数组中的位置
    const targetIndex = eggs.indexOf(targetEgg);
    // 需要额外走的步数，确保停在目标上
    const extraSteps = targetIndex >= 0 ? targetIndex : 0;
    const finalSteps = totalSteps + extraSteps;

    let step = 0;

    const runStep = () => {
      currentHammer.value = eggs[step % eggs.length];
      step++;

      if (step >= finalSteps) {
        // 动画结束，停留在目标蛋上
        currentHammer.value = targetEgg;
        // 执行敲击动画
        setTimeout(() => {
          isHitting.value = true;
          setTimeout(() => {
            isHitting.value = false;
            resolve();
          }, 300);
        }, 100);
        return;
      }

      // 缓动效果：越到后面速度越慢
      const progress = step / finalSteps;
      // 使用 easeOutQuad 缓动函数
      const delay = 80 + Math.pow(progress, 2) * 300;

      setTimeout(runStep, delay);
    };

    runStep();
  });
};

const lottery = async () => {
  if (pageInfo.lotteryStatus != 1) {
    return TOOL_toast({
      text: TOOL_TEXT[pageInfo.lotteryStatus == -1 ? 46 : 47],
    });
  }

  if (isLottering.value) return;

  try {
    isLottering.value = true;
    if (isAdvanced.value) {
      // 确保 lotteryHammerCount > 0 时才减，且不会出现负值
      if (pageInfo.lotteryHammerCount > 0) {
        pageInfo.lotteryHammerCount = Math.max(
          0,
          pageInfo.lotteryHammerCount - 1
        );
      }
    } else {
      // 确保 lotteryPoint > consumePoints 时才减，且不会出现负值
      if (
        pageInfo.lotteryPoint > consumePoints.value &&
        pageInfo.lotteryPoint > 0
      ) {
        pageInfo.lotteryPoint = Math.max(
          0,
          pageInfo.lotteryPoint - consumePoints.value
        );
      }
    }
    const url = `/api/activity/annualGala2025/lottery?type=${
      isAdvanced.value ? 1 : 0
    }${isAdvanced.value ? `` : `&multiples=${multiple.value}`}`;
    const res = await TOOL_httpClient({
      url: url,
      method: "post",
    });
    const { data } = res.data;

    const _key = data["code"];
    const messages = {
      401: TOOL_TEXT[46], // coming
      402: TOOL_TEXT[47], // end
      403: "not enough", // 次数不足
      420: "", // 长度不符合
      504: "", // 次数已达上线
      default: TOOL_TEXT[50], // 网络异常
    };
    const message = messages[_key] || messages.default;
    if (_key == 200) {
      // 执行锤子动画，停留在接口返回的目标蛋上（假设接口返回 data.targetEgg）
      const targetEgg = data.data?.eggType; // 默认停在2号蛋
      await hammerAnimation(targetEgg);

      // 动画结束后隐藏锤子
      currentHammer.value = null;

      // 结束后显示弹框
      showRewardDialog.value = true;
      rewardList.value = data.data?.rewards;
      console.info(rewardList.value, "rewardList.value");
      // 成功 刷新页面
      await getInfo();
    } else {
      TOOL_toast({ text: message });
    }
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    isLottering.value = false;
  }
};

// 是否为高级奖池模式
const isAdvanced = ref(false);

// 奖励预览列表
const rewardList = ref([
  { img: "", num: "*1day" },
  { img: "", num: "*1000" },
  { img: "", num: "*1000" },
  { img: "", num: "*1000" },
  { img: "", num: "*1000" },
]);

// 可选倍数列表
const multipleOptions = [1, 3, 5, 10, 20, 50];
// 当前倍数索引
const multipleIndex = ref(0);
// 当前倍数值
const multiple = computed(() => multipleOptions[multipleIndex.value]);
// 是否可以减少
const canDecrease = computed(() => multipleIndex.value > 0);
// 是否可以增加
const canIncrease = computed(
  () => multipleIndex.value < multipleOptions.length - 1
);

const consumePoints = computed(() => {
  return pageInfo.requiredPoint * multiple.value;
});

// 我的钥匙
const myKeys = ref(10);

// 格式化数字（大于1000时缩略显示）
const formatNumber = (num: number | string): string => {
  if (!num) return "";
  if (Number(num) >= 1000) {
    // 向下取整到小数点后1位，不四舍五入
    const k = Math.floor((Number(num) / 1000) * 10) / 10;
    // 如果是整千，不显示小数点；否则保留1位小数
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(num);
};

// 显示用的钥匙数量
const displayKeys = computed(() => formatNumber(pageInfo.lotteryHammerCount));

// 消耗积分
const costPoints = computed(() => multiple.value * 200);

// 消耗钥匙（高级奖池固定消耗1把钥匙）
const costKeys = ref(1);

// 切换奖池
const switchPool = () => {
  // 抽奖过程中不允许切换
  if (isLottering.value) return;
  TOOL_loading();
  setTimeout(() => {
    TOOL_loading(false);
    isAdvanced.value = !isAdvanced.value;
  }, 500);
};

// 减少翻倍
const decreaseMultiple = () => {
  if (canDecrease.value) {
    multipleIndex.value--;
  }
};

// 增加翻倍
const increaseMultiple = () => {
  if (canIncrease.value) {
    multipleIndex.value++;
  }
};

// 选择蛋
const selectEgg = (type: string) => {
  console.log("选择蛋:", type);
};

// 抽奖
const doLottery = () => {
  console.log("抽奖, 高级奖池:", isAdvanced.value);
};

// 显示记录
const showRecord = () => {
  console.log("显示记录");
  showRecordDialog.value = true;
};
</script>

<style lang="scss" scoped>
@import "../../scss/public_mixin";

.lottery {
  position: relative;

  // 文案区域
  .desc-box {
    width: 6.22rem;

    margin: 0 auto;
    margin-top: 0.16rem;
    .desc-text {
      color: #fff;
      text-align: center;
      font-family: Arial;
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.34rem; /* 130.769% */
    }
  }

  .frame {
    width: 7.5rem;
    height: 9.87rem;
    @include bg("lottery-frame");

    display: inline-block;
    margin-top: -0.45rem;
    margin-bottom: 1rem;

    .draw-record {
      width: 0.72rem;
      height: 0.72rem;

      position: absolute;
      top: 7.5rem;
      right: 0.34rem;
      z-index: 2;
    }
  }

  .back-btn {
    width: 1.42rem;
    height: 0.48rem;

    @include bg("draw-return");
    position: absolute;
    top: 3.55rem;
    left: 0.34rem;
    z-index: 10;

    padding-right: 0.2rem;
    direction: ltr;

    span {
      text-align: center;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.24rem; /* 100% */

      background: linear-gradient(
        266deg,
        #853500 0%,
        #bc5f0e 50%,
        #853500 100%
      );
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .key-info {
    width: 1.42rem;
    height: 0.48rem;

    @include bg("draw-key");
    position: absolute;
    top: 3.55rem;
    right: 0.34rem;
    z-index: 10;

    padding-left: 0.2rem;
    direction: ltr;

    .key-icon {
      width: 0.24rem;
      height: 0.3rem;
    }

    .key-num {
      direction: ltr;

      text-align: center;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.24rem; /* 100% */

      background: linear-gradient(
        266deg,
        #853500 0%,
        #bc5f0e 50%,
        #853500 100%
      );
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .my-count {
    width: 4.7rem;
    height: 0.83rem;
    @include bg("lottery-count-wrap");

    margin: 0 auto;
    margin-top: 1.95rem;

    display: flex;
    justify-content: center;
    align-items: center;

    .text {
      min-width: 2.22rem;

      text-align: center;
      color: #fffdd0;
      font-family: Arial;
      font-size: 0.3rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.32rem; /* 106.667% */
    }

    .count {
      width: 1.51rem;
      height: 0.44rem;
      @include bg("lottery-count");
      position: relative;

      .count-key-icon {
        width: 0.4rem;
        height: 0.52rem;
        position: absolute;
        left: -0.05rem;
        top: 50%;
        transform: translateY(-50%);
      }

      text-align: center;
      color: #a92a00;
      font-family: Arial;
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.44rem; /* 123.077% */
    }
  }

  // 抽奖区域
  .game-area {
    position: relative;
    margin-top: -0.3rem;

    .eggs-wrap {
      display: flex;
      justify-content: center;

      direction: ltr;

      .egg-item {
        display: flex;
        align-items: center;
        flex-direction: column;

        position: relative;

        &.egg-item-1 {
          margin-left: -1.25rem;
          margin-right: -1.25rem;

          .hammer {
            top: -0.51rem;
            right: -0.9rem;
            z-index: 4;
          }
        }

        .hammer {
          width: 3.08rem;
          height: 3.24rem;

          position: absolute;
          top: 0;
          right: -0.6rem;
          z-index: 4;

          transform-origin: 80% 20%;

          // 敲击动画 - 只在最终停留时触发
          &.hitting {
            animation: hammer-hit 0.3s ease-out;
          }
        }

        .egg {
          &.egg-2,
          &.egg-3 {
            margin-top: 0.82rem;
            z-index: 2;
          }
          width: 3.35rem;
          height: 3.59rem;

          position: relative;
        }

        .egg-bottom {
          width: 2.61rem;
          height: 3.31rem;
          margin-top: -2.3rem;

          // 只在低级模式且 item 为 2,3 时偏移
          &.egg-bottom-offset {
            transform: translateX(0.06rem);
          }
        }
      }
    }

    .draw-btn {
      width: 2.46rem;
      height: 1.12rem;
      @include bg("draw-btn");
      margin: 0 auto;

      margin-top: -1.2rem;

      position: relative;

      &.high-btn {
        width: 2.64rem;
        height: 1.2rem;
      }

      span {
        color: #702b09;
        text-align: center;
        font-family: "SF Arabic";
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 711;
        line-height: 0.22rem; /* 84.615% */
      }
    }
  }

  // 倍数控制栏
  .multiply-bar {
    display: flex;
    flex-direction: column;
    align-items: center;

    .multiply-label {
      margin-top: 0.04rem;
      color: #fffdd0;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.32rem; /* 133.333% */
      letter-spacing: -0.01rem;
    }

    .multiply-control {
      display: flex;
      align-items: center;

      .btn-minus {
        width: 0.28rem;
        height: 0.28rem;
        @include bg("draw-reduce");

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
      .btn-plus {
        width: 0.28rem;
        height: 0.28rem;
        @include bg("draw-add");

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }

      .multiply-value {
        width: 0.94rem;
        height: 0.36rem;
        @include bg("draw-multiple-value");

        margin-top: 0.02rem;
        margin-left: 0.07rem;
        margin-right: 0.07rem;

        direction: ltr;

        span {
          color: #702b09;
          text-align: center;
          font-family: "SF Arabic";
          font-size: 0.24rem;
          font-style: normal;
          font-weight: 711;
          line-height: 0.32rem; /* 133.333% */
        }
      }
    }
  }

  .bottom-show {
    margin-top: 0.1rem;
    .points-text {
      margin-left: 0.06rem;
      margin-right: 0.06rem;
      color: #fffdd0;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.32rem; /* 133.333% */
      letter-spacing: -0.01rem;
    }

    .low-points {
      width: 1.38rem;
      height: 0.36rem;
      @include bg("draw-bottom-count-low");

      margin-left: 0.1rem;
      margin-right: 0.1rem;

      span {
        color: #fffdd0;
        font-family: Arial;
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.32rem; /* 133.333% */
        letter-spacing: -0.01rem;
      }
    }

    .points-value {
      width: 1.42rem;
      height: 0.58rem;
      @include bg("draw-bottom-count");
      direction: ltr;

      span {
        margin-top: 0.08rem;
        margin-left: 0.1rem;
        color: #fffdd0;
        font-family: Arial;
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.32rem; /* 133.333% */
        letter-spacing: -0.01rem;
      }
    }
  }
}

// 锤子向下敲击动画
@keyframes hammer-hit {
  0% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(-45deg);
  }
  70% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
