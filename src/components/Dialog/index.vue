<!-- 简单dialog组件，适用于自定义格式的简单弹框，如删除确认弹框, 操作确认弹框等只有标题，信息，按钮的简单弹框 -->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :class="cssClasses">
    <div class="top">
      <svg-icon v-if="svgIconClassName !== null" :icon-class="svgIconClassName" :class="svgIconClassName"/>
      <span class="title">{{ title }}</span>
    </div>
    <div class="content">{{ message }}</div>
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="closeDialog">{{ $t('buttons.cancel') }}</el-button>
      <el-button class="confirm" type="primary" @click="onClick()">{{ $t('buttons.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * @props dialogKey @string 必填，key
 * @props isVisable @Boolean 必填，父组件控制dialog显示
 * @props cssClasses @string 非必需 默认new-base.scss全局样式中的信息dialog基本样式
 * @props svgIconClassName @string 非必需 title前显示图标icon
 * @props title @string 非必需
 * @props message @string 非必需
 */
export default {
  name: 'SimpleDialog',
  props: {
    dialogKey: {
      type: String,
      default: null
    },
    isVisable: {
      type: Boolean,
      default: null
    },
    cssClasses: {
      type: String,
      default: 'messageReminder' // 'delete是deletePeriodData'
    },
    svgIconClassName: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: null
    }
  },
  computed: {
    dialogVisible() {
      return this.isVisable
    }
  },
  methods: {
    onClick(val) {
      this.$emit('confirmClick', 'simple dialog confirm button Clicked') // 此处的参数纯为测试准备
    },
    closeDialog() {
      this.$emit('closeDialog', this.dialogKey)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";

</style>
