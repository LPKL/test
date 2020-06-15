<template>
  <div id="editor" v-loading="loading">
    <el-container  id="main_layout">
      <!--节点树结构-->
      <el-aside class="layout-left" >
        <!--节点搜索-->
        <div style="width: 90%;margin: 0 auto;margin-top: 5px;">
          <el-input v-model.trim="searchtext" :placeholder="$t('buttons.search')" suffix-icon="el-icon-search"  class="new-input"></el-input>
        </div>
        <ul id="handle_tree" class="ztree"  />
      </el-aside>
      <!--拖拽面板-->
      <el-container >
        <!--面板顶部-->
        <el-header style="position: relative;padding:0 10px;">
          <panel-top-option @saveFunc="optionModelResult" @updateTree="updateTree" :isClick="curClickId" :runId="runId"/>
        </el-header>
        <!--面板中部-->
        <el-main style="height:100%;">
          <div style="overflow:auto;height:calc(100% - 206px);background-color: #fff;" >
            <div id="work_panel"  class="work_panel">
              <!-- todo controls -->
              <div class="controls">
                <!--<i class="ico-zoom-in-24" mode="up" title="放大"/>-->
                <!--<i class="ico-zoom-out-24" mode="down" title="缩小"/>-->
                <!--<i :title="$t('strings.flow.center')" class="ico-fitscreen-24" reset/>-->
                <!--<i class="ico-real-size-24" realsize title="1:1显示"/>-->
              </div>
              <!-- todo miniview -->
              <!--<div class="miniview"/>-->
            </div>
          </div>
          <!--面板底部-->
          <panel-footer :messagews = "wsReturnMsg" id="footerMsg" @call="footCall"/>
        </el-main>
      </el-container>
      <!--参数设置区-->
      <el-aside class="layout-left" style="">
        <el-row>
          <el-col :span="24">
            <el-card shadow="never" body-style="padding:15px 10px">
              {{ $t('strings.flow.options') }}
            </el-card>
          </el-col>
          <el-col :span="24">
            <el-card shadow="never" body-style="padding:5px; padding-left: 10px;">
              <Option :optiond ="optiondata"  v-on:newSqlArgs="saveSqlArgs"/>
            </el-card>
          </el-col>
        </el-row>
      </el-aside>
    </el-container>
    <!--节点html模板-->
    <div id="node_template" style="display:none;">
      <div id="${nodeId}" align="center" name="${name}" class="pane-node-content draggable" style="position:absolute;">
        <span class="miconfont ${icon}" style="position: absolute;"/>
        <span style="margin-left: 28px;margin-right: 30px;font-size:14px;line-height:28px; display:block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${text}</span>
        <span class="status ico-warning-o" style="position: absolute;right: 0;top:0;"/>
      </div>
    </div>
    <!--评估-->
    <el-dialog v-el-drag-dialog :title="$t('strings.flow.assessment_result') + pgTitle" :visible.sync="pgTableVisible" width="85%" :close-on-click-modal="false">
      <evaluation v-if="isCompositeEvaluation(ShowpgList)" :lists="ShowpgList"/>
      <evaluation-visual v-else :lists="ShowpgList" />
    </el-dialog>
    <!--log信息-->
    <el-dialog :title=logTitle :close-on-click-modal="false" :visible.sync="logInfoVisible" width="95%">
      <template>
        <LogPreviewList :list = "loglist"/>
      </template>
    </el-dialog>
    <!-- 模型保存 -->
    <el-dialog :title="$t('strings.flow.save_model')" :close-on-click-modal="false" :visible.sync="ModelSaveVisible" width="40%"  @closed="mSaveForm.model_name=''" :before-close="saveModelClose">
      <el-form :model="mSaveForm" :rules="rules" ref="mSaveForm" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="$t('labels.flow.model_name')" prop="model_name">
          <el-input v-model.trim="mSaveForm.model_name" @change="addModelError=false"/>
          <div class="el-form-item__error" v-show="addModelError">{{ addModelErrorMessage }}</div> <!----显示后台返回的错误 --->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="saveModelClose">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="ModelSaveAction">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!--预览组件-->
<!--    <ShowVisual :dialogVisible="ShowVisualVisible" :lists = "ShowVisualList" :titles="visualData" @setVisualVisible = 'setVisualVisible' />-->
    　　<!--数据可视化 数据探查-->
    <el-dialog v-el-drag-dialog.fullscreen :close-on-click-modal="false" class='modelflow-datasnooping'
               :title="$t('strings.flow.set_chart')"
               :visible.sync="dialogCascade"
               :before-close="beforecloseCasc">
      <data-explorer ref="compChart" :node-id="node_id" :data-key="data_key" explorer-type="modelFlow" @dataExplorerOutputData="getDataExplorerOutputData"/>
    </el-dialog>
    <data-output ref="dataOutput" width="900px" :fieldProps="{key: 'name', label: 'zname'}" @save="exportData"/>
    <!--拖动辅助线-->
    <div id="guide-h" class="guide"></div>
    <div id="guide-v" class="guide"></div>
  </div>
</template>
<script>
  require('./resoult/css/jsplumbtoolkit-defaults.css')
  require('./resoult/css/icon/style.css')
  require('./resoult/css/my_bootstrap.css')
  require('./resoult/js/zTree_v3/css/metroStyle/metroStyle.css')
  require('./resoult/js/jquery/1.11.3/jquery.min.js')

  // 鼠标放上显示标题
  require('./resoult/js/poshytip-1.2/jquery.poshytip.js')
  require('./resoult/js/zTree_v3/js/jquery.ztree.core.js')

  import _ from 'lodash'
  import { sliderMenu, sliderItem } from '@/api/experiment/process'
  import { getWSparams, runCurrent } from '@/api/message/socket'

  import {
    getOneModelProject,
    runCurrentNodesSave,
    getTreeNodeIdParams,
    updateTreeNodeIdParams,
    createExperimentNode
  } from '@/api/experiment'

  import {saveExperimentDataSet,downloadExperimentData, saveExplorDataSet, downloadExplorData}  from '@/api/datamining/export'


  import context from './resoult/context'
  import { initJsPlumb } from './resoult/initJsPlumb'

  import draggable from './resoult/draggable'
  require('./resoult/js/jsplumb/jsplumbtoolkit.js')
  require('./resoult/jsplumb-persistence-plugin.js')

  import { setData, getDataset, ScollPostion } from '@/utils/index'
  import Option  from './components/Option' // 面板右侧选项
  import EvaluationVisual  from './components/EvaluationVisual' //可视化评估组件
  import Evaluation  from './components/Evaluation' //可视化评估组件（新）
  import PanelFooter from './components/PanelFooter' //流程底部组件
  import PanelTopOption from './components/PanelTopOption'
  import { validateReplaceStr2 } from '@/utils/index'
  import FlowCommon  from './mixin/flowcommon'
  import LogPreviewList  from '@/components/Table/LogPreviewList'
  import DataExplorer from '@/components/DataExplorer'
  import DataOutput from '@/components/DataOutput'
  import downloadFile from '@/utils/downloadFile'


  import rules from '@/utils/rules'
  export default {
    name: 'ModelFlow',
    components: { Option, PanelTopOption ,PanelFooter, validateReplaceStr2,  LogPreviewList, EvaluationVisual, Evaluation, DataOutput, DataExplorer },
    extends: FlowCommon,
    props: {
      // 组件传入属性规则设定
    },
    data() {
      return {
        pgTableVisible: false,
        proid : this.$store.getters.curProId,//当前项目ＩＤ
        proname: null,
        wsReturnMsg: this.$store.getters.dflowMsg,
        pgTitle: '',
        ShowpgList: [],
        ShowVisualVisible: false,
        ShowVisualList: [],
        visualData: { type: null, title: null },//可视化组建type and title

        ModelSaveVisible: false , // 数据保存
        logInfoVisible: false,　//日志显示标识
        mSaveForm:{
          model_name: null
        },
        isMove: false,//判断是否正在拖动节点
        columns: null,//点击时获取的上游节点字段
        oldArgs: {},//右侧参数变更之前得值
        isCurRun: false, // 是否是在此处开始运行
        runId: null, //　当前正在执行节点id
        rules: {
          model_name: rules.project_zname
        },
        params: null, //点击操作时保存相关参数
        loglist:　null, //日志输出
        logTitle: null,
        offsetOpened: 252,
        addModelError: false,
        addModelErrorMessage: null,
        successNodes: [] // 此次运行已经成功的节点
      }
    },
    watch:{
      //侦听器 store curProId 数据改变 切换项目并居中定位
      '$store.getters.curProId':{
        handler:function(newer,older){
          this.curClickId = null
          this.$store.commit('SET_PIPLINEDRAW', null) // 离开重置pipline结构
          this.$store.dispatch('setDflowMsg',[]) //清空运行日志
          this.handlerPIDListener(newer, older); // 执行methods中的getFromVuex方法
        },
        deep:true
      },
      //　选择节点变动
      '$store.getters.opreates':{
        /**newer和older是浅拷贝所有无法判断两者是否想等**/
        handler:function(newer,older){
          const id = this.curClickId
          const tn = $('#'+id)
          const oldValue = this.oldArgs[id]
          const isArgChange = oldValue ? _.isEqual(newer.args, oldValue.args) : true
          if(!isArgChange){ //oldValue存在并且此节点的旧参数和新参数不想等
            changeJspStatusNode(0, tn[0]) // 当前节点改变
            const nextids = this.getDraws().links[id]
            nextids && nextids.some(item => { // 参数改变操作
              this.updateNodeParams({ targetId: item }, true, true)
            })
            this.updateNodeidParams(_.cloneDeep(newer)) // 更新
          }
          this.oldArgs[this.curClickId] = _.cloneDeep(newer) //需要深拷贝
        },
        deep:true
      },
      // 监听运行数据变动
      '$store.getters.dflowMsg':{
        handler:function(newer,older){
          this.wsReturnMsg = newer
        },
        deep:true
      },
      /**监听变动　当点击得节点被删除时右侧选项重置**/
      'curClickId':{
        handler:function(newer,older){
          if(!newer){
            this.resetLeftOptions()
          }
        },
      },
      '$store.getters.sidebar': {
        handler: function(newer){
          if(!newer.opened){
            this.offsetOpened = 252
          }else{
            this.offsetOpened = 156
          }
        },
        deep:true
      }
    },
    created() {
      this.$store.dispatch('setUpWhich','history')
      this.wsReturnMsg = []
    },
    mounted() {
      this.$store.commit('SET_PIPLINEDRAW', null)
      // this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)// 加入socket
      this.cascheight = window.innerHeight*0.6+'px'
      this.$nextTick(() => {
        this.initPNode()
      })

      // getPipelineIdsParams(this.$route.query.id, { ids: ids })

    },
    beforeDestroy(){
    //  组件销毁之前
      console.log(`数据实验销毁了, /runs/${this.uuid}/logs socket也销毁了`)
      this.$socket.emit('leave', `/runs/${this.uuid}/logs`)
      this.isleave = true
      this.$store.commit('SET_PIPLINEDRAW', null) // 离开重置pipline结构
      this.resetListener()
      this.runId = null
      this.oldArgs = {}
      this.curClickId = null
      this.uuid = null
    },
    methods: {
      // 项目改变面板变动
      handlerPIDListener(newer,older){
        this.delateAllNc()
        if(newer){
          getOneModelProject(newer).then(res=>{
            console.log('改变了项目：', res)
            const { data: { run_uuid, name, status, panel, appid } } = res
            this.subscribSocket(run_uuid, appid)
            this.proname = name
            const runstatus = status
            if(panel && this.jsp){
              jsPlumb.load(this,panel,this.jsp)
            }
            // 判断面板是否正在执行　如果是禁止操作面板
            if(runstatus === 1　||　runstatus === 5　){
              console.log("项目正在运行中...")
            }else{
              console.log("项目没有在运行...")
            }
          }).catch((error) => {
            console.log(error)
          })
        }
      },
      // 获取当前要运行的节点的末尾节点
      getEndRunNodes(id,links){
        let nodes = []
        function temp(id,links){
          const sun  = links[id]
          if(sun){
            for(let i=0, len = sun.length; i<len; i++){
              temp(sun[i],links)
            }
          }else{
            nodes.push(id)
          }
        }
        temp(id,links)
        return nodes
      },
      // 处理一二级菜单节点 然后异步获取数据节点
      async initPNode() {
        const slider = await sliderMenu()
        try {
          this.pNodes = slider.data.datas
          this.treeDi(this.pNodes)
          this.initTree()
          this.coreRender(this)
          const pid = this.$store.getters.curProId
          if(!pid){
            initJsPlumb(this,{})
            this.loading = false
            return
          }
          const getProject = await getOneModelProject(pid)
          const { data: { run_uuid, status, name, panel, appid }} = getProject
          this.subscribSocket(run_uuid, appid)
          const runstatus = status // 此时面板的运行状态
          this.proname = name
          initJsPlumb(this,panel)
        }catch (e) {
          this.$message.error('request tree node error')
          console.log(e)
        }
        this.loading = false
      },
      /**
       * 更新操作
       */
      async updateTree(){
        const slider = await sliderMenu()
        try {
          this.pNodes = slider.data.datas
          this.treeDi(this.pNodes)
          this.initTree()
        }catch (e) {
          console.log(e)
        }
      },
      treeDi(treeNode){
        const that = this
        // 递归所有数据渲染属性结构
        /**
         * nodes, p
         **/
        function treeNodeDi(nodes, pname){

          return nodes.map((v, k) => {
            const { node_zname, node_name, tree_node_id, func_description } = v
            if (!func_description) { // flowcommon.js的ztree setting中需要制定func_description字段为title显示字段
              v.func_description = ""
            }
            let icon = '', children = ''
            let idt = new Date().getTime()
            let rm = idt + parseInt(Math.random(1)*100000)
            let id = rm +'_' + tree_node_id
            if(v.children){
              if(pname){
                icon = that.getTreeNodeIcon(pname, true)
                children = treeNodeDi(v.children, pname)
              } else {
                icon = that.getTreeNodeIcon(node_name, true)
                children = treeNodeDi(v.children, node_name)
              }
              return Object.assign(v, { id: id, ico: icon, name: node_zname, children: children })
            } else {
              icon = that.getTreeNodeIcon(pname)
              return Object.assign(v, { id: id, isParent: false, ico: icon, name: node_zname, isnode: true })
            }
          })
        }
        return treeNodeDi(treeNode)
      },

      // ws返回数据
      receive_message(res) {
        if(res){
          try{
            const node_id = res.node_id
            const tn = document.getElementById(node_id)
            console.log(res.status)
            if(tn || (!node_id && res.print)){
              let temp = this.$store.getters.dflowMsg
              temp.unshift(res) //执行日志显示内容
              if(res.status === 2 && tn){
                changeJspStatusNode(2,tn)
                this.setWSDataNode(node_id) //改变运行结束点的状态
                this.setRunNodeAnimation(node_id) //判断下方是否还
                this.successNodes.push(node_id)
              } else if (res.status === 1 && tn){
                changeJspStatusNode(1,tn)
              } else if (res.status === 4){
                /**运行结束标志　开启更新画版**/
                console.log("工程结束了")
                this.flowEndSetAttr() //重置所有正在运行的节点状态和动画
              } else if (res.status === 5){
                console.log("工程启动...")
                changeJspStatusNode(1,tn)
              } else if (res.status === 'success'){
                console.log(res)
              } else if (res.status === 'error' ){
                this.$message.error(res.data)
                console.log(res)
              } else {
                this.$message.error(res.print[0])
                changeJspStatusNode(3,tn)
                this.flowEndSetAttr()
              }
              this.$store.dispatch('setDflowMsg',temp)
            } else {
              res.print && this.$notify.info({
                title: this.$t('messages.flow.runflow_info'),
                message: this.$createElement('i', { style: 'color:teal;max-height:300px;overflow:auto;display:inline-block;'}, res.print.toString())
              })
              // this.$notify.info({
              //   title: this.$t('messages.flow.datapre_info') + '-' + res.status,
              //   message: this.$createElement('i', { style: 'color:teal;max-height:300px;overflow:auto;display:inline-block;'}, res.data),
              // })
            }
            this.getClickPanel()
          }catch(err){
            console.error(err)
          }
        }
      },
      flowEndSetAttr(){
        $('svg.path-ani').attr("class","jtk-connector") //将所有动画去除
        let runNodes = $('.jtk-connected.jtk-node[data-status=1]') //正在运行的节点
        if(runNodes.length > 0){ //重置正在运行的节点
          for(let i=0,len = runNodes.length;i<len;i++){
            const id = runNodes[i].getAttribute('id')
            if(this.successNodes.indexOf(id) > -1){
              changeJspStatusNode(2,'#'+id)
            } else {
              changeJspStatusNode(0,'#'+id)
            }
          }
        } //重置节点状态
        this.successNodes = []
      },
      /**
       * 0.5s后触发参数更新操作开启
       * newer参数
       */
      updateNodeidParams: _.debounce(function(newer) {
        const el = document.getElementById(this.curClickId)
        const treeid = el.dataset.treenodeid
        const type = el.dataset.type
        console.log("参数更新时不再判断是否在运行 都会更新参数设置项......")
        // let a = await this.isProjectRun('data') // todo 判断项目是否在运行
        updateTreeNodeIdParams(this.$store.getters.curProId, this.curClickId,{
          tree_id:treeid,
          type:type,
          prev_node: this.getProvNodesAndIndex(this.curClickId),
          data:JSON.stringify({args: newer.args })
        }).then(res=>{
          console.log(res)
        }).catch(error=>{
          console.log(error)
        })

      }, 500),

      // 数据筛选
      saveSqlArgs(args){
        const el = document.getElementById(this.curClickId)
        const treeid = el.dataset.treenodeid
        const type = el.dataset.type
        updateTreeNodeIdParams(this.$store.getters.curProId, this.curClickId, {
          tree_id:treeid,
          type:type,
          data:JSON.stringify({sql_args:args.args})
        }).then(res=>{
          if (args.sqlstring.length == 0) {
            // 字段枚举值获取
            if (res.data.datas != null) {
              this.$store.dispatch('setCurNodeDataItemEnum',res.data.datas)
            }else{
              this.$store.dispatch('setCurNodeDataItemEnum',[])
            }
          }else{
            //数据筛选
            let temp = this.$store.getters.dflowMsg
            temp.push({"sqlmsg": args.sqlstring})
            this.$store.dispatch('setDflowMsg',temp)
          }
        }).catch(error=>{
          console.log(error)
        })
      },

      // 设置ws返回值内容
      setWSDataNode(node_id){
        const id  = node_id
        const elem = document.getElementById(id)
        setData(elem, 'status', 2)
      },
      // 设置运行中下一个节点运行中状态和次节点下方的线的动画
      setRunNodeAnimation(id){
        if(id === this.clickRunId){
          this.isContinue = 1
        }

        const jsps = this.jsp.getAllConnections()
        const nextNode = []
        const nextlines = jsps.filter((v,k)=>{
          if(v.sourceId === id){
            nextNode.push(v.target)
            return v
          }
        })
        const prevlines = jsps.filter((v,k)=>{
          if(v.targetId === id){
            return v
          }
        })
        // 去掉节点上方线动画
        prevlines.map((v,k)=>{ v.removeClass('path-ani')})
        // 下方节点为运行中 当运行到执行节点时停止向下
        if(!this.isContinue || this.isCurRun){
          nextNode.map((v,k)=>{
            changeJspStatusNode(1,v)
          })
          // 添加节点下方线动画
          nextlines.map((v,k)=>{ v.addClass('path-ani')})
          this.runNodes = nextNode
        }
      },

      /** *init right mouse menu **/
      addMenu(type, obj, _this) {
        _this.setNodeMenu(obj,_this)
      },

      /**
       * 判断是否是组合显示的评估结果
       * @param result 评估结果
       */
      isCompositeEvaluation(result){
        if (Array.isArray(result) && result.length > 0 && !!result[0].compname)
          return true
        return false
      },
      /**
       * 数据保存，模型评估，模型保存　操作
       * save_data：表示数据保存 model_evaluation:模型评估 save_model:模型保存 data_preview:数据预览
       * @param node_id 节点id
       * @param that  current this
       * @param flag
       */
      optionModelResult(node_id,that,flag){
        if(this.$isMutexing("experiment")){
          return
        }
        const data = {
          // authuser_id: this.$store.getters.id,
          project_id: parseInt(this.$store.getters.curProId),
          node_id: node_id,
          flag:flag
        }
        switch (flag) {
          case "previewTrainedModel": //模型预览
          case "previewEvaluationResults": //评估结果预览
            this.getCurrentNodeView(data).then(res=>{
              const result = res.data.datas
              this.pgTableVisible = true
              this.pgTitle = this.$t('strings.flow.preview_assessment')
              this.ShowpgList = result
            })
            break
          // case "previewDataset": //数据预览
          // case "previewScoreDataset": //预测数据预览
          //   this.tagglePreview(data).then(res=>{
          //     const result = res.data.datas
          //     this.showVisual(result,{type : 'dataset',title:$("#"+node_id+" span")[1].innerHTML+'　预览'})
          //   })
          //   break
          case "saveAsScoreDataset"://预测保存
          case "saveAsEvaluationDataset"://评估保存
          case "saveAsDataset"://数据保存
          case "saveAsTrainedModel"://模型保存
            this.ModelSaveVisible = true
            this.params = data
            break
          default:
            console.log(flag)
            break
        }
      },

      /**
       * 点击节点模型保存操作
       * @constructor
       */
      ModelSaveAction(){
        let params  = {
          curr_node_id: this.params.node_id,
          name: this.mSaveForm.model_name
        }
        this.$refs.mSaveForm.validate(async valid => {
          if(valid){
            this.loading = true
            try {
              const result = await runCurrentNodesSave(params)
              if (result.status === 201) {
                this.mSaveForm.model_name = ''
                this.ModelSaveVisible = false
                this.$message.success(this.$t('messages.save_success'))
                this.updateTree()
              }else{
                this.addModelError = true
                this.$refs['mSaveForm'].clearValidate()
                this.addModelErrorMessage = this.$t('messages.save_faild')
                // this.$message.error(this.$t('messages.save_faild'))
              }
            } catch (e) {
              this.$refs['mSaveForm'].clearValidate()
              this.$message.error(e.message)
              console.log('runCurrentNodesSave', e)
            }
            this.loading = false
          }
        })
      },
      /**
       * 右键数据保存(历史数据、csv下载)操作
       * @output 导出窗体components/DataOutput/index.vue 返回的数据
       */
      exportData(context){
        if(context.data.type === 'historydata'){
          this.exportDataToHistory(context)
        }else{
          this.exportDataToCSV(context)
        }
      },
      // 右键数据保存到历史数据
      exportDataToHistory(context){
        let notify = this.$mutualNotify({
          mutex:{ type:'experiment',operate: context.source.fromChart?'saveExploreData':'saveData'},
          doneRouter: { linkText: '立即查看', path: '/dfilemanage', param: null }
        }, {
          onClose: function() { },
          onStateChange: function(status) {
          },
          onRedirect:function(rout) {
          }
        })
        context.dialog.close()
        if (context.source.fromChart !== false) {
          // TODO: 数据探查的保存api table line scatter
          let apiParamData = {
            name: context.data.name,
            description: context.data.description,
            field_names: context.data.field_names,
            private: context.data.private,
            type: context.source.fromChart,
            filter_field_names:context.source.filterFields, // 折线图应算法要求，只提供x轴即可
            data_key: this.data_key
          }
          if (context.source.fromChart === 'line_chart') {
            apiParamData['x_axis_min'] = context.data.x_axis_min
            apiParamData['x_axis_max'] = context.data.x_axis_max
            apiParamData['filter_field_names'] = [context.source.filterFields[0]]
          } else if (context.source.fromChart === 'scatter_chart') {
            apiParamData['data'] = context.source.scatter_data
          }
          // 异步保存探查数据
          saveExplorDataSet(context.source.experiment_id, context.source.node_id, apiParamData).then(res => {
            setTimeout(() => {
              const status = res.status.toString()
              if(status.charAt(0) != '2'){
                notify.error(res.data.message)
              }
              // 成功通知
              notify.success()
              }, 6000)
          }).catch((error)=>{
            setTimeout(() => {
              // 异常通知
              notify.error(error.message)
            }, 6000)
          })
        } else {
          saveExperimentDataSet(context.source.experiment_id, context.source.node_id, {
            name:context.data.name,
            description: context.data.description,
            field_names: context.data.field_names,
            private: context.data.private,
            data_key: this.data_key
          }).then(res => {
            setTimeout(() => {
              const status = res.status.toString()
              if(status.charAt(0) != '2'){
                // context.dialog.error(res.data.message)
                notify.error(res.data.message)
              }
              notify.success()
            }, 8000);
          }).catch((error)=>{
            // context.dialog.error(error.message)
            setTimeout(() => {
              notify.error(error.message)
            }, 6000)
          })
        }
      },
      // 右键数据下载CSV到本地
      exportDataToCSV(context){
        let notify = this.$mutualNotify({
          content:`${context.source.fromChart? '探查' : '实验'}数据导出到CSV`,
          btn:{ visible: false },
          mutex:{ type:'experiment',operate: context.source.fromChart?'saveExploreData':'saveData'},
          autoCloseOnSuccess:3000
        })

        const treatSuccess = (res,notify) => {
          const status = res.status.toString()
            if(status.charAt(0) != '2'){
              notify.error(res.data.message)
            }
            downloadFile('text/csv',res)
            notify.success()
        }

        const treatBlobError = (error,notify) => {
          if (error.response.data && error.response.data.type === 'application/json'){
              const r = new FileReader()
              r.onload = function(evt) {
                try{
                  const resData = JSON.parse(this.result)
                  if (resData) {
                    const resDataValues = Object.values(resData)
                    notify.error(resDataValues.toString())
                  }
                }catch(err){

                }
              }
              r.readAsText(error.response.data.slice(0), 'utf-8')
            }else{
              notify.error(error.message)
            }
        }

        context.dialog.close()

        if (context.source.fromChart !== false) {
          // TODO: 数据探查的保存API table line scatter
          let apiCSVParamData = {
            field_names: context.data.field_names,
            type: context.source.fromChart,
            filter_field_names:context.source.filterFields,
            data_key: this.data_key
          }
          if (context.source.fromChart === 'line_chart') {
            apiCSVParamData['x_axis_min'] = context.data.x_axis_min
            apiCSVParamData['x_axis_max'] = context.data.x_axis_max
            apiCSVParamData['filter_field_names'] = [context.source.filterFields[0]]
          } else if (context.source.fromChart === 'scatter_chart') {
            apiCSVParamData['data'] = context.source.scatter_data
          }
          downloadExplorData(context.source.experiment_id, context.source.node_id, apiCSVParamData).then(res => {
            treatSuccess(res, notify)
          }).catch((error)=>{
            // deal with error
            treatBlobError(error, notify)
          })
        } else {
          // 实验数据下载
          downloadExperimentData(context.source.experiment_id, context.source.node_id, {
            field_names: context.data.field_names,
            data_key: this.data_key
          }).then(res => {
            treatSuccess(res, notify)
          }).catch((error)=>{
            treatBlobError(error, notify)
          })
        }
      },
      /**
       * １执行到此处
       * ２从此处开始执行
       * 调用此处
       * curid:当前点击的id,draw:面板信息,nodeids:此时要更新的id数组,type：to_current_node开始执行　from_current_node从此处开始执行
       */
      runOptions(curid, type){ //
        if(this.$isMutexing("experiment")){
          return
        }
        this.clickRunId = curid
        this.runId = curid
        this.$store.dispatch('setDflowMsg',[])
        this.isContinue = 0
        const proid = this.$store.getters.curProId
        const { mflow: { piplineDraw }} = this.$store.state
        this.updateOnceDraw(()=>{ //更新一次面板
          runCurrent(proid, { node_uuid: curid, type: type, panel: piplineDraw }).then(res => {
            console.log('点击运行返回结果：', res)
            const status = res.status.toString()
            if(status.charAt(0) != 2){
              this.runAfterError()
              this.endFlowSetLoadingErr()
              this.$message.error(res.data.message)
            }
          }).catch((error)=>{
            console.log(error)
            this.$message.error(error.message)
            this.runAfterError()
            this.endFlowSetLoadingErr()
          })
        })
      },
      /**
       * 面板内容操作初始化
       */
      coreRender(that) {
        draggable._init(that)
        const core = {}
        core.relative_w = 75
        core.relative_h = 14
        core.$tree_node_elm_source = null
        core.$tree_node_dragging_elm = null
        core.work_panel_scope = { x1: 0, x2: 0, y1: 0, y2: 0 }
        // 计算边界值
        core.checkDropScope = function(event) {
          event = event || window.event
          const scollTop = ScollPostion().top //获取滚动条top
          if (event.clientX > core.work_panel_scope.x1 && event.clientX < core.work_panel_scope.x2 &&
            event.clientY > (core.work_panel_scope.y1 - scollTop) && event.clientY < core.work_panel_scope.y2) {
            return true
          }
          return false
        }
        // 辅助对齐 - 动态创建的对齐参照
        that.ref_node_elm = null
        // 辅助对齐 - 源算法组件
        that.ref_node_elm_source = null
        // 初始化菜单
        context.init({ preventDoubleContext: false })
        // 设置左侧栏高度
        $('#handle_tree').height(document.body.scrollHeight-120)

        $('#handle_tree').on('mouseover', 'a[treenode_a]', function(event) {
          const isEnd = $(this).find('span._icon_node').length
          if (isEnd) {
            $(this).addClass('ztree-node-a-hover')
          }
          return false
        })

        $('#handle_tree').on('mouseleave', 'a[treenode_a]', function(event) {
          $(this).removeClass('ztree-node-a-hover')
          return false
        })
        $('#handle_tree').on('mousedown', 'a[treenode_a]', function(event) {
          event = event || window.event
          const iconnode = $(this).find('span._icon_node')
          if (iconnode.length) {
            let classname = ''
            try {
              classname = $(this).find('span._icon_node')[0].className.split(' ').slice(1).toString().replace(/\,/g, ' ')
            } catch (e) {
              console.log(e)
              classname = 'el-icon-tickets'
            }
            $('#tempnode').remove()
            let template = $('#node_template').html()
            template = template.replace(/\$\{nodeId\}/g, 'tempnode').replace(/\$\{icon\}/g, classname)
            template = template.replace(/\$\{text\}/g, $(this).find('.node_name').text())
            const nd = $(template)
            nd.css({ left: event.clientX - core.relative_w, top: event.clientY - core.relative_h + ScollPostion().top})
            $('body').append(nd)
            core.$tree_node_dragging_elm = nd
            core.$tree_node_elm_source = $(event.target).parent()
            core.work_panel_scope.x1 = $('#work_panel').offset().left
            core.work_panel_scope.x2 = $('#work_panel').offset().left + $('#work_panel').width()
            core.work_panel_scope.y1 = $('#work_panel').offset().top + ScollPostion().top
            core.work_panel_scope.y2 = $('#work_panel').offset().top + $('#work_panel').height()+ScollPostion().top
          }

        })
        //
        $(document).on('mousedown', '.draggable', function(event) {
          event = event || window.event
          if (event.button != 0) {
            return false
          }

          that.ref_node_elm_source = this
          draggable.addRefNode(that)
          draggable.start(event)
        })
        /**点击不同节点右侧分发不同组件***/
        $('#work_panel').on('click', '.draggable', _.throttle(function(event){
          event = event || window.event
          console.log('两秒内仅发生一次点击事件')
          // if(!that.curClickId || (that.curClickId !== this.id)){
          const id = that.curClickId = this.id // 当前点节点id
          id && that.setNodeBColor(id)
          const el = document.getElementById(id)
          const type =  getDataset(el).type
          const treeid = getDataset(el).treenodeid
          const provNodeIds = that.getProvNodesAndIndex(id) // 获取初始上有节点信息
          let proNodes = that.resetProColumns(provNodeIds).nodes // 重新排序上游节点
          const provNode = that.resetProColumns(provNodeIds).ids //

          if((proNodes && proNodes.length > 0) || type != 'alg'){
            const query = [that.$store.getters.curProId, id, {
              tree_id: treeid,
              type: type,
              prev_node: JSON.stringify(proNodes) // id：上游id，v：上游节点输出点下标，index：此节点输入点下标
            }]
            that.getClickPanel() // 获取当前点击节点所在流程面板 保存pipeline使用
            let params = new Promise((resolve, reject) => {
              getTreeNodeIdParams(...query).then(res=>{
                if(res.data.status !== 200){
                  that.$message.error(res.data.message)
                  return false
                }
                resolve(res)
              }).catch(error=>{
                reject(error)
              })
            })
            params.then(res=>{
              const data = res.data.datas
              data.output_columns = data.output_columns
              data['query'] = query
              that.paramsSwitch(type, data, that, provNode, $(this).attr('name'))
            }).catch(error=>{
              console.log(error)
              that.resetLeftOptions()
            })
          } else {
            console.log('没有上游节点')
          }
        }, 2000, { 'trailing': false }))

        //　节点移动
        $(document).mousemove(function(event) {
          event = event || window.event
          if (that.ref_node_elm) {
            var ui = { position: {}}
            ui.position.top = $(that.ref_node_elm).position().top + ScollPostion().top
            ui.position.left = $(that.ref_node_elm).position().left
            draggable.drag(event, ui)
            that.isMove = true
          } else if (core.$tree_node_dragging_elm) {
            if (core.$tree_node_dragging_elm.is(':animated')) {
              return false
            }
            core.$tree_node_dragging_elm.css({
              left: event.clientX - core.relative_w ,
              top: event.clientY - core.relative_h + ScollPostion().top
            })
          }
        })
        // 托放
        $(document).mouseup(async function(event) {
          event = event || window.event // 解决FF和ie event兼容问题
          if (that.ref_node_elm) {
            draggable.stop()
            $(that.ref_node_elm).remove()
            that.ref_node_elm = null
            that.ref_node_elm_source = null
            /**移动节点更新面板**/
            that.isMove && setTimeout(()=>{ that.updateWhich()},500)/**判断移动节点更新**/
            that.isMove = false // 更新结束　移动标识改变
          } else if (core.$tree_node_dragging_elm) {
            if (core.checkDropScope(event)) {
              /**增加节点**/
              core.$tree_node_dragging_elm.remove()
              core.$tree_node_dragging_elm = null
              const canvasNode = $('.jtk-surface-canvas')
              const layoutLeft = $('.layout-left')
              if(!that.$store.getters.curProId){
                that.$message.error(that.$t('messages.flow.real_flow_error2'))
                return
              }

              const zoom =  window.renderer.getZoom()
              const TEMPX = 156
              const TEMPY = 80
              let x = (event.pageX - $('.layout-left').width() - $('.jtk-surface-canvas').position().left - that.offsetOpened)/zoom;
              let y = (event.pageY - $('.layout-left').offset().top - $('.jtk-surface-canvas').position().top - 80)/zoom;

              const uid = jsPlumbUtil.uuid().replace(/\-/g, '')
              // core.$tree_node_elm_source.find('.node_name').text()
              const node = window.addJsplumbNode(uid, core.$tree_node_elm_source, { x: x, y: y })
              const nodeinfo = core.$tree_node_elm_source.find('.ztree-node-icon').data()
              try {
                const createNode = await createExperimentNode(that.$store.getters.curProId, uid, {
                  tree_id: nodeinfo.treenodeid,
                  type: nodeinfo.type
                })
                const inp = new Array(parseInt(nodeinfo.input) || 0)
                const out = new Array(parseInt(nodeinfo.output) || 0)
                addJsplumbPort(node, out, 'output')
                addJsplumbPort(node, inp, 'input')
                /**新增节点更新面板**/
                that.updateWhich()
              }catch (e) {
                that.$message.error('Create node error!')
                $('#'+uid).remove()
                console.log(e)
              }
            } else {
              core.$tree_node_dragging_elm.animate({
                left: core.$tree_node_elm_source.offset().left,
                top: core.$tree_node_elm_source.offset().top
              }, 400, function() {
                core.$tree_node_dragging_elm.remove()
                core.$tree_node_dragging_elm = null
              })
            }
          }
        })
        // function keyUp(e) {
        //   var currKey = 0, e = e || event
        //   currKey = e.keyCode || e.which || e.charCode
        //   var keyName = String.fromCharCode(currKey)
        //   // alert("按键码: " + currKey + " 字符: " + keyName);
        //   if (currKey == 8) {
        //     alert(11)
        //   }
        // }
        // 监听删除
        // document.onkeyup = keyUp
      },
      /**
       * 点击节点时获取节点数据或参数
       * @param type
       * @param data
       * @param that
       * @param provNode
       */
      paramsSwitch(type, data, that, provNode, nodeName){
        const list = data.func_args
        switch (type) {
          case 'data':
            const newdata = _.map(data.fields_list, (v, k) => {
              return { name: v, zname: v}
            })
            that.optiondata = {
              type:'Data',
              data: newdata,
              sqlargs: data.sql_args,
              nodename: nodeName
            }
            break;
          case 'hive':
          case 'data_hive':
          case 'csv':
          case 'dataframe_to_hive':
            const newdatahive = _.map(data.fields_list, (v, k) => {
              if (v.zname) {
                return { name: v.name, zname: v.zname, dtype: v.type }
              }
              return { name: v.name, zname: v.name, dtype: v.type }
            })
            that.optiondata = {
              type:'Data',
              data: newdatahive,
              sqlargs: data.sql_args,
              nodename: nodeName
            }
            break;
          case 'alg':
          case 'reuse':
          case 'pri_alg':
          case 'cus_alg':
            let temp = _.cloneDeep(list)
            let nodeitem = list
            if(_.isEmpty(provNode)){
              nodeitem = that.resetArgs(temp)
            }
            const duoc = data.output_columns
            if(duoc && duoc.length > 0){
              const cols = duoc.map((item) => {
                return item.inputcols
              })
              const colsType = duoc.map((item) => {
                return item.inputcolstype
              })
              that.optiondata = {
                type:'ParameterItem',
                data:{ args: nodeitem, provids: provNode, provData: cols, provType: colsType, query: data['query'] }
              }
            } else {
              that.resetLeftOptions()
              that.$message.error('数据集出现错误!')
            }

            break;
          case 'trained':
            that.optiondata = {
              type:'Obj',
              data:list
            }
            break;
          default:
            that.resetLeftOptions()
        }
      },
      showVisual(data,title){
        this.visualData = title
        this.ShowVisualVisible = true
        this.ShowVisualList = data
      },
      textVisual(title){
        this.visualData = title
        this.ShowVisualVisible = true
      },
      setVisualVisible(visible){
        this.ShowVisualVisible = visible
        this.ShowVisualList = [] //这里需要重置预览组件数据
      },
      transferChartType(type){
        this.transferChart = {}
        this.transferChart[type] = 'primary'
        this.cascadeIndex = null
        if(type === '0'){
          this.chartPlaceholder = this.$t('strings.flow.select_chart_type')
        }else{
          this.chartPlaceholder = this.$t('strings.flow.select_chart_type2')
        }
      },
      saveModelClose(){
        this.addModelError = false
        this.addModelErrorMessage = null
        this.$refs['mSaveForm'].resetFields()
        this.ModelSaveVisible = false
      },
      footCall(str){
        if(str==='clear'){
          this.wsReturnMsg = []
        }
      },
      subscribSocket(uuid, appid){
        this.run_uuid && this.$socket.emit('leave', `/runs/${this.run_uuid}/logs`)// 先断开原来的socket
        this.run_appid && this.$socket.emit('leave', `/runs/${this.run_appid}/logs`)// 先断开原来的socket
        if(uuid){
          this.run_uuid = uuid // todo 赋值uuid
          this.$socket.emit('join', `/runs/${uuid}/logs`)// 加入socket
        }
        if(appid){
          this.run_appid = appid
          this.$socket.emit('join', `/runs/${appid}/logs`)// 加入socket
        }
      }
    },
    sockets: {
      //查看socket是否渲染成功
      connect() {
        console.log("数据实验socket链接成功");
      },
      users(data){
        console.log('users', data)
      },
      disconnect(){
        this.$socket.emit('join', `/runs/${this.uuid}/logs`)
      },
      reconnect(){
        console.log("socket重新链接");
      },
      message(data) {
        console.log("这是socket接收到的信息：", data);//接收的消息
        this.receive_message(data)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "./style/panel.scss";
</style>
<style  rel="stylesheet/scss" lang="scss">
  // todo 此处需要设置为全局属性
  .path-ani { stroke-dasharray: 8; stroke-dashoffset: 8; animation: pdash 8s  linear infinite reverse; } @keyframes pdash { to { stroke-dashoffset: 400; } }
  // todo 数据实验菜单选项不可点击
  .dropdown-menu > li > a.disabled {
    color: #ccc;
    cursor: default;
    background-color: #fff;
    &:hover, &:focus{
      background-color: #fff;
    }
  }

  .dropdown-menu li > a > i {
    margin-right: 4px;
  }
</style>
