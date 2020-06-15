<!--
 * @author cuichuanwa
 * @date 20-5-7 下午3:13
 * @description
   传值说明
    condition： model 必填
    heads：表头显示标题 必填
    headsType: 每个选项的类型 目前只有select, input 必填
    columns： select 供选择的项 必填
    keys: condition 必填

    oneCols: 第一列是否已经被占用 存在则代表被占用需要显示第一列的位置供选择 选择值之后condition第一个字段值被修改 可选
    relat: 关系 todo 未做 可选
 -->
<template>
  <el-table
    :data="condition"
    height="250"
    style="width: 100%">
      <el-table-column v-for="(fitem, fkey) in heads" :key="fkey" :label="fitem" align="center" >
        <template slot-scope="scope">
          <span v-if="oneCols && fkey == 0">
            <el-select placeholder="关系" clearable v-model="condition[scope.$index][keys[fkey]]">
              <el-option v-for="(item,index) in oneCols" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </span>
          <span v-else-if="headsType[fkey] == 'select'">
            <el-select :placeholder="$t('strings.flow.target_column')" clearable v-model="condition[scope.$index][keys[fkey]]">
              <el-option v-for="(item,index) in columns[cselect[fkey]]" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </span>
          <span v-else-if="headsType[fkey] == 'input'">
            <el-date-picker v-if="condition[scope.$index]['field'] === 'time'"
                            v-model="condition[scope.$index]['value']"
                            type="datetime"
                            placeholder="选择日期时间"> <!--- 进行的特殊处理 --->
            </el-date-picker>
            <el-input v-else v-model="condition[scope.$index][keys[fkey]]"></el-input>
          </span>
        </template>
      </el-table-column>
    <el-table-column  width="120" align="center" >
      <template slot-scope="scope" >
        <span>
           <el-button icon="el-icon-plus" circle @click="plusCondition" size="mini"></el-button>
           <el-button icon="el-icon-minus" circle @click="minusCondition(scope.$index)" size="mini"></el-button>
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'TableSet',
  props:{
    condition:{
      type: Array,
      required: true
    },
    heads: {
      type: Array,
      required:true
    },
    oneCols: {
      type: Array,
      default: () => null
    },
    headsType: {
      type: Array,
      required:true
    },
    columns: {
      type: Array,
      required:true
    },
    cselect: {
      type: Array,
      required:true
    },
    keys: {
      type: Array,
      required:true
    },
    relat: { type: Object, default: () => { field: 'value' }}
  },
  watch: {
    '$props.condition': {
      handler: function(newer){
        this.$emit('call', newer)
      },
      deep: true
    }
  },
  methods: {
    //添加条件
    plusCondition(){
      const keys = this.$props.keys
      const oneCols = this.$props.oneCols
      let temp = {}
      for (let i = 0, l = keys.length; i < l; i++) {
        if(oneCols && i === 0){
          temp[keys[i]] = oneCols[i]
        } else {
          temp[keys[i]] = ''
        }
      }
      this.$props.condition.push(temp)
    },
    // 删除条件
    minusCondition(index){
      this.$props.condition.splice(index,1)
      const keys = this.$props.keys
      const oneCols = this.$props.oneCols
      let temp = {}
      if(this.$props.condition.length < 1){
        for (let i = 0, l = keys.length; i < l; i++) {
          if(oneCols && i === 0){
            temp[keys[i]] = oneCols[i]
          } else {
            temp[keys[i]] = ''
          }
        }
        this.$props.condition.push(temp)
      }
    }
  }
}
</script>

