<template>
<div class="tab_text fc">
    <div class="shadow">{{ text }}</div>
    <div class="black_border">{{ text }}</div>
    <Outline 
        class="text"
        :color="`0.05rem #FEDE33`"
        :text="text"
    />
</div>
</template>

<script lang="ts" setup>
defineProps<{ text: string }>();
</script>

<style lang="scss" scoped>
@import '../scss/public_mixin.scss';
%text {
    text-align: center;
    // // font-family: "SF UI Text";
    font-size: 0.32rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}
.tab_text {
    position: relative;
    width: 100%;
    .shadow {
        -webkit-text-stroke-width: .08rem;
        -webkit-text-stroke-color: #046B7C;
        @extend %text;
        transform: translateY(.02rem);
    }
    .black_border {
        position: absolute;
        -webkit-text-stroke-width: .08rem;
        -webkit-text-stroke-color: black;
        @extend %text;
    }
    .text {
        @extend %text;
        color: #E02C11;
        position: absolute;
    }
}
</style>