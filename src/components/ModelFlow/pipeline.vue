<template>
  <div id="editor" v-loading="loading">
    <el-container  id="main_layout">
      <!--节点树结构-->
      <el-aside class="layout-left" id="tree_alg">
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
          <pipeline-top-option id="options" @reset="resetDraw" :rlen="drawcache.length" :save_loading="save_loading" @save="pipelineSave"/>
        </el-header>
        <!--面板中部-->
        <el-main style="height:100%;" id="panel_main">
          <div style="overflow:auto;height:100%;background-color: #fff;" >
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
        </el-main>
      </el-container>
      <!--参数设置区-->
      <el-aside class="layout-left" style="" id="params">
        <el-row>
          <el-col :span="24">
            <el-card shadow="never" body-style="padding:15px 10px;" >
              {{ $t('strings.flow.options') }}
            </el-card>
          </el-col>
          <el-col :span="24">
            <el-card shadow="never" body-style="padding:5px; padding-left: 10px;">
              <Option :optiond ="optiondata" :ispipeline="isPipeline"/>
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
        <span class="status el-icon-delete" style="position: absolute;right: 0;top:0;"/>
      </div>
    </div>

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

  import context from './resoult/context'
  import { initJsPlumb } from './resoult/initJsPlumb'
  import draggable from './resoult/draggable'
  require('./resoult/js/jsplumb/jsplumbtoolkit.js')
  require('./resoult/jsplumb-persistence-plugin.js')

  import { sliderMenu } from '@/api/experiment/process'
  import { getDataset, ScollPostion } from '@/utils/index'
  import Option  from './components/Option' // 面板右侧选项
  import PipelineTopOption from './components/PipelineTopOption'
  import { validateReplaceStr2, getNodesLinks2} from '@/utils/index'
  import FlowCommon  from './mixin/flowcommon'
  import { commonConfirm } from '@/utils/actions'
  import {
    getPipelinePanel,
    putPipelinePanel,
    getPipelineParams,
    updatePipelineParams,
    getPipelineIdsParams,
    updatePipelineSave,
    resetPipelineContent
  } from '@/api/experiment/pipelines'

  // import Driver from 'driver.js'
  // import 'driver.js/dist/driver.min.css'
  // import steps from './driver/steps'

  export default {
    name: 'ModelFlow',
    components: { Option, PipelineTopOption, validateReplaceStr2 },
    extends: FlowCommon,
    data() {
      return {
        isPipeline: true, //是否是pipeline页面
        isMove: false,//判断是否正在拖动节点
        oldArgs: {},//右侧参数变更之前得值
        runId: null, //　当前正在执行节点id
        params: null, //点击操作时保存相关参数
        offsetOpened: 252,
        drawcache: [],
        removed: [],
        nodesParams: {},
        pipelineId: this.$route.query.id,
        save_loading: false,
        driver: null
      }
    },
    watch:{
      '$store.getters.opreates':{
        /**newer和older是浅拷贝所有无法判断两者是否想等**/
        handler:function(newer,older){
          const id = this.curClickId
          const oldValue = this.oldArgs[id]
          const isArgChange = oldValue ? _.isEqual(oldValue.args, newer.args) : true
          if(oldValue && !isArgChange){ //oldValue存在并且此节点的旧参数和新参数不想等
            this.save_loading = true
            this.nodesParams[id] = this.getColumnsParams(newer)
            this.updateNodeidParams(_.cloneDeep(newer), id) // 更新

          }
          this.oldArgs[this.curClickId] = _.cloneDeep(newer) //需要深拷贝
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
    mounted() {
      // this.driver = new Driver
      this.$nextTick(() => {
        this.initPNode()
        // this.driver.defineSteps(steps)
        // this.driver.start()
      })
    },
    beforeDestroy(){
    //  组件销毁之前
      this.isleave = true
      this.isPipeline = false
      this.oldArgs = {}
      this.resetListener()
      console.log('空置pipeline')
      resetPipelineContent(this.pipelineId)
    },
    methods: {
      // 处理一二级菜单节点 然后异步获取数据节点
      async initPNode() {
        const slider = await sliderMenu()
        try {
          this.pNodes = slider.data.datas
          this.treeDi(this.pNodes)
          this.initTree()
          this.coreRender(this)
          const pid = this.$route.query.id
          if(!pid){
            initJsPlumb(this,{})
            this.loading = false
            return
          }
          const result = await getPipelinePanel(pid)
          const { data: { panel }} = result
          initJsPlumb(this, panel)
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
        // 递归所有数据渲染属性结构
        function treeNodeDi(nodes){
          return nodes.map((v, k) => {
            let name = v.node_zname
            if (!v.func_description) { // flowcommon.js的ztree setting中需要制定func_description字段为title显示字段
              v.func_description = ""
            }
            let idt = new Date().getTime()
            let rm = idt + parseInt(Math.random(1)*100000)
            let id = rm +'_' + v.tree_node_id
            if(v.children){
              const children = treeNodeDi(v.children)
              return Object.assign(v, { id: id, ico: 'ico-folder-open', name: name, children: children })
            }else{
              return Object.assign(v, { id: id, isParent: false, ico: 'el-icon-tickets', name: v.node_zname })
            }
          })
        }
        return treeNodeDi(treeNode)
      },
      /**
       * 0.5s后触发参数更新操作开启
       * newer参数
       */
      updateNodeidParams: _.debounce(function(newer, id) {
        const el = document.getElementById(this.curClickId)
        const treeid = el.dataset.treenodeid
        updatePipelineParams(this.$route.query.id, this.curClickId, {
          func_args: newer.args,
          tree_id: treeid,
          prev_node: this.getProvNodesAndIndex(this.curClickId),
        }).then(res => {
          console.log(res)
          this.save_loading = false
          Object.keys(this.getDraws().nodes).some(item => {
            $('#'+item).removeClass('check-error')
          })
          this.getNextPipelineParams(id)
        }).catch(error=>{
          this.save_loading = false
          console.log(error)
        })
      }, 500),

      /** *init right mouse menu **/
      addMenu(type, obj, _this) {
        // _this.setNodeMenu(obj,_this)
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
          const isEnd = $(this).find('span.el-icon-tickets').length
          if (isEnd) {
            $(this).addClass('ztree-node-a-hover')
          }
          return false
        })

        $('#work_panel').on('click', '.pipeline-del', function(event){
          const dev = this.parentElement
          const text = dev.children[1].innerHTML
          const id = dev.id
          commonConfirm(that, () => {
            that.drawcache.push(that.getDraws())
            that.jsp.remove(id)
            that.removed.push(id)
            if (that.curClickId === id) {
              that.curClickId = null
            }
            /**删除更新面板***/
            // that.updateWhich(this.getNextPipelineParams, id)
          }, '确定要删除' + text +'吗?', null, 'warning')
          // deleteConfirm(text, () => {
          //   that.drawcache.push(that.getDraws())
          //   that.jsp.remove(id)
          //   that.removed.push(id)
          //   if (that.curClickId === id) {
          //     that.curClickId = null
          //   }
          //   /**删除更新面板***/
          //   // that.updateWhich(this.getNextPipelineParams, id)
          // }, that)
        })

        $('#handle_tree').on('mouseleave', 'a[treenode_a]', function(event) {
          $(this).removeClass('ztree-node-a-hover')
          return false
        })
        $('#handle_tree').on('mousedown', 'a[treenode_a]', function(event) {
          event = event || window.event
          const isEnd = $(this).find('span.el-icon-tickets').length
          if (isEnd) {
            $('#tempnode').remove()
            let template = $('#node_template').html()
            template = template.replace(/\$\{nodeId\}/g, 'tempnode').replace(/\$\{icon\}/g, 'el-icon-tickets')
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
          draggable.addRefNode()
          draggable.start(event)
        })
        /**点击不同节点右侧分发不同组件***/
        $('#work_panel').on('click', '.draggable', _.throttle(function(event){
          // if(!that.curClickId || (that.curClickId !== this.id)) {
          that.save_loading = true
          const id = that.curClickId = this.id // 当前点节点id
          id && that.setNodeBColor(id)
          const el = document.getElementById(id)
          const type = getDataset(el).type
          const treeid = getDataset(el).treenodeid
          const provNodeIds = that.getProvNodesAndIndex(id) // 获取初始上有节点信息
          let proNodes = that.resetProColumns(provNodeIds).nodes // 重新排序上游节点
          const provNode = that.resetProColumns(provNodeIds).ids // 重新排序上游节点 仅有节点
          let params = new Promise((resolve, reject) => {
            getPipelineParams(that.$route.query.id, id, {
              tree_id: treeid,
              type: type,
              // prev_id: JSON.stringify(provNode), //
              prev_node: JSON.stringify(proNodes) // id：上游id，v：上游节点输出点下标，index：此节点输入点下标
            }).then(res => {
              resolve(res)
            }).catch(error => {
              reject(error)
            })
          })

          params.then(res => {
            that.save_loading = false
            const { data: { input_args } } = res
            const data = input_args ? typeof input_args == 'string' ? JSON.parse(input_args) : input_args : null
            data.output_columns = data.temporary_func_args ? data.temporary_func_args : data.output_columns
            data && that.paramsSwitch(type, data, that, provNode, $(this).attr('name'))
          }).catch(error => {
            console.log(error)
            that.save_loading = false
            that.resetLeftOptions()
          })
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
        $(document).mouseup(function(event) {
          event = event || window.event // 解决FF和ie event兼容问题
          if (that.ref_node_elm) {
            draggable.stop()
            $(that.ref_node_elm).remove()
            that.ref_node_elm = null
            that.ref_node_elm_source = null
            /**移动节点更新面板**/
            // that.isMove && setTimeout(()=>{ that.updateWhich()},500)/**判断移动节点更新**/
            that.isMove = false // 更新结束　移动标识改变
          } else if (core.$tree_node_dragging_elm) {
            if (core.checkDropScope(event)) {
              /**增加节点**/
              core.$tree_node_dragging_elm.remove()
              core.$tree_node_dragging_elm = null
              const canvasNode = $('.jtk-surface-canvas')
              const layoutLeft = $('.layout-left')
              if(!that.$route.query.id){
                that.$message.error('没有找到相应PIPELINE')
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
              $('#'+uid).remove()
              that.$message.error(that.$t('messages.pipeline.add_node_error'))
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
          case 'data_hive':
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
                data:{ args: nodeitem, provids: provNode, provData: cols, provType: colsType }
              }
            } else {
              that.resetLeftOptions()
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
      /**
       * 重写更新面板函数 pipeline 在连线和删除连线时使用
       */
      async updateWhich(conn){
        // const res = await this.updateOnceDrawPipeline()
        // if(res){
        //   this.getNextPipelineParams(conn.sourceId)
        // }
        this.getNextPipelineParams(conn.sourceId)
      },
      updateOnceDraw:_.throttle((func, param) => {
        let id = this.$route.query.id
        const draw =  getNodesLinks2($, jsPlumb, this)
        if(id){
          putPipelinePanel(id, {'panel':draw}).then(res=>{
            func && func(param)
          }).catch((error) => {
            this.$message.error("panel update error!")
          })
        }
      }, 100),

      updateOnceDrawPipeline() {
        let id = this.$route.query.id
        const draw =  getNodesLinks2($, jsPlumb, this)
        return new Promise((resolve, reject) => {
          if(id){
            putPipelinePanel(id, {'panel':draw}).then(res=>{
              resolve(res)
            }).catch((error) => {
              console.log(error)
              this.$message.error("panel update error!")
              reject(false)
            })
          } else {
            reject(false)
          }
        })
      },
      /**
       * 撤销操作
       */
      resetDraw() {
        const popdraw = this.drawcache.pop()
        this.removed.pop()
        if(popdraw && this.jsp){
          this.delateAllNc()
          jsPlumb.load(this,popdraw,this.jsp)
          // this.updateWhich()
        } else {
          this.$message.error(this.$t('messages.pipeline.reset_error'))
        }
      },
      async pipelineSave(){
        const draws = getNodesLinks2($, jsPlumb, this), { nodes, links } = draws, nodeskey = Object.keys(nodes), linkskey = Object.keys(links)
        const ids = nodeskey.toString()
        if(linkskey.length < nodeskey.length - 1) {
          this.$message.error(this.$t('messages.pipeline.have_alone_node'))
          return false
        }
        if(nodeskey.length < 2) {
          this.$message.error(this.$t('messages.pipeline.select_more'))
          return false
        }
        const errIds = []
        this.save_loading = true
        try {
          const res = await getPipelineIdsParams(this.$route.query.id, { ids: ids })
          const { data: { data }} = res
          // 验证操作
          data && data.filter(item => item.type=='alg' && item.temporary_func_args).forEach(item => {
            // input_args：旧的参数和输出列 temporary_func_args：缓存内的(新的)参数和输出列
            const { id, temporary_func_args, input_args } = item
            const func_args = temporary_func_args && temporary_func_args.func_args ? temporary_func_args.func_args : input_args.func_args
            const uponColumns = temporary_func_args ? temporary_func_args.output_columns : input_args.output_columns
            for (let i = 0, len = func_args.length; i < len; i++) {
              const { arg_type, arg_range, arg_index, arg_value, select_count, select_type } = func_args[i]
              const colsData = uponColumns[arg_index ? arg_index : 0] // n为空时 输出列为空出现错误
              const { inputcols, inputcolstype } = colsData
              if(arg_type === 'columns' && !arg_range && arg_value){
                const temp = inputcols && arg_value.filter(m => inputcols.indexOf(m) < 0 )
                if(!inputcols || temp.length > 0){ // 所选的值是否都在inputcols字段列表中
                  errIds.push(id)
                } else if (select_count !== arg_value.length){ // 验证字段个数是否和之前的相同
                  // this.$message.error('需要选择相同个数的字段')
                  errIds.push(id)
                } else if (!this.isSameType(arg_value, inputcols, inputcolstype, select_type)){ // 验证所选的值类型是否都和之前相同
                  errIds.push(id)
                }
              }
              if(arg_type === 'list' && !arg_range && arg_value){
                if(inputcols.indexOf(arg_value) < 0){ // inputcols 不能在这里使用
                  errIds.push(id)
                } else if (!this.isSameType(arg_value, inputcols, inputcolstype, select_type)){ // 验证所选的值类型是否都和之前相同
                  errIds.push(id)
                }
              }
              console.log('第一层：', arg_type , arg_value, inputcols, inputcolstype, select_type)
              if(arg_type === 'addComp' && arg_range && arg_value){
                const inArrayArgs = (arg_value && typeof arg_value === 'string') ? JSON.parse(arg_value) : arg_value
                for (let j = 0, l = inArrayArgs.length; j < l; j++) {
                  const inArgs = inArrayArgs[j].args, inProvNodes = uponColumns //  这里需要拿到输入字段信息 用来验证第二层嵌套参数
                  for (let k = 0, kl = inArgs.length; k < kl; k++) {
                    try {
                      const intype = inArgs[k].arg_type, inrange = inArgs[k].arg_range, inindex = inArgs[k].arg_index, invalue = inArgs[k].arg_value, in_select_count = inArgs[k].select_count,in_select_type = inArgs[k].select_type
                      const inColsData = inProvNodes[inindex ? inindex : 0], inInputCols = inColsData.inputcols, inInputColsType = inColsData.inputcolstype
                      if(intype === 'columns' && !inrange && invalue){
                        const temp = inInputCols && invalue.filter(m => inInputCols.indexOf(m) < 0 )
                        if(temp.length > 0){
                          errIds.push(id)
                        } else if (in_select_count !== invalue.length){ // 验证字段个数是否和之前的相同
                          errIds.push(id)
                        } else if(!this.isSameType(invalue, inInputCols, inInputColsType, in_select_type)){
                          errIds.push(id)
                        }
                      }
                      // console.log('第二层：', intype , invalue, inInputCols, inInputColsType, in_select_type)
                      if(intype === 'list' && !inrange && invalue){
                        if(inInputCols.indexOf(invalue) < 0){
                          errIds.push(id)
                        } else if(!this.isSameType(invalue, inInputCols, inInputColsType, in_select_type)){
                          errIds.push(id)
                        }
                      }
                    } catch (e) {
                      console.log(e)
                      errIds.push(id)
                    }
                  }
                }
              }
            }
          })
          if(errIds.length > 0){
            this.save_loading = false
            this.$message.error(this.$t('messages.pipeline.save_checked_error'))
            this.setErrorNodeColor(errIds)
          } else {
            console.log('通过验证')
            const removed = this.removed.length > 0 ? this.removed : undefined
            const updatePanel = await this.updateOnceDrawPipeline()// 保存一次面板信息
            if(updatePanel) {
              const saveResult = await updatePipelineSave(this.$route.query.id, { args: this.nodesParams, panel: draws, removed })
              this.save_loading = false
              if(saveResult){
                this.drawcache = []
                this.$message.success(this.$t('messages.save_success'))
              }
              console.log(saveResult)
            }
          }
        } catch (e) {
          this.save_loading = false
          console.log(e)
          this.$message.error('error')
        }
      },
      /**
       * 添加pipeline验证错误时给出提示
       **/
      setErrorNodeColor(ids){
        ids.some(item=>{
          $('#'+item).addClass('check-error-breathe')
          const a = setTimeout(function(){
            $('#'+item).removeClass('check-error-breathe').addClass('check-error')
            clearTimeout(a)
          }, 1500)
        })
      },
      /**
       * 当参数修改或删除节点时, 获取一次下游节点参数信息 仅获取不操作(是为了更新下游的输出列)
       * @param id
       */
      getNextPipelineParams(id){
        const nodes = this.getNodeNextId(id)
        this.save_loading = true
        if(!nodes) this.save_loading = false
        nodes && nodes.some(item => {
          const el = document.getElementById(item)
          const type = getDataset(el).type
          const treeid = getDataset(el).treenodeid
          const provNodeIds = this.getProvNodesAndIndex(item) // 获取初始上有节点信息
          let proNodes = this.resetProColumns(provNodeIds).nodes // 重新排序上游节点
          getPipelineParams(this.$route.query.id, item, {
            tree_id: treeid,
            type: type,
            prev_node: JSON.stringify(proNodes)
          }).then(res=>{
            this.save_loading = false
            console.log(res)
          }).catch(err => {
            console.log(err)
            this.save_loading = false
          })
        })
        Object.keys(this.getDraws().nodes).some(item => {
          $('#'+item).removeClass('check-error')
        })
      },
      getColumnsParams(newer){
        const { args } = newer
        const change = {}
        for (let i = 0,len = args.length; i < len; i++) {
          const { arg_type, arg_range, arg_name, arg_value } = args[i]
          if((arg_type == 'columns') && !arg_range){
            change[arg_name] = arg_value || []
          }
          if((arg_type == 'list') && !arg_range){
            change[arg_name] = arg_value
          }
          if(arg_type == 'addComp' && arg_range) { // addComp内都要传
            const inArgs = (arg_value && typeof arg_value === 'string') ? JSON.parse(arg_value) : arg_value
            console.log(arg_name, 'addComp', inArgs)
            const temp = []
            for (let j = 0, l = inArgs.length; j < l; j++) {
              const inarg = inArgs[j].args
              const a = []
              for (let k = 0, kl = inarg.length; k < kl ; k++) {
                const val = inarg[k]
                const type = val.arg_type, range = val.arg_range, v = val.arg_value, name = val.arg_name
                if(type == 'columns'){
                  a.push(v || [])
                }
                a.push(v)
              }
              temp.push(a)
            }
            if(temp.length > 0) change[arg_name] = temp
          }
        }
        console.log(change)
        return change
      },
      isSameType(values, inputcols, inputcolstype, select_type){
        if(!Array.isArray(select_type)){
          const type = inputcolstype[inputcols.indexOf(values)]
          if(type !== inputcolstype[select_type]){
            return false
          }
        }
        for(let i = 0, len = values.length; i < len; i++){
          const type = inputcolstype[inputcols.indexOf(values[i])]
          if(type !== inputcolstype[select_type[i]]){
            return false
          }
        }
        return true
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  @import "./style/panel.scss";
</style>
