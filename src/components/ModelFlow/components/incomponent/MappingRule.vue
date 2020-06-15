<!--
 * @author cuichuanwa
 * @date 19-9-18 下午2:31
 * @description 字段别名设置组件
 -->

<template>
    <div class="colname">
      <div><h4>{{ $t('labels.flow.create_map')}} <el-button type="primary" size="mini" icon="el-icon-plus" circle  @click="add()"></el-button></h4></div>
      <div>
        <p v-for="(item, key) in list" :key="key">
          <el-input v-model.trim="list[key].yc" style="margin-right: 20px;"/>
          <el-radio v-model="list[key].y" :label="1">{{ $t('labels.flow.yconst')}}</el-radio>
          <el-radio v-model="list[key].y" :label="2">{{ $t('labels.flow.ynic')}}</el-radio>
          <el-input v-model.trim="list[key].yn"/>
          <el-button type="danger" size="mini" icon="el-icon-minus" circle @click="del(key)"></el-button>
        </p>
      </div>
    </div>
</template>

<script>
  export default {
    name: 'MappingRule',
    props:{
      list: {type: Array, default: _ => [{yc: null, y: null, yn: null}]}
    },
    updated() {
      this.$emit('callback', this.$props.list, 'label_rules')
    },
    methods:{
      add(){
        this.$props.list.push({yc: null, y: null, yn: null})
      },
      del(index){
        this.$props.list.splice(index,1)
      }
    }
  }
</script>

<style  rel="stylesheet/scss" lang="scss"  scoped>
  @import "src/assets/styles/colname.scss";
</style>
