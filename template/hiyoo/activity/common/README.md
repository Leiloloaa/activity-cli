# 活动模板组件文档

## 目录

- [活动模板组件文档](#活动模板组件文档)
  - [目录](#目录)
  - [Basic 基础组件](#basic-基础组件)
    - [Rep 文本替换组件](#rep-文本替换组件)
    - [Dialog 弹框组件](#dialog-弹框组件)
    - [Popup 底部弹出层](#popup-底部弹出层)
    - [Space 间距组件](#space-间距组件)
    - [Honor 荣耀勋章组件](#honor-荣耀勋章组件)
    - [Outline 描边文字组件](#outline-描边文字组件)
    - [NoticeBar 跑马灯组件](#noticebar-跑马灯组件)
    - [FixedTop 吸顶组件](#fixedtop-吸顶组件)
  - [通用组件](#通用组件)
    - [Head 头图组件](#head-头图组件)
    - [Soon 即将开始/已结束组件](#soon-即将开始已结束组件)
    - [Timer 倒计时组件](#timer-倒计时组件)
    - [RuleBtn 规则按钮组件](#rulebtn-规则按钮组件)
    - [RankFrame 榜单框架组件](#rankframe-榜单框架组件)
  - [Tabs 组件](#tabs-组件)
    - [TabsMain 主导航组件](#tabsmain-主导航组件)
    - [TabsRank 榜单Tab组件](#tabsrank-榜单tab组件)
    - [TabsRule 规则Tab组件](#tabsrule-规则tab组件)
    - [TabsReward 奖励Tab组件](#tabsreward-奖励tab组件)
  - [全局注入](#全局注入)

---

## Basic 基础组件

### Rep 文本替换组件

文本内容动态替换组件，支持将占位符替换为文字、图片等。

```vue
<Rep
  :content="TOOL_TEXT[14]"
  :rule="[
    {
      reg: '%d',
      val: 'sofa',
      type: 'img',
      styles: { width: 0.38, margin: '0 0.02rem' }
    },
    {
      reg: '%s',
      val: info?.count,
      type: 'text',
      styles: { color: '#fff', fontSize: 0.26 }
    }
  ]"
/>
```

**Props:**

| 属性    | 类型          | 默认值 | 说明         |
| ------- | ------------- | ------ | ------------ |
| content | String/Number | ''     | 原始文本内容 |
| rule    | Array         | []     | 替换规则数组 |

**Rule 配置项:**

| 属性    | 类型          | 说明                                          |
| ------- | ------------- | --------------------------------------------- |
| reg     | String        | 匹配规则，支持 'before'/'after' 或正则字符串  |
| val     | String/Number | 替换的值                                      |
| type    | String        | 类型：'text'/'img'/'spanimg'/'name'/'br'      |
| eg      | Boolean       | 是否反向匹配（阿拉伯语适配）                  |
| styles  | Object        | 样式对象                                      |
| options | Object        | 快捷样式：width/fontSize/color/gap/translateY |

---

### Dialog 弹框组件

居中弹框组件，支持自定义关闭按钮位置。

```vue
<Dialog v-model="showDialog" :hasMaskClose="true" :frame="false">
  <div>弹框内容</div>
</Dialog>
```

**Props:**

| 属性         | 类型    | 默认值 | 说明                           |
| ------------ | ------- | ------ | ------------------------------ |
| modelValue   | Boolean | false  | 是否显示（v-model）            |
| hasMaskClose | Boolean | false  | 点击遮罩是否关闭               |
| frame        | Boolean | false  | 是否显示 RankFrame 框架        |
| title        | String  | ''     | 标题文字                       |
| closeOpt     | Object  | {...}  | 关闭按钮位置配置               |
| zIndex       | Number  | 100    | 层级                           |
| isVideo      | Boolean | false  | 是否为视频弹框（动画方向不同） |
| allClose     | Boolean | false  | 点击任意位置关闭               |

**Events:**

| 事件        | 说明           |
| ----------- | -------------- |
| open        | 弹框打开时触发 |
| beforeClose | 弹框关闭前触发 |

---

### Popup 底部弹出层

从底部弹出的面板组件。

```vue
<Popup v-model="showPopup" :frame="true">
  <div>底部弹出内容</div>
</Popup>
```

**Props:**

| 属性       | 类型    | 默认值 | 说明                    |
| ---------- | ------- | ------ | ----------------------- |
| modelValue | Boolean | false  | 是否显示（v-model）     |
| frame      | Boolean | true   | 是否显示 RankFrame 框架 |
| closeOpt   | Object  | {...}  | 关闭按钮位置配置        |
| zIndex     | Number  | 100    | 层级                    |

---

### Space 间距组件

快速添加间距的工具组件。

```vue
<!-- 水平间距 -->
<Space :val="0.24" />

<!-- 垂直间距 -->
<Space :val="0.5" h />

<!-- 负间距 -->
<Space :val="-0.12" />
```

**Props:**

| 属性 | 类型          | 默认值 | 说明                   |
| ---- | ------------- | ------ | ---------------------- |
| val  | Number/String | 0      | 间距值（rem）          |
| h    | Boolean       | false  | 是否为高度（垂直间距） |

---

### Honor 荣耀勋章组件

显示用户荣誉徽章（魅力/财富/VIP等级）。

```vue
<Honor :data="userInfo" />

<!-- 只显示图标 -->
<Honor :data="userInfo" :showBadge="false" />

<!-- 只显示勋章 -->
<Honor :data="userInfo" :showIcon="false" />

<!-- Top3 样式 -->
<Honor :data="userInfo" top3 />
```

**Props:**

| 属性      | 类型    | 默认值 | 说明                                                        |
| --------- | ------- | ------ | ----------------------------------------------------------- |
| data      | Object  | {}     | 用户数据（包含 glamourLevel/wealthLevel/vipLevel/badgeImg） |
| showIcon  | Boolean | true   | 是否显示等级图标                                            |
| showBadge | Boolean | true   | 是否显示勋章图片                                            |
| top3      | Boolean | false  | 是否为 Top3 样式                                            |
| w         | Number  | -      | 容器宽度（rem）                                             |

---

### Outline 描边文字组件

带描边效果的文字组件。

```vue
<Outline :color="'0.05rem #9CFFFB'" :text="TOOL_TEXT[1]" />

<!-- 不带颜色（继承父级颜色） -->
<Outline :color="'0.05rem #f40'" :text="title" noColor />

<!-- 单行溢出省略 -->
<Outline class="ov" :color="'0.05rem #fff'" :text="name" />
```

**Props:**

| 属性    | 类型          | 默认值         | 说明                  |
| ------- | ------------- | -------------- | --------------------- |
| text    | String/Number | '---'          | 显示文字              |
| color   | String        | '0.05rem #f40' | 描边样式（宽度 颜色） |
| noColor | Boolean       | false          | 是否不使用描边颜色    |

---

### NoticeBar 跑马灯组件

横向滚动的跑马灯文字。

```vue
<NoticeBar :w="6" :h="0.32" :speed="30">
  <span>滚动的文字内容</span>
</NoticeBar>
```

**Props:**

| 属性  | 类型   | 默认值 | 说明        |
| ----- | ------ | ------ | ----------- |
| w     | Number | -      | 宽度（rem） |
| h     | Number | -      | 高度（rem） |
| speed | Number | 30     | 滚动速度    |

---

### FixedTop 吸顶组件

内容滚动到顶部时吸顶固定。

```vue
<FixedTop>
  <TabsRank v-model="tabIndex" />
</FixedTop>

<!-- 自定义背景 -->
<FixedTop bg="linear-gradient(180deg, #1a1a2e 0%, transparent 100%)">
  <div>吸顶内容</div>
</FixedTop>
```

**Props:**

| 属性 | 类型   | 默认值                 | 说明             |
| ---- | ------ | ---------------------- | ---------------- |
| bg   | String | 'linear-gradient(...)' | 吸顶后的背景样式 |

---

## 通用组件

### Head 头图组件

活动头图组件，支持静态图/动图/视频。

```vue
<Head />
```

自动根据设备性能加载不同质量的头图。

---

### Soon 即将开始/已结束组件

显示活动即将开始或已结束状态。

```vue
<!-- 即将开始 -->
<Soon />

<!-- 已结束 -->
<Soon end />
```

**Props:**

| 属性 | 类型    | 默认值 | 说明           |
| ---- | ------- | ------ | -------------- |
| end  | Boolean | false  | 是否为结束状态 |

---

### Timer 倒计时组件

活动倒计时显示。

```vue
<Timer :timeLeft="86400000" :status="1" />
```

**Props:**

| 属性     | 类型          | 默认值 | 说明                                |
| -------- | ------------- | ------ | ----------------------------------- |
| timeLeft | Number/String | -99    | 剩余时间（毫秒）                    |
| status   | Number/String | -2     | 状态：-1=未开始, 0=已结束, 1=进行中 |

---

### RuleBtn 规则按钮组件

固定在右侧的规则/返回按钮。

```vue
<RuleBtn />
```

自动根据当前路由显示"规则"或"返回"。

---

### RankFrame 榜单框架组件

榜单页面的通用框架（上中下三段式）。

```vue
<RankFrame title="榜单标题">
  <div>榜单内容</div>
</RankFrame>

<!-- 不使用框架 -->
<RankFrame :frame="false">
  <div>自定义内容</div>
</RankFrame>
```

**Props:**

| 属性  | 类型    | 默认值 | 说明                      |
| ----- | ------- | ------ | ------------------------- |
| title | String  | ''     | 标题文字                  |
| type  | String  | 'rank' | 框架类型：'rank'/'dialog' |
| frame | Boolean | true   | 是否使用框架              |
| lazy  | Boolean | false  | 中间内容是否懒加载        |

**Slots:**

| 插槽    | 说明           |
| ------- | -------------- |
| default | 中间内容区     |
| up      | 自定义顶部区域 |

---

## Tabs 组件

### TabsMain 主导航组件

主页面底部的 Tab 导航。

```vue
<TabsMain :text="[8, 9, 3]" />
```

**Props:**

| 属性        | 类型          | 默认值      | 说明                          |
| ----------- | ------------- | ----------- | ----------------------------- |
| fatherRoute | String/Number | 'home'      | 父路由名称                    |
| text        | Array         | [8,9,3,6,7] | Tab 文案对应的 TOOL_TEXT 索引 |

---

### TabsRank 榜单Tab组件

榜单页面的 Tab 切换。

```vue
<TabsRank v-model="tabIndex" :text="[173, 174, 175]" />
```

**Props:**

| 属性       | 类型   | 默认值        | 说明                          |
| ---------- | ------ | ------------- | ----------------------------- |
| modelValue | Number | 0             | 当前选中索引（v-model）       |
| text       | Array  | [173,174,175] | Tab 文案对应的 TOOL_TEXT 索引 |

---

### TabsRule 规则Tab组件

规则页面的 Tab 切换。

```vue
<TabsRule v-model="tabIndex" :text="[602, 603]" />
```

**Props:**

| 属性       | 类型   | 默认值    | 说明                          |
| ---------- | ------ | --------- | ----------------------------- |
| modelValue | Number | 0         | 当前选中索引（v-model）       |
| text       | Array  | [602,603] | Tab 文案对应的 TOOL_TEXT 索引 |

---

### TabsReward 奖励Tab组件

奖励页面的 Tab 切换。

```vue
<TabsReward v-model="tabIndex" :text="[173, 174, 175]" />
```

**Props:**

| 属性       | 类型   | 默认值        | 说明                          |
| ---------- | ------ | ------------- | ----------------------------- |
| modelValue | Number | 0             | 当前选中索引（v-model）       |
| text       | Array  | [173,174,175] | Tab 文案对应的 TOOL_TEXT 索引 |

---

## 全局注入

通过 `inject` 获取全局变量：

```typescript
const appInfo = inject('appInfo')      // 全局状态
const ossUrl = inject('ossUrl')        // OSS 图片地址
const getRew = inject('getRew')        // 奖励解析函数
const activityId = inject('activityId') // 活动ID
```

**appInfo 属性：**

| 属性               | 类型     | 说明                     |
| ------------------ | -------- | ------------------------ |
| activityDownStatus | Number   | 活动状态：1=正常, 0=下线 |
| backgroundColor    | String   | 页面背景色               |
| showReward(item)   | Function | 显示奖励弹框             |
| historyBack        | String   | 历史返回路由             |
