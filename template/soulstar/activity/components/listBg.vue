<template>
    <stitchedBg v-bind="configBg">
        <div class="content">
            <slot></slot>
        </div>
    </stitchedBg>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import stitchedBg from "@activity-business/h5-package-stitchedBg";

const configBg = {
    domain: DOMAIN.H5_IMAGE_DOMAIN,
    projectName: <%- JSON.stringify(uiImg) %>,
    bgList: {
        top: { 
            imgName: '', 
            height: ''
        },
        center: { 
            imgName: '', 
            height: ''
        },
        bottom: { 
            imgName: '', 
            height: ''
        }
    }
}

</script>

<style lang="scss" scoped>
@use '../static/mixin.scss' as *;
.content {
    min-height: 7rem;
}
</style>
