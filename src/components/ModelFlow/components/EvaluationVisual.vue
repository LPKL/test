<template>
    <el-tabs type="card" v-model="pgTable" style="min-height: 400px">
      <div v-for="(item,key) in datalist" :key="key">
        <el-tab-pane v-if="item.type==='table'" :label="item.title" :name="key.toString()">
          <div class="pgTable">
            <ul><li v-for ="(item,key) in pgTableHeader" :key="key">{{ item }}</li></ul>
            <ul v-for="(value, key) in item.value" :key="key"><li>{{ key }}</li><li> {{ value }}</li></ul>
          </div>
        </el-tab-pane>
        <el-tab-pane v-else-if="item.type==='confusion_matrix'" :label="item.title" :name="key.toString()">
          <div class="matrix" >
            <p v-for="value in item.value">
              <span v-for="(val,k) in value" :key="k">{{val}}</span>
            </p>
          </div>
        </el-tab-pane>
        <el-tab-pane v-else :label="$t('strings.flow.charts')" name="3">
          <p style="text-align: center">{{ $t('strings.flow.none') }}</p>
        </el-tab-pane>
      </div>
    </el-tabs>
</template>

<script>
  export default {
    name: 'EvaluationVisual',
    props:{
      lists:{
        type:Array,
        default: null
      },
      tableHeader:{
        type:Array,
        default: ()=>{ return ["指标", "值"] }
      }
    },
    data(){
      return{
        pgTableHeader: ['指标','值'],//评估表头
        pgTable:'0',
        datalist: []
      }
    },
    watch:{
      '$props.lists':{
        handler:function(newer,older){
          this.datalist  = newer
        },
        deep:true
      },
      '$props.tableHeader':{
        handler:function(newer,older){
          this.pgTableHeader  = newer
        },
        deep:true
      }
    },
    mounted(){
      this.datalist  = this.$props.lists
      this.pgTableHeader = this.$props.tableHeader
    }
  }
</script>

<style  rel="stylesheet/scss" lang="scss" scoped>
  $pgBorder:#e4e7ed;
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
        text-align: center;
        border-bottom: 1px solid $pgBorder;
      }
    }
    /deep/ .el-table{
      margin: 0 20px;
    }
  }
  .matrix{
    display: inline-block;
    width: 100%;
    max-height: 500px;
    overflow: auto;
    p{
      white-space: nowrap;
      &:first-child span{
        border-bottom: 1px solid $pgBorder;
      }
      margin: 0;
    }
    span{
      background-color: #bbb;
      &:first-child{
        border-right: 1px solid $pgBorder;
      }
      padding:20px 10px;
      min-width: 13%;
      display: inline-block;
      text-align: center;
    }
  }
</style>
