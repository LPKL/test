<template>
  <el-container >
    <div width="100%">
      <span @click="$router.go(-1)" class="el-icon-arrow-left"></span>
      <span>{{ $route.query.name }}</span>
      <div class="op-right" >
        <el-button v-if="$attrs.rlen" type="primary" size="mini" @click="reset">撤销</el-button>
        <el-button v-else :type="''" disabled size="mini">撤销</el-button>
        <el-button type="primary" style="margin-right: 20px;" size="mini" :loading="$attrs.save_loading" @click="save">保存</el-button>
      </div>
    </div>
  </el-container>
</template>

<script>
import rules from '@/utils/rules'

export default {
  name: 'PanelTopOption',
  data() {
    return {
      rules: {
        name: rules.project_zname
      }
    }
  },
  methods: {
    reset(){
      this.$emit('reset')
    },
    save(){
      this.$emit('save')
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  $iconColor: #419cfa;
  .el-container{
    background-color: #fff;
    position: relative;
    &>div{
      &:first-child{
        .el-select{
          margin-right: 10px;
        }
        line-height: 60px;
      }
      i{
        color: $iconColor;
        font-weight: bold;
        cursor: pointer;
        font-size: 18px;
        &:hover{
          color: rgba($iconColor,0.8);
        }
        &.el-icon-l{
          cursor: default;
          transform: rotate(90deg);
          opacity: 0;
          &:hover{
            color: $iconColor;
          }
        }
      }
    }
    .op-right{
      position: absolute;
      right: 0;
      line-height: 60px;
      top: 0;
    }
    .svg-add,.svg-set,.svg-next{
      cursor: pointer;
      font-size: 22px;
      position:relative;
      top: 6px;
    }

  }

</style>
