<template>
  <div class="header">
    <OssImg
      :src="`head${TOOL_countryCode === 'TW' ? '' : ''}`"
      class="header_img"
    >
      <OssImg
        v-if="router.currentRoute.value.path.startsWith('/home')"
        src="rule-btn"
        @click="router.replace('/rule')"
        class="rule fc"
      >
        <span>{{ TOOL_TEXT[3] }}</span>
      </OssImg>
      <OssImg
        v-else
        src="rule-btn"
        @click="router.replace('/home')"
        class="rule fc"
      >
        <span>{{ TOOL_TEXT[4] }}</span>
      </OssImg>
    </OssImg>
  </div>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
import { useRouter } from "vue-router";
const { TOOL_TEXT, TOOL_countryCode } = injectTool();
const router = useRouter();
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  .header_img {
    width: 7.5rem;
    height: 12.78rem;
    img {
      width: 100%;
      object-fit: contain;
    }
    .rule {
      position: absolute;
      top: 6.96rem;
      right: 0;
      width: 1.15rem;
      height: 0.48rem;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline-start: 0.2rem;
      span {
        text-align: center;
        font-family: Arial;
        font-size: 0.2rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.2rem; /* 100% */
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
  }
}
</style>
