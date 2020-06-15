<template>
  <div v-cloak id="app">
    <router-view/>
  </div>
</template>

<script>
export default{
  name: 'App',
  created() {
    // 在页面刷新时将vuex里的信息保存到sessionStorage里
    if (sessionStorage.getItem('store') && this.$store.getters.token) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('store'))))
    }
    window.addEventListener('beforeunload', () => {
      // 清空互斥
      this.$store.dispatch('mutex/clear')
      if (sessionStorage.getItem('islogout')) {
        sessionStorage.removeItem('islogout')
        return
      }
      sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    })
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
@import "./assets/styles/new-base.scss";
// @import '../static/font/font.css';
[v-cloak] {
  display: none;
}
// 字体
// sy_normal：正常粗细
// sy_regular：加粗
// sy_light：细体
#app {
  // font-family: sy_normal;
  font-family: Helvetica, Tahoma, Arial, "Microsoft YaHei", "微软雅黑", STXihei, "华文细黑", SimSun, "宋体", Heiti, "黑体", sans-serif;
}
::-webkit-scrollbar-thumb {
  border-radius: 5px!important;
  background-color: #ccc!important;
}
// 上方文字提示
.el-tooltip__popper {// 其他地方要用到原始样式 这里设置全局的不合理 可以设置effect="dark" 时改变dark时的默认颜色
  // border: 1px solid #ccc;
  // top: 145px!important;
  /*background-color: #021f5a!important;*/
  /*color: #ffffff!important;*/
  /*.popper__arrow {*/
  /*  // border-top-color: #ccc;*/
  /*  border-top-color: transparent!important;*/
  /*  &::after {*/
  /*    border-top-color: #021f5a!important;*/
  /*  }*/
  /*}*/
}
// 下拉框的问题
.el-select-dropdown {
  // top: 133px!important;
  border-radius: 8px;
   .el-scrollbar {
    .el-select-dropdown__wrap {
      .el-select-dropdown__list {
        .el-select-dropdown__item {
          span {
            font-size: 13px;
          }
          &:hover {
            background-color: #ecf0fa!important;
            color: #3d65c9!important;
          }
        }
        .selected {
          color: #3d65c9;
          font-weight: 600;
        }
        .el-addName {
          .el-input {
            width: 110px;
            display: inline-block;
            margin-left: 10px;
            .el-input__inner{
              width: 110px;
              height: 32px;
            }
          }
          .el-button {
            padding: 0;
            span {
              color: #2b5bd6;
              &:hover {
                color: #2b5bd6;
              }
              &:active {
                color: #123ecc;
              }
            }
          }
          .save {
            margin-left: 0;
          }
        }
        .el-addSchemaBtn {
          margin-left: 20px;
          color: #2b5bd6;
          &:hover {
            color: #2b5bd6;
          }
          &:active {
            color: #123ecc;
          }
        }
      }
    }
  }
}
// 添加数据源的下拉框
.el-dropdown-menu {
  border-radius: 8px;
  .el-dropdown-menu__item {
    &:hover {
      background-color: #ecf0fa!important;
      color: #3d65c9!important;
    }
  }
}
.el-field_dropdown {
  top: 135px!important;
}
// 删除时的文案提示
.el-message-box__wrapper {
  .el-message-box {
    padding: 24px 28px;
    .el-message-box__header {
      padding: 0;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #999;
      .el-message-box__title {
        color: #333;
        font-size: 18px;
        padding-left: 12px;
      }
      .el-message-box__headerbtn {
        display: none;
      }
    }
    .el-message-box__content {
      padding: 0;
      padding-top: 16px;
      padding-left: 28px;
      .el-message-box__message {
        font-size: 16px;
        color: #333;
      }
    }
    .el-message-box__btns {
      padding-top: 30px;
      .el-button {
        width: 64px;
        height: 28px;
        border-radius: 8px;
        padding: 0;
        span {
          font-size: 14px!important;
        }
      }
      button:nth-child(2) {
        background-color: #3d65c9;
        color: #fff;
        &:hover {
          background-color: #0f32b5;
        }
      }
      button:nth-child(1) {
        background-color: #e6e6e6;
        color: #333;
        border: none;
      }
    }
  }
}
// 以下解决el-table 表头和表体竖边框错位问题
body .el-table th.gutter{
  display: table-cell!important;
}
.el-table__header-wrapper{
  border-top: 1px solid #ebeef5
}
.el-table .caret-wrapper {
  height: 38px;
 }
 .el-menu--vertical {
  .el-menu--popup {
    min-width: auto;
    padding: 0!important;
    margin-left: 2px!important;
  }
  ul {
    li {
      float: left;
      display: block;
      width: 40px!important;
      height: 40px;
      padding-left: 9px!important;
      line-height: 40px;
      span {
        display: none;
      }
      .el-normal {
        display: inline-block;
        width: 20px;
        height: 20px;
      }
      .el-active {
        display: none;
        width: 20px;
        height: 20px;
      }
      &:hover {
        .el-normal {
          display: none;
          width: 20px;
          height: 20px;
        }
        .el-active {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
    }
    li:nth-of-type(1) {
      border-right: 1px solid #f2f2f2;
    }
    li:nth-of-type(2) {
      border-right: 1px solid #f2f2f2;
    }
  }
 }
//  时间下拉框
.el-time-panel {
  width: 120px;
}

// 自定义下拉框
.el-select-dropdown.el-popper.rich-el-options{
    .el-select-dropdown__list{
      min-width: 246px;
    .rich-options-header{
      position: absolute;
      left: 0;
      top: 0;
      z-index: 9999;
      padding: 14px 20px 14px 20px;
      width: 100%;
      background: #ffffff;
      white-space: nowrap;
      overflow: hidden;
    }
    .option-label{
      float:left;
      margin-right: 1em;
      max-width: 400px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .option-label-type {
      float: right;
      color: #8492a6;
      font-size: 13px
    }
  }
}
.el-select-dropdown.el-popper.rich-options-filters{
  .el-select-dropdown__list{
    padding-top:48px!important;
  }
}
</style>
