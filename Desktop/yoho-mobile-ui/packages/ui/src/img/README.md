# img

- 将 yoho 活动常用到的两种图片标签形式集成
- 对于固定图片可以通过传 type

**Usage**

old Usage
- 使用 cdnImg 组件，加载头像、礼物等
- 使用 img 标签，加载图片、金币、银币、live 标识图片等

```html
<div class="avatar-wrap fc" v-jump="item">
    <cdnImg :fid="item.avatar" />
    <div class="live" v-if="item?.liveStatus">
      <img
        class="live-wave"
        src="//image.waka.media/activity/202007_nationalDay/liveIcon.png"
      />
    </div>
</div>
```

new Usage
```html
<!-- 加载 dashboard 头像、礼物 -->
 <Img :fid="'wakam/3011422bce1a9d2380553cecc78829a1'" className="gift" />

<!-- 固定图片 传 Type -->
<Img type="success" />
<Img type="fail" />
<!-- 金币图 -->
<Img type="coin" className="coin" /> 
<!-- 动态 live 标识图 -->
<Img type="live" className="live" />

<!-- 普通图片，前缀会根据项目配置项自动获取，也可以传完整的地址 -->
<Img src="coin.png" className="coin" />
<Img src="https://image.waka.media/activity/gold.coin" className="coin" />
    
<div class="avatar-wrap fc" v-jump="item">
    <Img :fid="item.fid" className="avatar" />
    <div v-if="item?.liveStatus">
      <Img type="live" className="live" />
    </div>
</div>
```

**API**

| Attribute    | Description                                         | Type                                  | Default |
| ------------ | --------------------------------------------------- | ------------------------------------- | ------- |
| type         | 固定图片类型                                        | "success"\|"fail"\|"live"\|"coin"\|"" |         |
| src          | Src 链接地址                                        | String                                |         |
| fid          | Fid 链接地址                                        | String                                |         |
| className    | 图片样式，传入样式                                  | unknownProp                           |         |
| defaultImg   | 传入了 fid，但是 fid 为空地址为空时，会转为默认图片 | String                                |         |
| domainPrefix | 图片路径前缀                                        | String                                |         |
| m            | 图片是否压缩，默认压缩，获取失败后转为不压缩        | String                                | fill    |