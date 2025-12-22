<template>
    <div class="coming_soon">Coming Soon</div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
@import '../scss/public_mixin.scss';
.coming_soon {
    @extend %fc;
    @include bg('coming_soon');
    width: 5.96rem;
    height: 4.06rem;
    flex-shrink: 0;
    color: rgba(255, 234, 127, 0.60);
    text-align: center;
    font-family: Alexandria;
    font-size: 0.5rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}
</style>