<!--矩阵图表(比如：混淆矩阵,协防差矩阵,皮尔森系数矩阵等使用)-->
<template>
  <div :style="'height:'+height" class="matrix" >
    <p v-for="(value,key) in alldata" :key="key">
      <span v-for="(val,k) in value" :key="k" :title="val">{{ val }}</span>
    </p>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'MatrixView',
  props: {
    tableData: {
      type: Array,
      default: null
    },
    prex: {
      type: Array,
      default: null
    },
    height: {
      type: String,
      default: '400px'
    },
    isConcat: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // tableData: [
      //   [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]
      // ],
      // prex: ['好人啊', '好人啊', '好人啊', '好人啊'],
      alldata: []
    }
  },
  created() {
    if (this.$props.isConcat) {
      const temp = this.prex.map((item, key) => {
        this.$props.tableData[key].unshift(item)
        return this.$props.tableData[key]
      })
      const a = _.clone(this.$props.prex)
      a.unshift(this.$t('strings.placeholder'))
      temp.unshift(a)
      this.alldata = temp
    } else {
      this.alldata = this.$props.tableData
    }
  }
}
</script>
<style  rel="stylesheet/scss" lang="scss" scoped>
  $pgBorder:#ccc;
  .matrix{
    display: inline-block;
    width: 100%;
    padding:10px;
    overflow: auto;
    p{
      display: flex;
      white-space: nowrap;
      &:first-child span{
        border-bottom: 1px solid $pgBorder;
        &:first-child {
          color: #ffffff;
        }
      }
      margin: 0;
    }
    span{
      background-color: #fff;
      &:first-child{
        min-width: 150px;
        white-space: nowrap;
        border-right: 1px solid $pgBorder;
      }
      &:nth-child(even){
        background-color: #f4f4f4;
      }
      padding:20px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      text-align: center;
      flex: 1;
    }
  }
</style>
