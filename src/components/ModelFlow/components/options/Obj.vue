<!-- 数据实验显示object数据-->
<template>
    <div class="pgTable">
      <ul><li>Key</li><li>Value</li></ul>
      <ul v-for="(value, key) in data"><li>{{ key }}</li><li> {{ value.toString() }}</li></ul>
    </div>
</template>
<script>
  export default {
    props:{
      data:{type:Object, default:null}
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
      li{
        display: inline-block;
        width: 50%;
        padding: 10px;
        word-break:break-all;
        text-align: left;
        border-bottom: 1px solid #e4e7ed;
        border-left: 1px solid #e4e7ed;
        &:first-child{
          border-left: none;
        }

      }
    }
  }
</style>

