<!--- 流程节点日志输出组件 -->
<template>
  <div style=" min-height:200px ">
    <p v-for="(item,index) in list" :key="index">{{ item.toString() }}</p>
  </div>
</template>
<script>
export default {
  name: 'LogPreviewList',
  props: {
    list: {
      type: Array,
      default: null
    }
  }
}
</script>

<style scoped>

</style>
