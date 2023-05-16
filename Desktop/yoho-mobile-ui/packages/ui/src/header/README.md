# header

- 通常情况下，头图分为视频和动态 png 两种形式

**Usage**

```html
 <!-- 使用视频资源 -->
<Header videoSrc="..." videoPoster="..." video />

<!-- 使用 PNG 资源 -->
<Header src="..." />
```

**API**

| Attribute   | Description                                | Type        | Default |
| ----------- | ------------------------------------------ | ----------- | ------- |
| video       | 是否使用视频组件                           | Boolean     | false   |
| videoSrc    | 视频资源链接                               | String      |         |
| videoPoster | 视频预览资源链接，视频加载完之前显示的图片 | String      |         |
| src         | 图片链接                                   | String      |         |
| className   | 自定义类名                                 | unknownProp |         |