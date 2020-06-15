
<template>
  <el-button :class="cssClasses" :disabled="disabled" :size="size" plain @click="onClick">
    <slot/>
  </el-button>
</template>

<script>
/**
 * 简单按钮组件
 * @props type @string 非必需
 * @props size @string 非必需
 * @props disabled @boolean 非必需 默认false
 */
export default {
  name: 'CommonButton',
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'small'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick(val) {
      this.$emit('click', 'commonButton Clicked') // 此处的参数纯为测试准备，并未真正使用
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";

</style>
