# rank-card

**old Usage**

```html
<div class="card fc">
   <div class="rank-num fc">
      {{ idx + 1 }}
   </div>
   <div class="avatar-wrap fc" v-jump="item">
      <cdnImg :fid="item.avatar" />
      <div class="live" v-if="item?.liveStatus == 1">
         <img
         class="live-wave"
         src="//image.waka.media/activity/202007_nationalDay/liveIcon.png"
         />
      </div>
   </div>
   <div class="rank-name ov">{{ item?.name || '--' }}</div>
   <div class="rank-score flc ov">
      <span>{{ item?.score || '--' }}</span>
   </div>
</div>
```

**new Usage**

```html
<!-- default -->
<RankCard v-for="(item, index) in list" rankCardClass="card" :item="item" />

<!-- EG -->
<RankCard v-for="(item, index) in list" :rankCardClass="[card,EG]" :item="item" />

<!-- customize -->
<RankCard>
   <template #content>
      <div class="rank">123</div>
      <div class="name">123</div>
      <div class="score">123</div>
   </template>
</RankCard>
```

**API**

| Attribute    | Description                                                   | Type        | Default |
| ------------ | ------------------------------------------------------------- | ----------- | ------- |
| hideTop3Rank | 隐藏前三 rank 数字，使用自定义类，替换成 rank 图片            | Boolean     | false   |
| hideTop3     | 隐藏前三，前三使用另外的 top3 组件                            | Boolean     | false   |
| className    | 榜单 card 样式，从蓝湖 copy，然后按照一定的格式排列，传到组件 | unknownProp |         |
| item         | 循环遍历的每一项，与平时写法一样                              | unknownProp |         |