<!--
 * @author cuichuanwa
 * @date 19-9-18 下午2:31
 * @description 字段别名设置组件
 -->

<template>
    <div class="colname">
      <div><h4>{{$t('strings.flow.col2name')}} <el-button type="primary" size="mini" icon="el-icon-plus" circle  @click="add()"></el-button></h4></div>
      <div>
        <p v-for="(item, key) in dataList" :key="key">
          <el-input :value="key | keychange(dataList)" @load="nameChange(key)" disabled />
          <el-select v-model="dataList[key][1]" :placeholder="$t('labels.select')">
            <el-option
              v-for="(v,i) in selects"
              :key="i"
              :label="v"
              :value="v"
              auto-complete="on">
            </el-option>
          </el-select>
          <el-button type="danger" size="mini" icon="el-icon-minus" circle @click="del(key)"></el-button>
        </p>
      </div>
    </div>
</template>

<script>
  export default {
    name: 'ColName',
    props:{
      selects:{type:Array,default: () => []},
      dataList: {type: Array, default:() => []}
    },
    filters: {
      // 当字段别名更改时
      keychange(key,list) {
        const a = 'x' + (key+1)
        list[key][0] = a
        return a
      }
    },

    updated() {
      this.$emit('callback', this.$props.dataList, this.$attrs.str)
    },
    methods:{
      add(){
        const list = this.$props.dataList
        const len = list.length+1
        list.push(['x'+len,null])
      },
      del(index){
        this.$props.dataList.splice(index,1)
      },
      nameChange(index){
        this.dataList[index][0]= 'x'+(index+1)
      }
    }
  }
</script>

<style  rel="stylesheet/scss" lang="scss"  scoped>
  @import "src/assets/styles/colname.scss";
</style>
