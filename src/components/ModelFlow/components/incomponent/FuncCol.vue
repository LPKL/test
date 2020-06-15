<!--
 * @author cuichuanwa
 * @date 19-9-18 下午2:01
 * @description 字段别名设置组件
 -->
<template>
  <div>
    <div class="colname">
      <div><h4>{{$t('labels.flow.featurerule_set')}}
        <el-button type="primary" size="mini" icon="el-icon-plus" circle  @click="add()"></el-button>
      </h4></div>
      <div v-for="(item, key) in dataList" :key="key">
        <p>
          <el-input v-model.trim="dataList[key][0]" :placeholder="$t('labels.flow.feature_col_name')"/>
          =
          <el-input v-model.trim="dataList[key][1]" :placeholder="$t('labels.flow.func_rule')"/>
          <el-button  @click="openRule(key)" style="margin-right: 10px">{{ $t('labels.flow.edit_rule')}}</el-button>
          <el-button type="danger" size="mini" icon="el-icon-minus" circle @click="del(key)"></el-button>
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
    name: 'FuncCol',
    props:{
      dataList: {type: Array, default: () => []}
    },
    data(){
      return {
        dialogLabelRule: false,
        textarea:"",
        ruleindex: null,
      }
    },
    updated() {
      this.$emit('callback', this.$props.dataList, this.$attrs.str)
    },
    methods:{
      add(){
        this.$props.dataList.push([])
      },
      del(index){
        this.$props.dataList.splice(index,1)
      },
      openRule(key){
        this.ruleindex = key
        this.dialogLabelRule = true
      },
      addRule(){
        this.$props.dataList[this.ruleindex][1] = this.textarea
        this.dialogLabelRule = false
      },
      close(){
        this.textarea = null
        this.ruleindex = null
        this.dialogLabelRule = false
      }
    }
  }
</script>

<style  rel="stylesheet/scss" lang="scss"  scoped>
  @import "src/assets/styles/colname.scss";
</style>
