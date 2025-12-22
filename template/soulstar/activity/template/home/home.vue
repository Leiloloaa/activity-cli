<template>
    <div class="home">

    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { fnGetInjectInfo } from '@components/developTool_TS';

const { TOOL_toast, TOOL_loading, TOOL_httpClient } = fnGetInjectInfo();


</script>

<style src="./home.scss" lang='scss' scoped />
