<template>
  <div v-if = "optiond.type">
    <div v-if = "optiond.type === 'Data'">
      <component  :is = "optiond.type" :data = "optiond.data" :nodename="optiond.nodename" :sqlargs="optiond.sqlargs" v-on:resetSqlArgs="newSqlArgs"/>
    </div>
    <div v-else>
      <component  :is = "optiond.type" v-bind="$attrs" :data = "optiond.data"/>
    </div>
  </div>
</template>
<script>
import Data from './options/Data'　//　历史数据流程和实时流程数据节点点击时显示节点数据
import ParameterItem from './options/ParamItem'　//　历史数据流程方法节点点击时显示参数输入
// 　实时流程点击数据节点时引入的组建
import Obj from './options/Obj'　//　实时流程算法模型点击显示组建
import Plan from './options/Plan'　//　实时流程预处理模型点击显示操作记录
export default{
  name: 'Option',
  components:{ Data, ParameterItem, Obj, Plan },
  props:{
   optiond:{
    type:Object,
    default:null
   }
  },
  methods: {
    newSqlArgs(args) {
      this.$emit("newSqlArgs", args)
    }
  }
}
</script>
