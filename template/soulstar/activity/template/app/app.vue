<template>
    <div class="wrap">
        <h2>[soulstar-activity-h5] 项目模板</h2>
        <RouterView />
    </div>
</template>
<script lang="ts" setup>
import { watchEffect } from 'vue';
import { fnGetInjectInfo } from '@components/developTool_TS';

const {TOOL_toast, TOOL_loading, TOOL_httpClient, TOOL_TEXT} = fnGetInjectInfo();

//  html title
watchEffect(()=> document.title = TOOL_TEXT[1] || 'Loading...');

</script>

<style src="./app.scss" lang='scss' scoped />
<!-- 如果需要可此处设置全局通配样式 -->
<style lang='scss'>
// 修改 html font-size 等等

</style>