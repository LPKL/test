<!-- 实时检测中选择图表时使用
  "columns", 多选穿梭框
  "lists",  多选checkbox
  "list",  单选列表
  "bool",  True or False 单选
  "value",  input输入 可选类型
  "filter"  筛选控件(算法筛选时使用)
  "inputlist"多值输入组件
  "boolsinput" 缺失值异常值处理组建
-->
<template>
  <el-form ref="paramForm" :inline="true" v-model="paramForm" >
    <template v-for="(item,index) in paramForm.args" >
      <el-form-item v-if="item.arg_type==='bool' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-radio-group v-model="paramForm.args[index].arg_value" size="mini">
          <el-radio label="True"/>
          <el-radio label="False"/>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='number' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-input-number v-model="paramForm.args[index].arg_value" :precision="1" :step="0.1" :max="10" :placeholder="item.arg_zname"/>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='value' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-input v-model="paramForm.args[index].arg_value" :placeholder="item.placeholder" @blur="inputChange(item,index)" :style="item.arg_style || ''"/>
        <!--<el-tooltip class="item" :content="item.arg_doc" effect="light" placement="top-start">-->
        <!--<i class="el-icon-info"></i>-->
        <!--</el-tooltip>-->
      </el-form-item>
      <el-form-item v-if="item.arg_type==='lists' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-checkbox-group v-if="paramForm.args[index].arg_value" v-model="checkbox.value=paramForm.args[index].arg_value" size="mini" @change="radioClick(index,paramForm.args[index].arg_value)">
          <el-checkbox v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" :key="key" :label="it" >{{ it }}</el-checkbox>
        </el-checkbox-group>
        <el-checkbox-group v-else v-model="checkbox.value" size="mini" @change="radioClick(index,paramForm.args[index].arg_value)">
          <el-checkbox v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" :key="key" :label="it" >{{ it }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='boolsinput' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-radio-group v-model="radio.value" @change="radio2Click(index)">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-radio v-if="it==='add_number'" :key="key" :label="it" style="display: block;margin:0 0 20px 0;line-height: 36px;">
              {{ $t('strings.flow.filling') }} <el-input ref="tcNum" v-model.number="tcNumber" style="width:150px;margin:0 10px 0 20px;display: none;"/>
            </el-radio>
            <el-radio v-else :key="key" :label="it" style="margin:5px 10px 5px 0;">{{ it }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='list' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-select v-model="paramForm.args[index].arg_value" :placeholder="item.placeholder" clearable @change="listChange(item)">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-option :key="key" :label="it" :value="it"/>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='columns' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-button type="primary" size="mini" @click="handleOpen(index)" >
          {{ paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length + $t('strings.be_selected') : $t('strings.select_field') }}
        </el-button>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='filter' && !item.arg_noshow" :label="item.arg_zname" :key="index">
        <el-button type="primary" size="mini" @click="openCondition(index)">
          {{ paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length+ $t('strings.be_setting') : $t('strings.flow.set_filter') }}
        </el-button>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='inputlist' && !item.arg_noshow" :label="item.arg_zname" :key="index" style="position: relative">
        <el-button :title="$t('buttons.flow.add_para')" type="primary" size="mini" icon="el-icon-plus" circle style="position: absolute;right: 40px" @click="addInputlist(0,0)" />
        <p v-for="(value,m) in item.arg_value" :key="m" >
          <el-input :placeholder="$t('strings.input')" :value="value" v-model="paramForm.args[index].arg_value[m]" style="width:70%"/>
          <el-button :title="$t('buttons.flow.delete_para')" type="primary" size="mini" icon="el-icon-minus" circle style="margin-left: 0" @click="delInputlist(index,m)"/>
        </p>
      </el-form-item>
    </template>
    <el-dialog
      :title="$t('strings.flow.set_filter')"
      :visible.sync="dialogCondition"
      :close-on-click-modal="false"
      width="60%" >
      <template>
        <el-table
          :data="conditionSels"
          height="250"
          style="width: 100%">
          <el-table-column width="45" >
            <template slot-scope="scope" >
              <span>{{ scope.$index===0?'':'and' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strings.flow.select_target_column')" align="center" >
            <template slot-scope="scope">
              <span>
                <el-select :placeholder="$t('strings.flow.target_column')" v-model="conditionSels[scope.$index]['field']" clearable>
                  <el-option v-for="(item,index) in nodestr" :key="index" :label="item" :value="item"/>
                </el-select>
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strings.flow.select_operator')" align="center" >
            <template slot-scope="scope">
              <span>
                <el-select :placeholder="$t('strings.flow.operator')" v-model="conditionSels[scope.$index]['operation']" clearable>
                  <el-option v-for="(item,index) in condition" :key="index" :label="index" :value="item"/>
                </el-select>
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strings.flow.input_operator')" align="center" >
            <template slot-scope="scope">
              <el-input v-model="conditionSels[scope.$index]['value']"/>
            </template>
          </el-table-column>
          <el-table-column width="120" align="center" >
            <template slot-scope="scope" >
              <span>
                <el-button icon="el-icon-plus" circle size="mini" @click="plusCondition"/>
                <el-button icon="el-icon-minus" circle size="mini" @click="minusCondition(scope.$index)"/>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <!--<el-transfer v-model="tdata" :data="transferData"   :titles="['待选列', '已选列']" ></el-transfer>-->
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogCondition = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="dialogConditionYes">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogTran"
      :close-on-click-modal="false"
      title="选择字段"
      width="50%"
      append-to-body>
      <template>
        <Transfer :valued="tdata" :list="transferData" @callback="transferCallback"/>
        <!--        <el-transfer v-model="tdata" :data="transferData"   :titles="['待选列', '已选列']" ></el-transfer>-->
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogTran = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="dialogYesVisible">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>
<script>

import CommonParam from './ParamCommon'
import Transfer from '@/components/Transfer'
import _ from 'lodash'
export default {
  name: 'Cascade',
  components: { Transfer },
  filters: {
    getColumnsLen(item) {
      return item && item instanceof Array && item.length ? item.length + $t('strings.be_selected') : $t('strings.select_field') // $t 无法获取
    }
  },
  extends: CommonParam,
  props: {
    data: { type: Object, default: null },
    k: { type: Number, default: null }
  },
  updated() {
    // this.paramForm = _.cloneDeep(this.$props.data)
    this.$emit('updateComp', this.paramForm.args, this.$props.k, this.$props.data.index)
  },
  mounted() {
    this.paramForm = this.$props.data
    this.filterAction()
  },
  watch:{
    '$props.data':{
      handler:function(){
        this.filterAction()
      },
      deep:true
    },
  },
  methods: {
    /**
       * 设置穿梭框中选项 不需要检测上游节点 所以这里需要重写handleOpen 方法
       * @param index
       * @returns {boolean}
       */
    handleOpen(index) {
      this.columnsIndex = index
      const arg = this.paramForm['args'][this.columnsIndex]
      const { arg_range, arg_value } = arg
      if (arg_range && arg_range !== '[]') {
        this.nodestr = eval(arg_range)
      } else {
        // const provids = this.$props.data.provids
        const temp = this.$props.data.provData
        if (!_.isArray(temp)) {
          this.$message.error(this.$t('messages.flow.options_error2'))
          return false
        }
        let provData = null
        temp ? '' : this.$message.warning(this.$t('messages.flow.options_error3'))
        if (_.isArray(temp[0])) { // 判断是否是二维数组
          provData = temp[arg['arg_name'].slice(-1) - 1]
        } else {
          provData = temp
        }
        // todo 不需要检测上游节点
        // if(provids.length < 1){
        //   this.$message('未链接处理文件!')
        //   return false
        // }
        this.nodestr = provData
        if (!this.nodestr) {
          this.dialogTran = false
          this.$message(this.$t('messages.flow.options_error5'))
          return false
        }
      }
      this.dialogTran = true
      this.tdata = arg_value || []
      this.transferData = this.nodestr
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form--inline .el-form-item{
    vertical-align: middle;
    margin-right: 1em;
    margin-bottom: 0;
  }

  .el-transfer-panel__item.el-checkbox {
    display: block;
}
  .el-button--primary {
    height: 32px;
    border-radius: 14px;
    color: #fff;
    background-color: #3d65c9;
    &:hover {
      background-color: #6484d4;
    }
    &:active {
      background-color: #0f32b5;
    }
  }
</style>

