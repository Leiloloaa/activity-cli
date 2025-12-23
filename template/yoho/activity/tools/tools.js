import dayjs from "dayjs";

export const dateToTextFunc = (date, TOOL_countryCode) => {
  return dayjs(date).format(TOOL_countryCode == "EG" ? "DD/MM" : "MM/DD"); // 中东反向
};

export const getDateList = (date) => {
  let start = dayjs(date.start);
  let end = dayjs(date.end);

  let list: string[] = [];
  for (let maxdays = 0, cur = start; maxdays < 365; maxdays++) {
    let curFormat = cur.format("YYYYMMDD");
    let endFormat = end.format("YYYYMMDD");
    list.push(curFormat);
    if (curFormat == endFormat) break;
    cur = cur.add(1, "day");
  }
  return list;
};

export const getdayInRange = (dateList, day = dayjs()) => {
  let today = dayjs(day);
  let firstDay = dayjs(dateList[0]);
  let lastDay = dayjs(dateList[dateList?.length - 1]);
  let res = today.isBefore(firstDay)
    ? firstDay
    : today.isAfter(lastDay)
    ? lastDay
    : today; // 未开始-日期返回第一天，已结束-日期返回最后一天
  return res.format("YYYYMMDD");
};

// 根据index滚动
export const scrollBasic = (
  scrollRef, // 滚动Ref
  listItemRef, // 列表项Ref
  direction = "y", // 滚动方向
  list = [], // 列表
  targetItemIndex = 0 // 目标索引
) => {
  if (!scrollRef || !listItemRef) {
    console.log("scrollBasic参数不正确", {
      scrollRef,
      listItemRef,
      direction,
      targetItemIndex,
    });
    return {};
  }

  const scrollRefRect = scrollRef?.getBoundingClientRect();
  const scrollCenter = {
    x: scrollRefRect.left + scrollRefRect.width / 2,
    y: scrollRefRect.top + scrollRefRect.height / 2,
  };
  const scrollCenterUsual = direction?.includes("x")
    ? scrollCenter.x
    : scrollCenter.y;

  const targetRef = listItemRef?.[targetItemIndex];
  const targetRect = targetRef?.getBoundingClientRect();

  const itemHalf = {
    x: targetRect?.width / 2,
    y: targetRect?.height / 2,
  };
  const itemHalfUsual = direction?.includes("x") ? itemHalf.x : itemHalf.y;

  const itemCenter = {
    x: targetRect?.left + targetRect?.width / 2,
    y: targetRect?.top + targetRect?.height / 2,
  };
  const itemCenterUsual = direction?.includes("x")
    ? itemCenter.x
    : itemCenter.y;

  let space = itemCenterUsual - scrollCenterUsual;

  // 获取body style direction是否是rtl
  const bodyDir = document.body.style.direction;
  const isRtl = bodyDir === "rtl" ? true : false;
  if (direction?.includes("half"))
    space = isRtl ? -itemHalfUsual : itemHalfUsual;

  if (direction?.includes("x")) {
    scrollRef.scrollLeft += space;
  } else if (direction?.includes("y")) {
    scrollRef.scrollTop += space;
  } else {
    console.error('Invalid direction. Use "x" or "y".');
  }

  return { scrollRef, listItemRef, direction, targetItemIndex, space };
};

// 根据日期滚动
export const scrollFn = (
  scrollRef, // 滚动Ref
  listItemRef, // 列表项Ref
  direction = "x", // 滚动方向
  list = [], // 列表
  indexOrDate = 1 // 选中索引或日期
) => {
  if (
    !scrollRef ||
    !listItemRef ||
    !list ||
    !Array.isArray(list) ||
    list.length == 0
  ) {
    console.log("scrollFn参数不正确", {
      scrollRef,
      listItemRef,
      direction,
      list,
      indexOrDate,
    });
    return {};
  }

  let scrollBasicObj = {};
  let realIndex = indexOrDate;

  const regex = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
  if (
    regex.test(String(indexOrDate)) &&
    dayjs(String(indexOrDate), "YYYYMMDD", true).isValid()
  ) {
    let findIndex = list.findIndex((item) => item == indexOrDate);

    if (findIndex == -1) {
      console.log("日期不在列表中", { indexOrDate, list });
      return {};
    } else {
      realIndex = findIndex;
    }
  }

  scrollBasicObj = scrollBasic(
    scrollRef,
    listItemRef,
    direction,
    list,
    realIndex
  );

  const firstRef = listItemRef?.[0];
  const firstRect = firstRef.getBoundingClientRect();
  const itemSize = direction === "y" ? firstRect.height : firstRect.width;

  return { ...scrollBasicObj, list, indexOrDate, itemSize };
};

export const getTabList = (text) => {
  if (!Array.isArray(text) || text.length === 0) return [];
  return text.map((item): { text: string } => ({
    text: typeof item === "number" ? TOOL_TEXT[item] : String(item), // 确保返回值为字符串
  }));
};

export const hideTab = (hideTabIndex) => {
  if (hideTabIndex.length > 0 && hideTabIndex?.includes(0)) {
    let index = 0;
    hideTabIndex.forEach((item) => {
      if (item == index + 1) {
        index += 1;
      }
    });
    if (index <= -1) {
    } else if (index > -1 && index <= hideTabIndex.length - 1) {
      actTab.value = index + 1;
    } else if (index > hideTabIndex.length - 1) {
    }
  }
};

export const getChildren = (father, text, TOOL_TEXT) => {
  const router = useRouter();
  const list = router.getRoutes();

  if (!Array.isArray(text)) {
    console.log("【TAB】text不是数组");
    return;
  }

  if (text?.length == 0) {
    console.log("【TAB】text为空");
    return;
  }

  let children: any = [];
  let foundTimes = 0;

  list.forEach((fatherItem) => {
    if (fatherItem?.name == father) {
      foundTimes++;

      if (fatherItem?.children?.length <= 0) {
        console.log(`【TAB】父路由[${father}]子路由为空`);
      } else {
        console.log(`【TAB】父路由[${father}]子路由为`, fatherItem.children);

        fatherItem.children.forEach((childrenItem, childrenIndex) => {
          let childrenText = text?.[childrenIndex];

          let text;
          if (typeof childrenText === "number") {
            text = TOOL_TEXT[childrenText];
          } else {
            text = childrenText;
          }

          children.push({ name: childrenItem?.name, text });
        });
      }
    }
  });
  if (foundTimes <= 0) {
    console.log(`【TAB】未找到父路由[${father}]`);
  }
  return children;
};

// 奖励列表
export const getRewardList = (listConfig) => {
  let res = []

  for (let i = 0; i < listConfig?.length; i++) {
    const item = listConfig[i]

    const {
      prefix = 'reward-img', // 奖励图片自定义命名前缀
      playIcon = false, // 点击放大查看播放同名视频/图片
      goodsType = 'kAvatar', // 展示奖励name时，可使用goodsType判断
      range = [] // 根据产品实际提供的资源,配置展示的列表
    } = item

    // 后缀数组
    const suffixArray = ['webp', 'png', 'jpg', 'jpeg', 'gif']

    // 确定后缀
    let suffix = '.webp' // 默认后缀
    for (const key of suffixArray) {
      if (item?.suffix?.includes(key)) {
        suffix = `.${key}` // 根据后缀生成文件扩展名
        break
      } else {
        console.log('请检查是否参数是否应该使用 listValue')
      }
    }

    for (let k = 0; k < range.length; k++) {
      const rangeItem = range[k]

      if (String(rangeItem).includes('-')) {
        const [start, end] = rangeItem.split('-').map(Number)
        for (let j = start; j <= end; j++) {
          res.push({ goodsType, src: `${prefix}${j}${suffix}`, playIcon })
        }
      } else {
        res.push({ goodsType, src: `${prefix}${rangeItem}${suffix}`, playIcon })
      }
    }
  }

  console.log('奖励轮播配置listValue-生成的奖励列表:', res)
  return res
}