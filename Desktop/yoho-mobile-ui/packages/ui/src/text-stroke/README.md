# text-stroke

- 解决直接加 text-stroke 属性后，会侵占原本数字的宽度，达不到 UI 效果问题

**Usage**

```html
<TextStroke
    :textStroke="menuType == index + 1 ? '0.025rem #9CFFFB' : '0.025rem #FFFB9C'"
  >
    <span :data-text="TOOL_TEXT[item.text]">{{ TOOL_TEXT[item.text] }}</span>
</TextStroke>
```

**API**

| Attribute  | Description      | Type   | Default      |
| ---------- | ---------------- | ------ | ------------ |
| textStroke | 描边的宽度和颜色 | String | 0.05rem #f40 |