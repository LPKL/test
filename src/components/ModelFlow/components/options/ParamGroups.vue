<!-- 此组件是参数中的参数项 在ParamItem使用的　具体例子请看ParamItem 组件中的addComp
  "columns", 多选穿梭框
  "lists",  多选checkbox
  "list",  单选列表
  "bool",  True or False 单选
  "value",  input输入 可选类型
  "filter"  筛选控件(数据集筛选时使用)
  "inputlist"多值输入组件

  todo 1.8.0 嵌套组件新添以下支持 2.新加嵌套组件内关系设置
  "boollist", list bool单选
  "boolsinput" 缺失值异常值处理组建

-->
<template>
  <el-form ref="paramForm" v-model="paramForm" >
    <div v-for="(item,index) in paramForm.args" :key='index' >
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="bool" && !item.arg_noshow' >
        <el-radio-group v-model="paramForm.args[index].arg_value" :disabled="$attrs.ispipeline" size="mini" @change="listChange(item)">
          <el-radio label="True"></el-radio>
          <el-radio label="False"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="value" && !item.arg_noshow' >
        <el-input v-model.trim="paramForm.args[index].arg_value" :disabled="$attrs.ispipeline" @blur="inputChange(item,index)" style='width:55%' :placeholder="item.arg_zname"></el-input>
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="lists" && !item.arg_noshow' >
        <el-checkbox-group  v-model="paramForm.args[index].arg_value" :disabled="$attrs.ispipeline" size="mini">
          <el-checkbox v-for="(it,key) in strToArr(paramForm.args[index].arg_range, index)"  :key='key' :label="it" >{{it}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item v-if="item.arg_type==='boolsinput' && !item.arg_noshow" :label="item.arg_zname" >
        <el-radio-group v-model="radio.value" :disabled="$attrs.ispipeline" @change="radio2Click(index)">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-radio v-if="it==='add_number'" :key="key" :label="it"  style="display: block;margin:0 0 20px 0;line-height: 36px;">
              填充值 <el-input v-model.number="tcNumber" ref="tcNum" style="width:150px;margin:0 10px 0 20px;display: none;"></el-input>
            </el-radio>
            <el-radio v-else :key="key" :label="it"  style="margin:5px 10px 5px 0;">{{ it }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="item.arg_zname" v-if="item.arg_type==='boollist' && !item.arg_noshow">
        <el-radio-group  v-model="paramForm.args[index].arg_value" :disabled="$attrs.ispipeline" @change="listChange(item)">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-radio :key="key" :label="it"  style="margin:5px 10px 5px 0;">{{ it }}</el-radio>
          </template>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="item.arg_type==='list' && !item.arg_noshow" :label="item.arg_zname" >
        <el-select v-model="paramForm.args[index].arg_value" :placeholder="$t('strings.select')" :disabled="$attrs.ispipeline && !!item.arg_range"  @change="listChange(item)" style="width: 40%">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range, index)" >
            <el-option :key="key" :label="it"  :value="it"></el-option>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="columns" && !item.arg_noshow' >
        <el-button type="primary"  @click="handleOpen(index)" :disabled="$attrs.ispipeline && !!item.arg_range " size="mini" >
          {{paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ?  paramForm.args[index].arg_value.length + $t('strings.be_selected') : $t('strings.select_field')}}
        </el-button>
      </el-form-item>
      <el-form-item v-if="item.arg_type==='filter' && !item.arg_noshow" :label="item.arg_zname">
        <el-button :type="$attrs.ispipeline ? '' : primary" size="mini" :disabled="$attrs.ispipeline" @click="openCondition(index)">
          {{paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length+ $t('strings.be_setting') : $t('strings.flow.set_filter') }}
        </el-button>
      </el-form-item>
      <!--编辑阈值-->
<!--      <el-form-item v-if="item.arg_type==='addThreshold' && !item.arg_noshow" :label="item.arg_zname">-->
<!--        <el-button type="primary" size="mini" @click="openThreshold(index)">-->
<!--          {{paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length+ $t('strings.be_setting') : $t('strings.flow.set_threshold') }}-->
<!--        </el-button>-->
<!--      </el-form-item>-->
      <el-form-item v-if="item.arg_type==='inputlist' && !item.arg_noshow" :label="item.arg_zname" style="position: relative">
        <el-button type="primary" :title="$t('buttons.flow.add_para')" :disabled="$attrs.ispipeline" size="mini"  icon="el-icon-plus" circle @click="addInputlist(0,0)"style="position: absolute;right: 40px" />
        <p v-for="(value,m) in item.arg_value" :key="m" >
          <el-input :placeholder="$t('strings.input')" :value="value" v-model="paramForm.args[index].arg_value[m]" :disabled="$attrs.ispipeline"　style="width:70%"/>
          <el-button :type="$attrs.ispipeline ? '' : primary" :title="$t('buttons.flow.delete_para')" size="mini"  icon="el-icon-minus" :disabled="$attrs.ispipeline" circle @click="delInputlist(index,m)" style="margin-left: 0"/>
        </p>
      </el-form-item>
    </div>
    <!--    筛选组件弹框 -->
    <el-dialog
      :title="$t('strings.flow.set_filter')"
      :visible.sync="dialogCondition"
      :close-on-click-modal="false"
      width="60%" >
      <template>
        <TableSet :condition="conditionSels" :heads="['逻辑运算符','选择目标列','选择运算符', '输入运算值']" :oneCols="['or', 'and']" :headsType="['select', 'select', 'select', 'input']" :columns="[nodestr, condition]" :cselect="[,0,1,]" :keys="['relation','field','operation','value']" @call="dialogConditionYes" />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCondition = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click=" dialogCondition = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!--    编辑阈值组件弹框 -->
    <el-dialog
      :title="$t('strings.flow.add_threshold')"
      :visible.sync="dialogThreshold"
      :close-on-click-modal="false"
      width="60%" >
      <template>
        <TableSet :condition="conditionThreshold" :heads="['选择目标列','国标','厂标', '行标']" :headsType="['select', 'input', 'input', 'input']" :columns="[nodestr]" :cselect="[0,,,]" :keys="['col','g','c','h']" @call="dialogConditionYes" />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogThreshold = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogThreshold = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('strings.select_field')"
      :visible.sync="dialogTran"
      :close-on-click-modal="false"
      width="50%" >
      <template>
        <Transfer @callback="transferCallback" :valued="tdata" :list="transferData"/>
<!--        <el-transfer v-model="tdata" :data="transferData" :titles="['待选列', '已选列']" ></el-transfer>-->
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogTran = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogYesVisible">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>
<script>
  import CommonParam from './ParamCommon'
  import Transfer from '@/components/Transfer'
  import TableSet from '../incomponent/TableSet'
  export default {
    name: 'ParamGroups',
    components: { Transfer, TableSet },
    props:{
      data:{type:Object,default:null},
      k: {type:Number,default:null}
    },
    extends: CommonParam,
    updated(){
      const { args } = this.paramForm
      const { k, data:{ index} } = this.$props
      this.$emit('updateComp',args, k, index)
    },
    created(){
      this.filterAction()
    },
    mounted(){
      this.paramForm = this.$props.data
      console.log(this.paramForm)
      console.log("addcomp mounted")
    }
  }
</script>
