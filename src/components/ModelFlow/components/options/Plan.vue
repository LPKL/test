<!-- todo 旧组件 目前未用到-->
<template>
    <div class="pgTable">
      <ul><li>{{ $t('strings.flow.operation_records') }}</li></ul>
      <!--<ul><li>{{data}}</li></ul>-->
      <ul v-for="(value, key) in data" ><li ><strong>{{key+1}}: </strong>{{value}}</li></ul>
    </div>
</template>
<script>
  export default {
    props:{
      data:{type:Array, default:null}
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .pgTable{
    ul{
      list-style: none;
      width: 100%;
      padding: 0;
      margin: 0;
      display: table;
      li{
        display:table-cell;
        width: 50%;
        padding: 10px;
        word-break:break-all;
        text-align: left;
        line-height: 20px;
        border-bottom: 1px solid #e4e7ed;
        border-left: 1px solid #e4e7ed;
        &:first-child{
          border-left: none;
        }

      }
    }
  }
</style>

