import injectTool from "@publicComponents/injectTool";

// kNone(-1, "无"), 没有抽中
// kCustom(0, "活动自定义礼物"),
// kGift(1, "礼物"),
// kAvatar(2, "头像框"),
// kBackground(3, "背景"),
// kCar(4, "座驾"),
// kGold(6, "金币")
const useReward = () => {
  const { TOOL_TEXT } = injectTool();

  const getRewardNum = (reward) => {
    // 活动自定义礼物 1 个金锤子
    // if (reward?.goodsType === 0) {
    //   return `*1`;
    // }
    if (reward?.goodsType === -1) {
      // return TOOL_TEXT[66]
      return "*1";
    }
    if (reward?.days) {
      return `*${reward?.days}${
        reward?.days > 1 ? TOOL_TEXT[49] || "days" : TOOL_TEXT[48] || "day"
      }`;
    } else if (reward?.count || reward?.rewardCount || reward?.sendCount) {
      return `*${
        reward?.count ?? reward?.rewardCount ?? reward?.sendCount ?? 0
      }`;
    }
    return "--";
  };

  const getRewardName = (reward) => {
    switch (Number(reward?.goodsType)) {
      case 0:
        // 自定义
        return TOOL_TEXT[51];
      case 1:
        // 礼物
        return "--";
      case 2:
        // 头像框
        return TOOL_TEXT[37];
      case 3:
        // 背景
        return "--";
      case 4:
        // 座驾
        return TOOL_TEXT[38];
      case 6:
        // 金币
        return TOOL_TEXT[39];
      default:
        return "--";
    }
  };

  return {
    getRewardNum,
    getRewardName,
  };
};

export default useReward;
