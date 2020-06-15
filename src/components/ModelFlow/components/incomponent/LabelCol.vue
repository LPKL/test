<!--
 * @author cuichuanwa
 * @date 19-9-18 下午2:01
 * @description 字段别名设置组件
 -->
<template>
  <div>
    <div class="colname">
      <div><h4>{{ $t('labels.flow.create_label')}} <el-button type="primary" size="mini" icon="el-icon-plus" circle  @click="add()"></el-button></h4></div>
      <div v-for="(item, key) in dataList" :key="key">
        <div> <span style="margin: 0 10px;font-weight:bold;">{{$t('labels.label') + (key+1) + $t('labels.label_colname')}}</span><el-input v-model.trim="item.name" /><el-button type="primary" size="mini" icon="el-icon-plus" circle  @click="add2(key)"></el-button><el-button type="danger" size="mini" icon="el-icon-minus" circle @click="del(key)"></el-button></div>
        <p v-for="(it, k) in item.condition" :key="k">
          <span style="font-weight:bold;display: inline-block;width: 80px;text-align: right;padding-right: 10px;"> {{ k > 0 ? 'else if':'if'}} </span>
          <el-input v-model.trim="item.condition[k][0]" :placeholder="$t('labels.flow.func_rule')"/>
          <el-button  @click="openRule(key,k)" style="margin-right: 10px">{{ $t('labels.flow.edit_rule')}}</el-button>
          <el-input v-model.trim="item.condition[k][1]" :placeholder="$t('labels.label_const')"/>
          <el-button type="danger" size="mini" icon="el-icon-minus" circle @click="del2(key,k)"></el-button>
        </p>
        <p v-if="item.condition.length > 0">
          <span style="font-weight:bold;display: inline-block;width: 80px;text-align: right;padding-right: 10px;"> else </span>
          <el-input  disabled :placeholder="$t('labels.flow.func_rule')"/>
          <el-button disabled style="margin-right: 10px">{{ $t('labels.flow.edit_rule')}}</el-button>
          <el-input v-model.trim="dataList[key].else" :placeholder="$t('labels.label_const')"/>
        </p>
      </div>
    </div>
    <!--label_rules常值标签函数弹框-->
    <el-dialog
      :title="$t('labels.flow.edit_rule')"
      :visible.sync="dialogLabelRule"
      :before-close="close"
      :close-on-click-modal="false"
      width="50%" append-to-body>
      <template>
        <el-input
          type="textarea"
          :rows="4"
          :placeholder="$t('labels.input')"
          v-model.trim="textarea">
        </el-input>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLabelRule = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="addRule">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  export default {
    name: 'LabelCol',
    props:{
      dataList: {type: Array, default: () => []}
    },
    data(){
      return {
        dialogLabelRule: false,
        textarea:"",
        ruleindex: [],
        elseValue: []
      }
    },
    updated() {
      this.$emit('callback', this.$props.dataList, this.$attrs.str)
    },
    methods:{
      add(){
        this.$props.dataList.push({name:'',condition:[[null,null]],else: null})
      },
      del(index){
        this.$props.dataList.splice(index,1)
      },
      add2(index){
        this.$props.dataList[index].condition.push([null,null])
      },
      del2(index,m){
        this.$props.dataList[index].condition.splice(m,1)
      },
      openRule(key,index){
        this.ruleindex = [key,index]
        this.dialogLabelRule = true
      },
      addRule(){
        this.$props.dataList[this.ruleindex[0]].condition[this.ruleindex[1]][0] = this.textarea
        this.dialogLabelRule = false
      },
      close(){
        this.textarea = null
        this.ruleindex = []
        this.dialogLabelRule = false
      }
    }
  }
</script>

<style  rel="stylesheet/scss" lang="scss"  scoped>
  @import "src/assets/styles/colname.scss";
</style>
