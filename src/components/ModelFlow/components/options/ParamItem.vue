<!--
  $attrs.ispipeline区分数据实验和pipeline(组合模型)编辑
  算法能选择的参数前端控件说明如下:
  "columns", 多选穿梭框
  "lists",  多选checkbox
  "list",  单选列表
  "bool",  True or False 单选
  "boollist", list bool单选
  "value",  input输入 可选类型
  "value_recommend": 输入加推荐功能组件
  "filter"  筛选控件(数据集筛选时使用)
  "addThreshold" 编辑阈值(添加字段的标准阈值使用),
  "column_props" 设置输出列属性
  "inputlist"多值输入组件
  "boolsinput" 缺失值异常值处理组建
  "label_rules" 特殊组件　创建标签规则->在常值标签函数中使用
  "func_rules" 特殊组件　自定义函数规则
  "addComp" 参数中的参数　调用组件AddComp
-->
<template>
  <el-form ref="paramFormFunc" v-model="paramForm" >
    <div v-for="(item,index) in paramForm.args" :key='index'>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="bool" && !item.arg_noshow' >
         <el-radio-group v-model="paramForm.args[index].arg_value" size="mini" :disabled="$attrs.ispipeline" @change="listChange(item)">
            <el-radio label="True"></el-radio>
            <el-radio label="False"></el-radio>
          </el-radio-group>
      </el-form-item>
　　　　<!--　输入组件 -->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="value" && !item.arg_noshow' >
        <el-input v-model.trim="paramForm.args[index].arg_value" @blur="inputChange(item,index)" :disabled="$attrs.ispipeline" style='width:50%' :placeholder="item.arg_range"></el-input>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--　textarea输入组件 -->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="sql_textarea" && !item.arg_noshow' >
        <el-button type="primary" @click="handleAreaOpen(index)"  size="mini" :disabled="$attrs.ispipeline" >
          {{ paramForm.args[index].arg_value ?  $t('labels.edit') : $t('buttons.add') }}
        </el-button>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
　　　　<!--附带输入建议的组件-->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="value_recommend" && !item.arg_noshow' >
        <el-autocomplete
          class="inline-input"
          v-model="paramForm.args[index].arg_value"
          :fetch-suggestions="recommendSearch"
          @focus="recommendFocus(paramForm.args[index].arg_range)"
          style='width:60%'
        ></el-autocomplete>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="lists" && !item.arg_noshow' >
        <el-checkbox-group v-model="paramForm.args[index].arg_value" size="mini" :disabled="$attrs.ispipeline">
          <el-checkbox v-for="(it,key) in strToArr(paramForm.args[index].arg_range, index)"  :key='key' :label="it" >{{it}}</el-checkbox>
        </el-checkbox-group>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if="item.arg_type==='boolsinput' && !item.arg_noshow">
        <el-radio-group v-model="radio.value"  @change="radio2Click(index)" :disabled="$attrs.ispipeline">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-radio v-if="it==='add_number'" :key="key" :label="it"  style="display: block;margin:0 0 20px 0;line-height: 36px;">
              {{ $t('strings.flow.filling') }} <el-input v-model.number="tcNumber" ref="tcNum" style="width:150px;margin:0 10px 0 20px;display: none;"></el-input>
            </el-radio>
            <el-radio v-else :key="key" :label="it"  style="margin:5px 10px 5px 0;">{{ it }}</el-radio>
          </template>
        </el-radio-group>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>

      <el-form-item :label="item.arg_zname" v-if="item.arg_type==='boollist' && !item.arg_noshow">
        <el-radio-group  v-model="paramForm.args[index].arg_value" @change="listChange(item)" :disabled="$attrs.ispipeline">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range)" >
            <el-radio :key="key" :label="it"  style="margin:5px 10px 5px 0;">{{ it }}</el-radio>
          </template>
        </el-radio-group>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if="item.arg_type==='list' && !item.arg_noshow" >
        <el-select v-model="paramForm.args[index].arg_value" :placeholder="$t('strings.select')" :disabled="$attrs.ispipeline && !!item.arg_range" clearable @change="listChange(item)"  style="width: 50%">
          <template v-for="(it,key) in strToArr(paramForm.args[index].arg_range, index)" >
            <el-option :key="key" :label="it"  :value="it"></el-option>
          </template>
        </el-select>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="columns" && !item.arg_noshow' >
         <el-button type="primary" @click="handleOpen(index)" :disabled="$attrs.ispipeline && !!item.arg_range" size="mini" > <!--if arg.range存在置灰 --->
           {{paramForm.args[index].arg_value && data.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ?  paramForm.args[index].arg_value.length + $t('strings.be_selected') : $t('strings.select_field') }}
         </el-button>
         <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
　　　 <!--筛选-->
      <el-form-item v-if="item.arg_type==='filter' && !item.arg_noshow" :label="item.arg_zname">
         <el-button type="primary" size="mini" @click="openCondition(index, 'conditionSels', 'dialogCondition')" :disabled="$attrs.ispipeline">
           {{paramForm.args[index].arg_value && data.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length + $t('strings.be_setting') : $t('strings.flow.set_filter') }}
         </el-button>
         <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--编辑阈值-->
      <el-form-item v-if="item.arg_type==='addThreshold' && !item.arg_noshow" :label="item.arg_zname">
        <el-button type="primary" size="mini" @click="openCondition(index, 'conditionThreshold', 'dialogThreshold')" :disabled="$attrs.ispipeline">
          {{paramForm.args[index].arg_value && paramForm.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length+ $t('strings.be_setting') : $t('strings.flow.set_threshold') }}
        </el-button>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--设置字段属性-->
      <el-form-item v-if="item.arg_type==='column_props' && !item.arg_noshow" :label="item.arg_zname">
         <el-button type="primary" size="mini" @click="openCondition(index, 'conditionOutset', 'dialogOutSet', 'query')" :disabled="$attrs.ispipeline">
           {{paramForm.args[index].arg_value && data.args[index].arg_value instanceof Array && paramForm.args[index].arg_value.length ? paramForm.args[index].arg_value.length + $t('strings.be_setting') : $t('strings.setting') }}
         </el-button>
         <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--单选list组建-->
      <el-form-item v-if="item.arg_type==='inputlist' && !item.arg_noshow" :label="item.arg_zname" style="position: relative">
        <el-button type="primary" :title="$t('buttons.flow.add_para')" :disabled="$attrs.ispipeline"  size="mini"  icon="el-icon-plus" circle @click="addInputlist(index,0)" />
        <p v-for="(value,m) in item.arg_value" :key="m" >
          <el-input :placeholder="$t('strings.input')" :disabled="$attrs.ispipeline" :value="value" v-model="paramForm.args[index].arg_value[m]"　style="width:50%"/>
          <el-button :title="$t('buttons.flow.delete_para')" type="primary" size="mini"  icon="el-icon-minus" circle @click="delInputlist(index,m)" style="margin-left: 0"/>
        </p>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--　创建标签规则 注意: 要想使标签规则和特征列相关连 需要把特征列放置在编辑标签规则前面 -->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="label_rules" && !item.arg_noshow' >
        <el-button type="primary" :disabled="$attrs.ispipeline" @click="openRulesCommon(index, item, 'dialogLabelRule', 'colnamedata', 'labelcoldata', 'ruleindex', 'label_rules')"  size="mini" >
          {{ item.arg_value ? $t('labels.edit') :item.arg_zname }}
        </el-button>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--　创建函数规则 -->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="func_rules" && !item.arg_noshow' >
        <el-button type="primary" :disabled="$attrs.ispipeline" @click="openRulesCommon(index, item, 'dialogFuncRule', 'funccolnamedata', 'funccoldata', 'funcindex', 'func_rules')"  size="mini" >
          {{ item.arg_value ? $t('labels.edit') :item.arg_zname }}
        </el-button>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--　piemapping_rules组件 -->
      <el-form-item :label="item.arg_zname" v-if='item.arg_type==="piemapping_rules" && !item.arg_noshow' >
        <el-button type="primary" :disabled="$attrs.ispipeline" @click="handleMappingOpen(index, 'dialogMappingRule')"  size="mini" >
          {{ paramForm.args[index].arg_value ?  $t('labels.edit') : $t('buttons.add') }}
        </el-button>
        <tooltip-doc :doc="item.arg_doc" />
      </el-form-item>
      <!--父参数组建中使用-->
      <el-form-item v-if="item.arg_type==='addComp' && !item.arg_noshow" :label="item.arg_zname" >
        <el-button type="primary" :title="$t('buttons.flow.add_para')" :disabled="$attrs.ispipeline" size="mini"  icon="el-icon-plus" circle @click="addCompInit(item,index)"/>
        <div>
          <div v-for="(comp,m) in setInitComp(item.arg_value,data,index)" :key="m" style="border: 1px solid #f56c6c29;margin-top:2px;margin-left:10px;padding: 5px;position: relative;" >
            <param-groups  :data="comp" :k="m" style="width: 78%" @updateComp="updateComp" v-bind="$attrs" />
            <el-button :title="$t('buttons.flow.delete_para')" :disabled="$attrs.ispipeline" @click = "delComp(m,index)" type="primary" size="mini"  icon="el-icon-minus" circle style="margin-left: 0;position: absolute;right: 10px;bottom: 30%;"/>
          </div>
        </div>
      </el-form-item>
      <!--父参数组建中使用end-->
      <el-form-item v-if='item.arg_type==="cascade" && !item.arg_noshow' :label="item.arg_zname" >
        <el-button :title="$t('strings.flow.set_chart')" type="primary" size="mini" style="margin-left: 0"　@click="clickDialogCascade(item)">{{ $t('strings.flow.set_chart') }}</el-button>
      </el-form-item>

    </div>
　　 <!--- filter组件弹框 --->
    <el-dialog
      :title="$t('strings.flow.set_filter')"
      :visible.sync="dialogCondition"
      width="40%" >
      <template>
        <TableSet :condition="conditionSels" :heads="['逻辑运算符','选择目标列','选择运算符', '输入运算值']" :oneCols="['or', 'and']" :headsType="['select', 'select', 'select', 'input']" :columns="[nodestr, condition]" :cselect="[,0,1,]" :keys="['relation','field','operation','value']" @call="dialogConditionYes" />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCondition = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click=" dialogCondition = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!-- 编辑阈值组件弹框 -->
    <el-dialog
      :title="$t('strings.flow.add_threshold')"
      :visible.sync="dialogThreshold"
      :close-on-click-modal="false"
      width="40%" >
      <template>
        <TableSet :condition="conditionThreshold" :heads="['选择目标列','国标','厂标', '行标']" :headsType="['select', 'input', 'input', 'input']" :columns="[nodestr]" :cselect="[0,,,]" :keys="['col','g','c','h']" @call="dialogConditionYes" />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogThreshold = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogThreshold = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!--- 输出列属性组件弹框 --->
    <el-dialog
      title="输出列属性"
      :visible.sync="dialogOutSet"
      width="40%" >
      <template>
        <TableSet ref="column_props" v-loading="dialogloading" :condition="conditionOutset" :heads="['输出列','小数位','单位']"  :headsType="['select', 'input', 'input']" :columns="[nodestr]" :cselect="[0,,]" :keys="['field','decimal','unit']" @call="dialogConditionYes" />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogOutSet = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click=" dialogOutSet = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!--columns组件弹框-->
   <el-dialog
      :title="$t('strings.select_field')"
      :visible.sync="dialogTran"
      :close-on-click-modal="false"
      width="50%" >
      <template>
        <Transfer @callback="transferCallback" :valued="tdata" :list="transferData"/>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogTran = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogYesVisible" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('strings.flow.set_chart')"
      :visible.sync="dialogCascade"
      :close-on-click-modal="false"
      :before-close="beforecloseCasc"
      width="80%" >
      <template>
        <div>
          <el-select v-model="cascadeIndex" :placeholder="$t('strings.flow.select_device')" clearable @change="cascadeIndexChange" style="width: 10%;margin-right: 10px;">
            <el-option
              v-for="(rt,ri) in cascadeData.arg_range"
              :key="ri"
              v-if="rt.arg_zname"
              :label="rt.arg_zname"
              :value="ri"
              auto-complete="on">
            </el-option>
          </el-select>
          <el-button :title="$t('buttons.flow.add_chart')" type="primary" size="mini"  icon="el-icon-plus" @click="addCascade" >{{ $t('buttons.add') }}</el-button>
          <el-button :title="$t('buttons.flow.draw')" type="primary" size="mini"  icon="el-icon-search" @click="drawCascade" >{{ $t('buttons.flow.draw') }}</el-button>
          <Cascade v-if="cascadeIndexData" :data="cascadeIndexData"  style="width: 100%;margin-top: 10px;" @updateComp="updateCascade"/>
        </div>
        <div style="border-top: 1px solid #ddd;padding-top: 10px;height: 500px;overflow-y: scroll;">
          <div v-for="(chart,ic) in updatecass" :key="ic"  style="display: inline-block;position: relative">
            <BaseCharts :chartData="chartData" />
            <div style="position: absolute;height: 20px;top: 0;width: 100%;text-align: center;bottom: 0;margin: auto;">{{ $t('strings.flow.wait_draw') }}</div>
            <i class="el-icon-close" style="position: absolute;right: 10px;top:10px;color:red;" @click="deleteCass(ic)"></i>
          </div>
        </div>
      </template>
    </el-dialog>

    <!--label_rules常值标签函数弹框-->
    <el-dialog
      :title="$t('strings.flow.mylabel_rule')"
      :visible.sync="dialogLabelRule"
      :close-on-click-modal="false"
      width="50%" >
      <template>
        <ColName :data-list="colnamedata" str="label_rules" :selects="data.provData[0]" @callback="mappingCallBack"/>
        <LabelCol :data-list="labelcoldata" str="label_rules" @callback="rulesCallBack"/>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLabelRule = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="addRulesCommon('label_rules', 'ruleindex', 'dialogLabelRule')" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!--func_rules常值标签函数弹框-->
    <el-dialog
      :title="$t('strings.flow.myfunc_rule')"
      :visible.sync="dialogFuncRule"
      :close-on-click-modal="false"
      width="50%" >
      <template>
        <ColName :data-list="funccolnamedata" str="func_rules" :selects="data.provData[0]" @callback="mappingCallBack"/>
        <FuncCol :data-list="funccoldata" str="func_rules" @callback="rulesCallBack"/>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFuncRule = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="addRulesCommon('func_rules', 'funcindex', 'dialogFuncRule')" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>

    <!--piemapping_rules自定义分段映射规则-->
    <el-dialog
      :title="$t('strings.flow.mymaping_rule')"
      :visible.sync="dialogMappingRule"
      :close-on-click-modal="false"
      width="50%" >
      <template>
        <mapping-rule :list="mappingRuledata" @callback="addAreaRule"/>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogMappingRule = false " size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogMappingRule = false " size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>

    <!--dtextarea组件弹窗主要用在sql专家模式弹框-->
    <el-dialog
      :title="$t('strings.flow.mysql_rule')"
      :visible.sync="dialogAreaRule"
      :close-on-click-modal="false"
      width="50%">
      <template>
        <el-container style="border: 1px solid #eee;height: 500px;">
          <el-aside width="20%" style="background-color: rgb(238, 241, 246)">
            <el-tree
              :data="data.provData[0] | eltreeData"
              :expand-on-click-node="false"
              default-expand-all>
              <span class="custom-tree-node" slot-scope="{ node }">
                <span style="width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="node.label">{{ node.label }}</span>
                <span><i class="el-icon-copy-document" @click.stop.prevent="doCopy"></i></span>
              </span>
            </el-tree>
          </el-aside>
          <el-main style="padding: 0;">
            <SplitEditor
              :fontSize="16"
              :showPrintMargin="true"
              :highlightActiveLine="true"
              :enableBasicAutocompletion="true"
              :enableLiveAutocompletion="true"
              :splits="1"
              :width="'100%'"
              :editorProps="{$blockScrolling: true}"
              :value="AreaRuleValue"
              :onChange="addAreaRule"
              mode="sql"
              theme="chrome"
              name="editor"
            />
          </el-main>
        </el-container>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAreaRule = false" size="mini">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogAreaRule = false" size="mini">{{ $t('buttons.confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>
<script>
  import ParamGroups from './ParamGroups'
  import Cascade from './ParamCascade'
  import BaseCharts from '@/components/Charts/BaseCharts'　//基础图表组件
  import Transfer from '@/components/Transfer'
  import ColName from '../incomponent/ColName'
  import LabelCol from '../incomponent/LabelCol'
  import FuncCol from '../incomponent/FuncCol'
  import MappingRule from '../incomponent/MappingRule'
  import TooltipDoc from '../incomponent/TooltipDoc'
  import TableSet from '../incomponent/TableSet'

  import _ from 'lodash'
  import CommonParam from './ParamCommon'

  import { Split as SplitEditor } from 'vue2-brace-editor' //相对定位editor
  import 'brace/mode/sql';
  import 'brace/theme/chrome';

  export default {
    name: 'ParameterItem',
    components:{
      ParamGroups,
      Cascade,
      BaseCharts,
      ColName,
      LabelCol,
      FuncCol,
      Transfer,
      SplitEditor,
      MappingRule,
      TooltipDoc,
      TableSet
    },
		props:{
			data:{type:Object,default:null}
		},
    extends: CommonParam,
    data(){
      return{
        addCompData:[],
        dialogCascade:false, //图表设置弹框
        dialogLabelRule: false, // 编辑标签规则弹框
        compShow:false,
        sendCompData:[],
        cascadeData:{arg_range:[]},
        cascadeIndex:"",
        cascadeIndexData:null,
        updatecas:null,
        updatecass:[],
        chartData: {
          columns: ['日期', '访问用户', '下单用户', '下单率'],
          rows: [
            { '日期': '1/1', '访问用户': 1393, '下单用户': 1093, '下单率': 0.32 },
            { '日期': '1/2', '访问用户': 3530, '下单用户': 3230, '下单率': 0.26 },
            { '日期': '1/3', '访问用户': 2923, '下单用户': 2623, '下单率': 0.76 },
            { '日期': '1/4', '访问用户': 1723, '下单用户': 1423, '下单率': 0.49 },
            { '日期': '1/5', '访问用户': 3792, '下单用户': 3492, '下单率': 0.323 },
            { '日期': '1/6', '访问用户': 4593, '下单用户': 4293, '下单率': 0.78 }
          ]
        },
        value_recommend_list: [], //　输入推荐数据列表 随着获取输入焦点变动
        colnamedata:[],
        labelcoldata: [],
        label_rules: {'label': this.colnamedata, 'column': this.labelcoldata},
        ruleindex: null,
        dialogFuncRule: false,
        funcindex: null,
        funccolnamedata: [],
        funccoldata: [],
        func_rules: {'label': this.funccolnamedata, 'column': this.funccoldata},
        dialogMappingRule: false, // 分段映射规则弹窗
        mappingRuledata: [],
        cmOptions: {
          // 编辑器设置
          tabSize: 4,//tab大小
          mode: 'text/x-mysql',//编辑器模式支持文件
          theme: 'base16-light',//编辑器主题
          lineNumbers: true,//编辑器行号
          line: true,
          dragDrop: true,//拖拽
          lineWrapping: true, //代码折叠
          matchBrackets: true,  //括号匹配
          // autofocus: true,//自动聚焦
          indentWithTabs: true,//首行缩进
          smartIndent: true,
          extraKeys:{"Ctrl":"autocomplete"}
        }
      }
    },
    filters:{
      eltreeData(data){
        const child = data.map(item => {
          return {
            label: item,
            icon: 'el-icon-info'
          }
        })
        return [{
          label: 'table:t1',
          children: child
        }]
      },
      toCheckArray(data){
        return JSON.parse(data)
      }
    },
    watch: {
      'paramForm':{
        handler:function(newer,older){
          this.$store.dispatch('setOpreates', newer)
        },
        deep: true
      }
    },
    created(){
      this.paramForm = this.$props.data
    },
    // updated(){
    //   this.$store.dispatch('setOpreates', this.paramForm)
    // },
    methods:{
      /**
       * 多组输入初始化设置
       * @param item
       */
      addCompInit(item,index){
        // this.compShow = true
        const { provData, provids, args } = this.paramForm
        const arg = args[index].arg_value
        let arg_value = []
        if(arg && arg!=='{}' && arg!=='[]'){
          arg_value = JSON.parse(arg)
        }
        arg_value.push({
          args: JSON.parse(_.cloneDeep(item.arg_range)),
          provData: provData,
          provids: provids,
          index: index
        })
        args[index].arg_value = JSON.stringify(arg_value)
      },
      /**
       * 删除多组输入设置内容
       * @param m
       */
      delComp(m,index){
        this.sendCompData.splice(m,1)
        console.log("输入组内参数删除操作")
        this.paramForm.args[index].arg_value = JSON.stringify(Object.values(this.sendCompData))
      },
      /**
       * 更新多组输入内容
       * @param m
       */
      updateComp(data,m,index){
        if(data){
          this.sendCompData[m].args = data
          this.paramForm.args[index].arg_value = JSON.stringify(this.sendCompData)
        }
      },
      /**
       * 组织多组输入已设置参数信息
       * @param item
       * @returns {{args: *, provData: null, provids, index: number}[]}
       */
      setInitComp(item,data,index){
        // 默认给addComp默认一组参数
        let parseItem = item ? typeof item == 'string'? JSON.parse(item) : item :null
        const { provData, provids, args } = data
        if(!parseItem){
          parseItem = [{
            args: JSON.parse(_.cloneDeep(args[index].arg_range)),
            provData: provData,
            provids: provids,
            index: index
          }]
        } else {
          for (let i = 0, len = parseItem.length; i < len ; i++) {
            parseItem[i].provData = provData
            parseItem[i].provids = provids
            parseItem[i].index = index
          }
        }
        const params = Object.values(parseItem)
        /***上游有可能存在多个节点 todo 这里还不需要处理多节点情况　多节点也可以进行对比****/
        // if(!_.isEqual(provids, params[0].provids)){
        //   console.warn("上游数据节点变更了,清空原来参数项")
        //   // this.paramForm.args[index].arg_value = '[]'
        // }
        this.sendCompData = params
        return params
      },
      /***
       * cascade组件弹框操作
       */
      clickDialogCascade(item){
        this.dialogCascade = true
        this.cascadeData = _.cloneDeep(item)
      },
      cascadeIndexChange(){
        const { provData, provids } = this.$props.data
        this.cascadeIndexData = {
          args: this.cascadeData.arg_range[this.cascadeIndex].arg_range,
          provData: provData,
          provids: provids,
          index: this.cascadeIndex,
        }
      },
      updateCascade(update){
        this.updatecas = update
      },
      addCascade(){
        const index = this.cascadeIndex
        const updatecass = this.updatecass
        if(index || index===0){
          let temp = updatecass.filter(item=>{
            return _.isEqual(item.args, updatecass)
          })
          _.isEmpty(temp) && this.updatecass.push({name: this.cascadeData.arg_range[index].arg_zname, args:_.cloneDeep(updatecass)})
        }

      },
      drawCascade(){
        this.$message.info(this.$t('messages.unavailable'))
      },
      deleteCass(index){
        this.updatecass.splice(index,1)
      },
      beforecloseCasc(){
        this.cascadeData =  {arg_range:[]}
        this.updatecass = []
        this.cascadeIndexData = null
        this.cascadeIndex = null
        this.dialogCascade = false
      },
      recommendFocus(data){
        this.value_recommend_list = this.strToArr(data)
      },
      recommendSearch(data,cb){
        try {
          cb(this.value_recommend_list.map(item=>{
            return {"value":item}
          }))
        }catch (e) {
          console.log(e)
          this.$message.error('data parsing error')
        }
      },
      /**
       * 常值标签函数和数据计算函数自定义参数组件弹窗open并初始赋值
       * @param index
       * @param item
       * @param dialog
       * @param colstr
       * @param labelstr
       * @param indexstr
       * @param rulestr
       */
      openRulesCommon(index, item, dialog, colstr, labelstr, indexstr, rulestr ){
        this[dialog] = true
        const { mapping_list, rules } = item.arg_value
        this[indexstr] = index
        // start todo 这里特殊处理 标签规则和特征选择列关联
        const aPreValue = index-1 < 0 ? false : this.paramForm.args[index-1].arg_value
        if(aPreValue && !item.arg_value){
          this[colstr] = aPreValue.map((item,key) => ['x'+(key+1), item])
        } else {
          this[colstr] = mapping_list
        }
        // end
        this[labelstr] = rules || []
        const v = this.paramForm.args[index]
        if(v.arg_value){
          v.arg_value.mapping_list = this[colstr]
        }else{
          v.arg_value = { mapping_list: this[colstr], rules: [] }
        }
        this[rulestr] = v.arg_value
      },
      /**
       * 常值标签函数和数据计算函数自定义参数组件弹窗内添加操作
       * @param labelstr
       * @param indexstr
       * @param dialog
       */
      addRulesCommon(labelstr, indexstr, dialog){
        const { mapping_list, rules } = this[labelstr]
        if(mapping_list && rules){
          this.paramForm.args[this[indexstr]].arg_value = this[labelstr]
          this[dialog] = false
        } else {
          this.$message.warning(this.$t('messages.add_set'))
        }
      },
      mappingCallBack(label, str){
        this[str]['mapping_list'] = label
      },
      rulesCallBack(column, str){
        this[str]['rules'] = column
      }
    }
	}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

  .el-form-item{
    margin-bottom: 10px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
