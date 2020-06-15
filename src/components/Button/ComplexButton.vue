
<template>
  <el-button :icon="icon" :class="cssClasses" :disabled="disabled" plain @click="onClick">
    <svg-icon v-if="svgIconClassName !== null" :icon-class="defaultIconClass" :class="defaultIconClass"/>
    <svg-icon v-if="svgIconClassName !== null" :icon-class="hoverIconClass" :class="hoverIconClass"/>
    <svg-icon v-if="svgIconClassName !== null" :icon-class="activeIconClass" :class="activeIconClass"/>
    <span style="vertical-align: super;"><slot/></span>
  </el-button>
</template>

<script>
/**
 * 复杂按钮组件，支持按钮点击状态变化致icon图标变更，若扩展得当，可推广为全局组件，便于复用
 * @props type @string 非必需 默认
 * @props disabled @boolean 非必需 默认false
 * @props icon @string 无需点击状态变化的按钮内icon图标
 * @props cssClasses @string 非必需 class
 * @props svgIconClassName @string 非必需 与前缀default_/hover_/active_进行组合后符合icon文件中的图标明年初
 */
export default {
  name: 'ComplexButton',
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    cssClasses: {
      type: String,
      default: null
    },
    svgIconClassName: {
      type: String,
      default: null
    }
  },
  // data() {
  //   return {
  //   }
  // },
  computed: {
    defaultIconClass() {
      return 'default_' + this.svgIconClassName
    },
    hoverIconClass() {
      return 'hover_' + this.svgIconClassName
    },
    activeIconClass() {
      return 'active_' + this.svgIconClassName
    }
  },
  methods: {
    onClick(val) {
      this.$emit('click', 'complexButton Clicked') // 此处的参数纯为测试准备，并未真正使用
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
  $cpadd:10px;
  $padleft: 20px;
  .app_container{
    .svgIconBase {
      [class*='default_'] {
        display: inline-block;
      }
      [class*='hover_'] {
        display: none;
      }
      [class*='active_'] {
        display: none;
      }
      &:hover {
        [class*='default_'] {
          display: none;
        }
        [class*='hover_'] {
          display: inline-block;
        }
        [class*='active_'] {
          display: none;
        }
      }
      &:active {
        [class*='default_'] {
          display: none;
        }
        [class*='hover_'] {
          display: none;
        }
        [class*='active_'] {
          display: inline-block;
        }
      }
    }
    .is-disabled {
      &:hover {
        [class*='default_'] {
          display: inline-block;
        }
        [class*='hover_'] {
          display: none;
        }
        [class*='active_'] {
          display: none;
        }
      }
      &:active {
        [class*='default_'] {
          display: inline-block;
        }
        [class*='hover_'] {
          display: none;
        }
        [class*='active_'] {
          display: none;
        }
      }
    }
    .plainButton.is-plain {
      background-color: #fff;
      padding: 0px 0px;
      [class*='default_'], [class*='hover_'], [class*='active_'] {
        width: 32PX;
        height: 32PX;
      }
    }
    .borderButton.is-plain{
      [class*='default_'], [class*='hover_'], [class*='active_'] {
        width: 24PX;
        height: 24PX;
      }
      width: 96px;
      height: 24px;
      margin-top: 16px;
      // margin-bottom: 16px;
      border-radius: 14px;
      border: 1px solid #6484d4;
      background-color: #fff;
      padding-top:1px;
      padding-left: 3px;
      &:hover {
        background-color: #ecf0fa;
        color: #6484d4;
      }
      &:active {
        border-color: #0f32b5;
        background-color: #ecf0fa;
        color: #0f32b5;
      }
    }
    .borderButton.is-disabled {
      width: 96px;
      height: 24px;
      border-radius: 14px;
      color: #999999;
      border: 1px solid #b7b7b7;
      background-color: #fff;
      &:hover {
        border-color: #b7b7b7;
        background-color: #fff;
        color: #999999;
      }
      &:active {
        border-color: #b7b7b7;
        background-color: #fff;
        color: #999999;
      }
    }
  }
</style>
