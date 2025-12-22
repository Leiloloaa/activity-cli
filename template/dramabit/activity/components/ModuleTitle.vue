<template>
    <div class="module_title">
        <svg class="decorate" width="156" height="5" viewBox="0 0 156 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M155.036 2.37891L149.861 4.75781L144.686 2.37891L149.861 0L155.036 2.37891ZM142.196 2.37891L138.41 4.11914L137.855 3.50391L0 2.37891L137.829 1.28223L138.41 0.638672L142.196 2.37891Z" fill="url(#paint0_linear_65_5077)"/>
            <defs>
                <linearGradient id="paint0_linear_65_5077" x1="0" y1="2.37891" x2="155.036" y2="2.37891" gradientUnits="userSpaceOnUse">
                    <stop offset="0.133445" stop-color="#622B22" stop-opacity="0"/>
                    <stop offset="0.218579" stop-color="#632B22"/>
                    <stop offset="1" stop-color="#682D23"/>
                </linearGradient>
            </defs>
        </svg>
        <div class="text">
            <slot />
        </div>
        <svg class="decorate" width="156" height="5" viewBox="0 0 156 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 2.37891L5.1748 4.75781L10.3506 2.37891L5.1748 0L0 2.37891ZM12.8398 2.37891L16.626 4.11914L17.1807 3.50391L155.036 2.37891L17.207 1.28223L16.626 0.638672L12.8398 2.37891Z" fill="url(#paint0_linear_65_5081)"/>
            <defs>
                <linearGradient id="paint0_linear_65_5081" x1="155.036" y1="2.37891" x2="0" y2="2.37891" gradientUnits="userSpaceOnUse">
                    <stop offset="0.133445" stop-color="#622B22" stop-opacity="0"/>
                    <stop offset="0.218579" stop-color="#632B22"/>
                    <stop offset="1" stop-color="#682D23"/>
                </linearGradient>
            </defs>
        </svg>

    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
@import '../scss/public_mixin.scss';
.module_title {
    width: 100%;
    @extend %fc;
    gap: .13rem;
    .decorate {
        width: 1.55rem;
        height: .047rem;
    }
    .text {
        color: #FF6838;
        // font-family: "SF UI Text";
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        text-align: center;
        // white-space: nowrap;
    }
}
</style>