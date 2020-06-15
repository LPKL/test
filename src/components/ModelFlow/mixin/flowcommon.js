import { getDataset , getNodesLinks, getNodesLinks2} from '@/utils/index'
import { commonConfirm } from '@/utils/actions'
import { getMenuOption, getOneModelProject, getFlowNodeAvailableFields, upDateModelProject, runCurrentNodes, saveDataFlowNode, delNodesParams, getDataExpConf } from '@/api/experiment'
import context from '../resoult/context'
import $ from 'jquery'
import _ from 'lodash'

export default {
  data(){
    return {
      pNodes: null,//树型结构数据
      optiondata:{
        type:null,
        data:null,
      },//侧栏选项数据
      loading:true,
      curClickId:null,//当前单击节点ＩＤ
      clickRunId:null,
      treeId: 'handle_tree',//左侧侧栏渲染ＩＤ
      treeObj: null,//渲染出来的侧栏对象
      isContinue:0,
      isleave:false, //
      setting: {
        edit: {
          enable: false,
          showRenameBtn: false,
          showRemoveBtn: false
        },
        data: {
          key: {
              title: "func_description"
          },
          simpleData: {
            enable: false
          }
        },
        callback: {
          beforeClick: this.zTreeBeforeClick,
          // onExpand: this.onTreeExpand.bind(this)
        },
        view: {
          showLine: false,
          showTitle: true,
          showIcon: false,
          selectedMulti: false,
          addDiyDom: this.addDiyDom
        }
      },//左侧侧栏渲染组建设置内容
      runNodes:[],//当前正在计算运行的节
      searchtext:'',//搜索内容
      isend: true, // 菜单请求标志
      //数据探查
      dialogCascade: false,
      node_id: null,
      data_key: '', //数据探查中为了分辨是哪个数据集
      tmpNodeid: '', // 数据探查图表导出时需使用nodeid字段
      run_uuid: null, // 订阅socket时使用
      run_appid: null // 订阅socket时使用
    }
  },
  watch:{
    searchtext: _.debounce(function(text){
      if(text){
        this.searchNode(text)
      }else{
        this.resetTreeDi()
      }
    },500)
  },

  methods: {
    /**
     * 数据可视化请求开始
     * @param id
     * @param flag
     */
    setVisualzation(id,flag, key){
      this.node_id = id
      const data = {
        // authuser_id: this.$store.getters.id,
        project_id: parseInt(this.$store.getters.curProId),
        node_id: id,
        // flag:flag,
        data_key: key ? key : ''
      }
      this.data_key = key
      this.tagglePreview(data).then(res=>{
        const result = res.data.datas
        console.log('探查tagglePreview',result)
        this.clickDialogCascade(result,result.chart_conf)
        // todo 数据可视化根据选择列可视化
        // this.clickDialogCascade(result.args,result.select_columns,result.chart_conf)
      })
    },
    /***
     * 数据可视化请求结束　cascade组件弹框操作
     */
    clickDialogCascade(res,chart_conf){
      this.dialogCascade = true
      const { dataset_id, output_columns, reuse_fields, reuse_node_data_key } = res
      setTimeout(() => {
        this.$refs.compChart.loadCharts(output_columns, chart_conf, dataset_id, reuse_fields, reuse_node_data_key)
      }, 500)
    },
    /**
     * 关闭弹窗时重置操作
     */
    beforecloseCasc() {
      this.dialogCascade = false
      this.$refs.compChart.reset()
    },
    //删除所有节点和线
    delateAllNc() {
      let allnode = $('.jtk-node')
      _.each(allnode, (v, k) => {
        this.jsp.remove(v.id);
      })
    },
    /** *init tree **/
    initTree() {
      this.treeObj = $.fn.zTree.init($('#' + this.treeId), this.setting, this.pNodes)
    },
    // 属性结构添加设置属性
    addDiyDom(treeId, treeNode) {
      const aObj = $('#' + treeNode.tId + '_a')
      if ($('#diySpan_' + treeNode.id).length > 0) return
      const editStr = `<span id='diySpan_${treeNode.id}'
                        class='ztree-node-icon ${treeNode.ico}'
                        data-input=${(treeNode.input || 0)}
                        data-type=${(treeNode.type || '')}
                        data-status=${(treeNode.status || 0)}
                        data-output=${(treeNode.output || 0)}
                        data-treenodeid=${(treeNode.tree_node_id || '')}
                        data-deltype=${treeNode.del_type || 0}> </span>`
      aObj.prepend(editStr)
    },

    // 规避删除冒泡
    zTreeBeforeClick(treeId, treeNode, clickFlag) {
      if (!treeNode) return false
    },

    // 添加绑定成功标识
    addIcon(treeNode) {
      var aObj = $('#' + treeNode.tId + '_a')
      if ($('#sucIcon_' + treeNode.id).length > 0) return
      var iconStr = "<span type='button' class='suc-icon mybtn' id='sucIcon_" + treeNode.id +
        "' ></span>"
      aObj.append(iconStr)
    },
    // 添加编辑按钮
    addEidtBtn(treeId, treeNode) {
      var aObj = $('#' + treeNode.tId + '_a')
      if ($('#editBtn_' + treeNode.id).length > 0) return
      var editStr = "<span type='button' class='button edit mybtn' id='editBtn_" + treeNode.id +
        "' title='编辑' ></span>"
      aObj.append(editStr)
      var btn = $('#editBtn_' + treeNode.id)
      if (btn) {
        btn.bind('click', function() {
          core.initBlock(treeNode.block_html_id)
        })
      }
    },
    // 添加删除按钮
    addDelBtn(treeId, treeNode) {
      var aObj = $('#' + treeNode.tId + '_a')
      if ($('#delBtn_' + treeNode.id).length > 0) return
      var detStr = "<span type='button' class='button remove mybtn' id='delBtn_" + treeNode.id +
        "' title='删除区块' ></span>"
      aObj.append(detStr)
      var btn = $('#delBtn_' + treeNode.id)
      if (btn) {
        btn.bind('click', function() {
          var block_id = treeNode.block_html_id
          core.deleteBlock(block_id)
        })
      }
    },
    // 点击开始运行遇到错误处理操作
    runAfterError() {
      this.jsp.getAllConnections().map((v, k) => {
        v.removeClass('path-ani')
      })
    },
    // delete
    deleteOptions(text, func) {
      commonConfirm(this, func, text, null, 'warning')
      // deleteConfirm(text,func,this)
    },
    // 返回当前节点的上游节点
    getProvNodes(id){
      let temp = []
      this.jsp.getConnections().some((v,k)=>{
        if(v.targetId === id){temp.push(v.sourceId)}
      })
      return temp
    },
    getProvNodesAndIndex(id) {
      const { links, connections } = this.getDraws()
      let provNodeIds = [] // 获取输入列上游节点下标
      connections.some(item=>{
        const exp = new RegExp(id)
        const tid = item.targetEndpointUuid
        const sid = item.sourceEndpointUuid
        const tidSplit = tid.split('-')
        if(exp.test(tid)){
          const sidSplit = sid.split('-')
          provNodeIds.push({
            id: sidSplit[0],
            source: Number(sidSplit[1].slice(-1)), // 出下标
            target: Number(tidSplit[1].slice(-1))  // 入下标
          })
        }
      })
      return provNodeIds
    },
    /*复制节点*/
    copyNode(obj,that){
      // 新节点x,y值
      const x = parseInt($(obj)[0].style.left)+50+'px'
      const y = parseInt($(obj)[0].style.top)-50+'px'
      const copy = $(obj).clone(true)
      // 改变新节点位置
      copy.css({left:x,top:y})
      //　改变接点状态
      changeJspStatusNode(0,copy[0])
      $(obj).after(copy)
      const uuid = jsPlumbUtil.uuid().replace(/\-/g, '')
      //　更话新的id
      copy.attr('id', uuid)
      const nodeinfo = copy.data()
      var inp = new Array(parseInt(nodeinfo.input) || 0)
      var out = new Array(parseInt(nodeinfo.output) || 0)
      // 复制圆点
      addJsplumbPort(copy[0], out, 'output')
      addJsplumbPort(copy[0], inp, 'input')
      //　加上右键操作
      that.addMenu(2, '#' + uuid, that)
      /**复制节点更新面板***/
      that.updateWhich()
    },
    //运行节点状态更新
    changeNodeJsp(endRunNodes,status){
      endRunNodes.some((v,k)=>{
        const node = $('#'+v)[0]
        changeJspStatusNode(status,node)
      })
    },
    // 判断是否正在执行
    isProjectRun(t){
      return new Promise((resolve, reject) => {
        getOneModelProject(this.$store.getters.curProId).then(res=>{
          const attributes = res.data
          const runstatus = attributes.status //实时流程和历史流程没有统一
          // 判断面板是否正在执行　如果是禁止操作面板
          if(runstatus === 1 || runstatus === 5){
            resolve(true)
            this.$message.warning(this.$t('strings.flow.running'))
            console.warn("项目正在运行中...")
          }else{
            resolve(false)
            console.warn("项目没有在运行...")
          }
        }).catch((error) => {
          resolve(false)
          console.error("不能获取工程的运行状态,实时流程状态管理还未做")
          console.log(error)
        })
      })
    },
    /**
     * 设置当前点击节点设置颜色 并去掉其他节点颜色
     * @param id　当前点击接点id
     */
    setNodeBColor(id){
      const element = document.getElementById(id)
      const nodes = $('.jtk-node')
      element && (element.style.boxShadow = '#3d65c9 0px 0px 4px')
      _.some(nodes,(v,k)=>{
        if(v.id !== id){
          v.style.boxShadow = ''
        }
      })
    },
    /**
     * 重新设置右侧选项栏
     * @param arr
     */
    resetArgs(arr){
      if(_.isArray(arr)){
        return arr.map(n=>{
          if(n['arg_type'] && n['arg_type'] === 'columns'){
            n['arg_value'] = ''
            return n
          }else{
            return n
          }
        });
      }else{
        return arr
      }
    },
    /**
     * 右键获取菜单信息
     * @param obj
     * @param v_this
     */
    setNodeMenu(obj,_this){
      $(document).off('contextmenu', obj)
      $(document).on('contextmenu', obj,_.throttle(async function(oEvent) { // 菜单截流操作 1.5s内只能获取一次菜单
        if (!oEvent) oEvent=window.event;
        $(obj).click()
        let id = obj.slice(1)
        const bisRun = await _this.isProjectRun()
        if(!bisRun){
          _this.isend && getMenuOption({ node_id: id, experiment_id: _this.$store.getters.curProId }).then(response=>{
            const status = response.status
            _this.isend = true //放开请求标志
            if (status === 201) {
              _this.$message.error(response.message)
              const data = response.data
              _this.setParamArray(data ,obj,_this,oEvent)
            }else if (status === 200) {
              const data = response.data
              _this.setParamArray(data ,obj,_this,oEvent)
            }else{
              _this.$message.error(response.message ? response.message : 'response error')
            }
          }).catch(error=>{
            _this.isend = true //放开请求标志
            console.log(error)
          })
          _this.isend = false // 禁止请求标志
        }
      },1500))
    },
    /**
     * 拼接菜单选项
     * @param list
     * @param obj
     * @param v_this
     * @param context
     */
    setParamArray(list,obj,_this,e){
      let len = Object.keys(list).length
      var param_array = []
      var idx = 0
      for(let item in list){
        list[item].some(value => {
          param_array[idx++] = _this.switchParamArray(value, _this, obj)
        })
        if(len!==1){ //实时流程去除下方空白
          param_array[idx++] = {
            divider: true
          }
        }
      }
      context.attach(obj, param_array,e)
    },
    switchParamArray(item,that,obj){
      const { menu_zname, isNone, menu_name, value, children, data_key} = item
      const sNodeid =  obj.slice(1)
      this.tmpNodeid = sNodeid
      const tn = document.getElementById(sNodeid)
      const oData = $(obj).data()
      const bInout = (oData.output||oData.input)
      // 如果算法节点没有连线或者节点没有输入输出点都只显示删除菜单
      // 1.算法节点2.节点没有输入3.输入输出都没有
      // 算法节点可以没有输出 但是必要要有输入
      if(!bInout || (bInout && !that.isNodeHaveInPoint(sNodeid, oData.input) && oData.type=='alg')){
        switch (menu_name) {
          case 'delete'://删除
            return {
              text: '<i class="ico-delete"></i>' + menu_zname,
              isNone: isNone,
              action: function(e) {
                e.preventDefault()
                commonConfirm(that, () => {
                  that.jsp.remove(sNodeid)
                  if (that.curClickId === sNodeid) {
                    that.curClickId = null
                  }
                  /**删除更新面板***/
                  that.updateWhich()
                }, '确定要删除节点吗?', null, 'warning')
              }
            }
            break;
          default:
            return {
              text: '<i class="el-icon-menu"></i>' + menu_zname,
              isNone: false,
              action: function(e) {
                e.preventDefault()
              }
            }
            break;
        }
      } else {
        if(children){ //存在下级菜单
          const child = children.map(val => {
            return that.switchParamArray(val,that,obj)
          })
          return {
            text: '<i class="el-icon-edit"></i>' + menu_zname,
            isNone: isNone,
            subMenu: child
          }
        }else {
          switch (menu_name) {
            case 'copy'://复制
              return {
                text: '<i class="ico-copy-node"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.copyNode(obj, that)
                }
              }
              break;
            case 'delete'://删除
              return {
                text: '<i class="ico-delete"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  if(that.$isMutexing("experiment")){
                    return
                  }
                  e.preventDefault()
                  const nextids = that.getDraws().links[sNodeid]
                  // 确定操作
                  commonConfirm(that, () => {
                    that.jsp.remove(sNodeid)
                    if (that.curClickId === sNodeid) {
                      that.curClickId = null
                    }
                    nextids && nextids.some(item => {
                      that.updateNodeParams({ targetId: item }, true)
                    })
                    /**删除更新面板***/
                    that.updateWhich()
                  },  '确定要删除节点吗?', null, 'warning')
                }
              }
              break;
            case "previewTrainedModel"://模型可视化
              return {
                text: '<i class="ico-visible-l"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "saveAsTrainedModel"://模型保存
              return {
                text: '<i class="ico-save"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "previewDataset"://数据预览
              return {
                text: '<i class="ico-visible-l"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  // that.optionModelResult(sNodeid,that,menu_name)
                }
              }
              break;
            case "saveAsDataset"://数据保存
              return {
                text: '<i class="ico-save"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;

            case "previewEvaluationResults"://评估预览
              return {
                text: '<i class="ico-visible-l"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "saveAsEvaluationDataset"://评估保存
              return {
                text: '<i class="ico-save"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "previewScoreDataset"://预测数据预览
              return {
                text: '<i class="ico-visible-l"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "saveAsScoreDataset"://预测数据保存
              return {
                text: '<i class="ico-save"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.optionModelResult(sNodeid, that, menu_name)
                }
              }
              break;
            case "site_stop"://运行到此处
              return {
                text: '<i class="el-icon-time"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.isCurRun = false //执行到此处标志
                  that.runOptions(sNodeid, 'to_current_node')
                }
              }
              break;
            case "site_start"://从此处运行
              return {
                text: '<i class="el-icon-time"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.isCurRun = true　//从次出开始执行标志
                  that.runOptions(sNodeid, 'from_current_node')
                }
              }
              break;

            case "output_log"://数据日志输出
              return {
                text: '<i class="el-icon-document"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  if (!_.isEmpty(value)) {
                    that.logTitle = that.$t('strings.flow.output_log')
                    that.loglist = value
                    that.logInfoVisible = true
                  } else {
                    that.loglist = null
                    that.$message.warning(that.$t('strings.flow.log_none'))
                  }
                }
              }
              break;
            case 'DataVisualSave': // 数据保存
              return {
                text: '<i class="ico-save"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  that.loading = true
                  // changeJspStatusNode(1,tn)
                  saveDataFlowNode(sNodeid, { experiment_id: that.$store.getters.curProId, experiment_name: that.proname }).then(res => {
                    if (res.status === 201) {
                      that.$message.success(res.data.message)
                    } else {
                      that.$message.warning(res.data.message)
                    }
                    that.loading = false
                  }).catch(err => {
                    console.log(err)
                    that.loading = false
                    that.$message.error('save error!')
                  })
                  // that.setVisualzation(obj.slice(1),item.menu_name)
                }
              }
              break;
            case 'SaveToHistoryData': // 保存到历史数据
            {
              return {
                text: '<i class="el-icon-finished"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  if(that.$isMutexing("experiment")){
                    return
                  }
                  e.preventDefault()
                  that.data_key = data_key
                  getFlowNodeAvailableFields(that.$store.getters.curProId, sNodeid).then(res=>{
                    if(res.status === 200){
                      //此处后台有待优化：应返回跟数据源一样结构的包含类型的列信息
                      let allFields = res.data.map(c=>{ return {name:c,zname:c}})
                      console.log('保存到历史数据选项数据', allFields)
                      that.$refs.dataOutput.open(that.$t('strings.dataoutput.saveToHistory'),{
                        type: 'experiment', // 数据实验
                        fromChart: false, // 是否来源于图表
                        node_id: sNodeid,
                        experiment_id: that.$store.getters.curProId,
                        fields: allFields
                      },{
                        type:'historydata'
                      })
                    }else{
                      that.$message.error(res.data)
                    }
                  }).catch(err=>{
                    that.$message.error('字段加载失败！error:' + err.message)
                  })
                }
              }
              break;
            }
            case 'SaveToCSV': // 保存到CSV
            {
              return {
                text: '<i class="el-icon-download"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  if(that.$isMutexing("experiment")){
                    return
                  }
                  e.preventDefault()
                  that.data_key = data_key
                  getFlowNodeAvailableFields(that.$store.getters.curProId, sNodeid).then(res=>{
                    if(res.status === 200){
                      let allFields = res.data.map(c=>{ return {name:c,zname:c}})
                      console.log('下载到csv数据', that.allFields)
                      that.$refs.dataOutput.open(that.$t('strings.dataoutput.toLocal'), {
                        node_id: sNodeid,
                        experiment_id: that.$store.getters.curProId,
                        fields: allFields
                      },{
                        type:'csv'
                      })
                    }else{
                      that.$message.error(res.data)
                    }
                  }).catch(err=>{
                    that.$message.error('字段加载失败！error:' + err.message)
                  })
                }
              }
              break;
            }
            case "DataVisualzation": //数据探查
              return {
                text: '<i class="el-icon-edit"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  if(that.$isMutexing("experiment")){
                    return
                  }
                  e.preventDefault()
                  that.setVisualzation(sNodeid, menu_name, data_key)
                },
              }
              break;
            case "error_log"://错误日志
              return {
                text: '<i class="el-icon-circle-close-outline"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  if (!_.isEmpty(value)) {
                    that.logTitle = that.$t('strings.flow.error_log')
                    that.loglist = value
                    that.logInfoVisible = true
                  } else {
                    that.loglist = null
                    that.$message.warning(that.$t('strings.flow.log_none'))
                  }
                }
              }
              break;
            default:
              return {
                text: '<i class="el-icon-menu"></i>' + menu_zname,
                isNone: isNone,
                action: function(e) {
                  e.preventDefault()
                  console.log('----------' + menu_name + menu_zname + '----------')
                }
              }
              break;
          }
        }
      }
    },

    /**
     * 更新面板 时开启更新 history
     */
    updateOnceDraw:_.throttle(function(func) {
      let id = this.$store.getters.curProId
      const draw =  getNodesLinks($, jsPlumb, this)
      if(id){
        upDateModelProject({'panel':JSON.stringify(draw)},id).then(res=>{
          console.log(res)
          this.run_uuid = res.data.run_uuid
          func && func()
        }).catch((error) => {
          this.$message.error("panel update error!")
        })
      }
    }, 100),
    /**
     * 分发移动节点时更新方式
     */
    updateWhich(){
      this.isProjectRun('data').then(res=> {
        if (res) {
          return
        }
      })
      this.updateOnceDraw()
    },
    // 当流程运行出错时　给所有正在运行中的节点加上错误状态
    endFlowSetLoadingErr() {
      const nodes = getNodesLinks($, jsPlumb, this).nodes
      let aIds = []
      Object.keys(nodes).map((item)=>{
        let ele = document.getElementById(item)
        if(ele.dataset.status === '1'){
          aIds.push(item)
        }
      })
      this.changeNodeJsp(aIds,3)
    },
    //树形结构搜索节点功能
    searchNode(text){
      let aNodeClone = _.cloneDeep(this.pNodes)
      let arr = []
      this.treeDiSearch(aNodeClone,arr,text)
      $.fn.zTree.init($('#' + this.treeId), this.setting, arr)
    },
    /**
     * 搜索属性结构的所有节点放入arr数组中
     * @param nodes
     * @param arr
     * @param text
     */
    treeDiSearch(nodes,arr,text){
      // 递归所有数据渲染属性结构
      function _(json){
        json.some((item)=>{
          if(item.isParent===false ){
            let reg = new RegExp(text,'gi')
            if(reg.test(item.node_zname)){
              arr.push(item)
            }
          }else{
            _(item.children)
          }
        })
      }
      _(nodes)
    },
    //重置树形结构　或者叫搜索重置
    resetTreeDi(){
      $.fn.zTree.init($('#' + this.treeId), this.setting, this.pNodes)
    },
    /**
     * 预览请求公共转发
     * @param data //参数项
     */
    tagglePreview(data){
      return new Promise((resolve, reject) => {
        getDataExpConf(data.project_id, { node_id: data.node_id }).then(res=>{
          if(res.data.status !== 200){
            reject("error")
          }
          resolve(res)
        }).catch(error=>{
          this.$message.error(this.$t('messages.request_error'))
          reject(error)
        })
      })
    },
    /**
     * 获取当前节点计算结果 如评估
     * @param data //参数项
     */
    getCurrentNodeView(data){
      return new Promise((resolve, reject) => {
        runCurrentNodes(data).then(res=>{
          if(res.data.status !== 200){
            reject("error")
          }
          resolve(res)
        }).catch(error=>{
          this.$message.error(this.$t('messages.request_error'))
          reject(error)
        })
      })
    },
    /**
     * 节点上游变动节点本身以及其下游节点参数重置
     * 1.删除连线时(直接删除和改变链接节点)
     * @param conn 连线对象
     *        isdel 是否是delete操作
     *        isSet 是否是改变参数操作
     */
    updateNodeParams(conn, isdel, isSet){
      const targetId = conn.targetId
      if(conn.suspendedElementId || isdel){ // 在此情况下进行重置节点参数操作
        //找到节点及下游节点id
        const arr = this.getNodeNextIds(targetId)
        arr.some(item=>{
          const tn = document.getElementById(item)
          changeJspStatusNode(0,tn)
        })
        delNodesParams(this.$store.getters.curProId, arr[0], arr.toString()).then(res=>{
          // if is delete 重置左侧选项
          !isSet && this.resetLeftOptions()
        }).catch(e => {
          console.log('重置失败', e)
        })
        this.updateWhich()
      }
    },
    /**
     * 找到节点id的下游所有节点
     * @param id
     * 返回节点id数组
     */
    getNodeNextIds(id){
      const links =  this.getDraws().links
      let arr = [id]
      function func(m) {
        const ids = links[m]
        if(ids){
          arr = [...arr, ...ids]
          ids.some(item=>{
            func(item)
          })
        }
      }
      func(id)
      return arr
    },
    /**
     * 找到节点id的一级下游节点
     * @param id
     * 返回节点id数组
     */
    getNodeNextId(id) {
      const links =  this.getDraws().links
      return links[id]
    },

    /**
     * 判断算法节点是否存在输入值 存在即返回true 每个输入点都有输入值才会返回true
     * @param id 节点id
     * @param num 节点输入点个数
     * @returns {boolean}
     */
    isNodeHaveInPoint(id, num=1){
      const aConnections = getNodesLinks($, jsPlumb, this).connections
      const newSet = new Set()
      aConnections.some(item => {
        const temp = Object.values(item)
        newSet.add(temp[1])
      })
      return [...Array(num)].map((item, key) => { return id + '-input' + key }).every(item => newSet.has(item))
    },
    /**
     * 重置面板左侧参数项
     */
    resetLeftOptions(){
      this.optiondata ={
        type:null,
        data:null,
      }
    },
    /**
     * 移除事件
     */
    resetListener(){
      $('#handle_tree').off('mouseover', 'a[treenode_a]')
      $('#work_panel').off('click', '.pipeline-del')
      $('#handle_tree').off('mouseleave', 'a[treenode_a]')
      $('#handle_tree').off('mousedown', 'a[treenode_a]')
      $(document).off('mousedown', '.draggable')
      $('#work_panel').off('click', '.draggable')
      $(document).mousemove(null)
      $(document).mouseup(null)
    },
    /**
     * 正序获取画版结构
     * @returns {*}
     */
    getDraws(){
      return getNodesLinks2($, jsPlumb, this)
    },
    /**
     * 获取当前点击节点流程JSON
     * 1.不能只有一个节点
     * 2.需要节点运行完毕 还需要检查session是否还存在
     * 3.
     */
    getClickPanel(){
      const draw = this.getDraws(),
        { links, connections, nodes } = draw,
        saveNodes = []
      const newDraw = { selector: ".jtk-node", links:{}, nodes: {}, connections: []}
      const id = this.curClickId
      let pro = [id]
      let conns = []
      while (pro.length > 0) {
        const cid = pro.shift()
        saveNodes.push(cid)
        if(links[cid]){
          newDraw.links[cid] = links[cid]
        }
        conns = [...conns, ...connections.filter(m => {
          const source = m.sourceEndpointUuid.slice(0, -8)
          if(source==cid) return m
        })]
        newDraw.nodes[cid] = nodes[cid]
        for(let key in links){
          let item = links[key]
          // 存在下游节点
          if(cid==key){
            let a = item.filter(m=>{
              return saveNodes.indexOf(m) < 0
            })
            pro = [...pro, ...a]
          }
          // 存在上游节点
          if(item.indexOf(cid) > -1){
            saveNodes.indexOf(key) < 0 && pro.push(key)
          }
        }
      }
      newDraw.connections = conns
      this.$store.commit('SET_PIPLINEDRAW', newDraw)
    },
    getDataExplorerOutputData(command, provData, datazoom, xaxisrange, brushSelected) {
      if(this.$isMutexing("experiment")){
        return
      }
      let dataOutputFromChartType = false
      const dataOutputFields = provData.map(c=>{ return {name:c,zname:c}})
      if (dataOutputFields) {
        let dataOutputDefaultValues = [] // 穿梭框右侧列表，所有默认已选中数据集
        let datazoomx = []
        let scatterData = []
        if (command.chart.preheader) {
        // 数据预览表格
          dataOutputDefaultValues = command.chart.preheader
          dataOutputFromChartType = 'table'
        } else {
        // line条形，scatter散点图...TODO: 1.9版本暂不做柱状
          dataOutputDefaultValues = command.chart.chartData.columns
          if (command.chart.chartType === 've-line') {
            dataOutputFromChartType = 'line_chart'
            // TODO: x_axis_min, x_axis_max转换，暂通过计算得出，后续看看有无更好方法
            if (datazoom.hasOwnProperty('value')) {
              if (command.chart.chartSettings.xAxisType === 'value') {
                datazoomx = datazoom['value'].map(c => {
                  return c.toFixed(1)
                })
              } else {
                // 离散
                datazoomx = datazoom['value'].map(c => {
                  if (c > 0) {
                    return command.chart.chartData.rows[c][command.chart.chartSettings.xAxisName[0]]
                  } else {
                    return command.chart.chartData.rows[0][command.chart.chartSettings.xAxisName[0]]
                  }
                })
              }
            } else if(datazoom.hasOwnProperty('scale')) {
              if (command.chart.chartSettings.xAxisType === 'value') { // value/category/time/log
              // 连续数据
                if (xaxisrange.length !== 0) {
                  datazoomx = datazoom['scale'].map(c => {
                    return Math.ceil((xaxisrange[1] - xaxisrange[0]) / 100 * c + xaxisrange[0])
                  })
                }
              } else {
              // 离散数据
                datazoomx = datazoom['scale'].map(c => {
                  const datazoomIndex = command.chart.chartData.rows.length / 100 * c // 进一法
                  let xValueByDatazoom = ''
                  if (datazoomIndex > 0) {
                    xValueByDatazoom = command.chart.chartData.rows[Math.ceil(datazoomIndex) - 1][command.chart.chartSettings.xAxisName[0]]
                  } else {
                    xValueByDatazoom = command.chart.chartData.rows[0][command.chart.chartSettings.xAxisName[0]]
                  }
                  return xValueByDatazoom
                })
              }
            }
          } else if (command.chart.chartType === 've-scatter') {
            dataOutputFromChartType = 'scatter_chart'
            // 根据index转数据 格式：[[1,2], [3,4]]
            scatterData = brushSelected.map(c => {
              const arrayValueByBrushSelected = Object.values(command.chart.chartData.rows[c])
              return arrayValueByBrushSelected
            })
          }
        }
        if (command.type === 'toHistory') {
        // console.log('保存到历史数据选项数据', command.chart)
          this.$refs.dataOutput.open(this.$t('strings.dataoutput.saveToHistory'), {
            type: 'experiment', // 数据探查
            fromChart: dataOutputFromChartType, // 是否来源于图表
            fields: dataOutputFields,
            filterFields: dataOutputDefaultValues,
            node_id: this.tmpNodeid,
            experiment_id: this.$store.getters.curProId,
            scatter_data: scatterData
          }, {
            type: 'historydata',
            field_names: dataOutputDefaultValues,
            x_axis_min: datazoomx.length === 2 ? datazoomx[0] : '',
            x_axis_max: datazoomx.length === 2 ? datazoomx[1] : ''
          })
        } else if (command.type === 'toCSV') {
        // console.log('下载到本地', command.chart)
          this.$refs.dataOutput.open(this.$t('strings.dataoutput.toLocal'), {
            fromChart: dataOutputFromChartType, // 是否来源于图表
            fields: dataOutputFields,
            filterFields: dataOutputDefaultValues,
            node_id: this.tmpNodeid,
            experiment_id: this.$store.getters.curProId,
            scatter_data: scatterData
          }, {
            type: 'csv',
            field_names: dataOutputDefaultValues,
            x_axis_min: datazoomx.length === 2 ? datazoomx[0] : '',
            x_axis_max: datazoomx.length === 2 ? datazoomx[1] : ''
          })
        }
      } else {
        this.$message.warning('可操作数据为空')
      }
    },
    /**
     * 根据顺序返回相应的顺序的array  // 根据target进行排序
     * @param indexs
     * @param array
     * @returns {Array|{nodes: Array, ids: Array}}
     */
    resetProColumns(indexs, array){
      let arr = []
      let ids = []
      if(!array) {
        for (let i = 0, len = indexs.length; i < len; i++) {
          let item = indexs[i]
          if(i === 0){
            arr.push(item)
            ids.push(item.id)
          } else {
            arr.splice(item.target, 0, item)
            ids.push(item.target, 0, item.id)
          }
        }
        return { ids: ids, nodes: arr }
      } else if (Array.isArray(array)){
        indexs.forEach((item, key) => {
          if(key === 0){
            arr.push(array[0])
          } else {
            arr.splice(item.target, 0, array[key])
          }
        })
        return arr
      }
    },
    /**
     * 给name返回icon名, isp区别是否是父亲节点
     * @param name
     * @param tag
     */
    getTreeNodeIcon(name, isp) {
      let icon = 'icon iconfont '
      if(!isp){
        icon+= '_icon_node '
      }
      switch (name) {
        case 'dataset':
          icon += isp ? 'icon-mokuai' : 'icon-fujis'
          break
        case 'model':
          icon += isp ? 'icon-field_config_d' : 'icon-field_config_d'
          break
        case 'preprocess':
          icon += isp ? 'icon-mokuai' : 'icon-fujis'
          break
        case 'process_reuse':
          icon += isp ? 'icon-mokuai' : 'icon-fujis'
          break
        case 'feature_algorithm':
          icon += isp ? 'icon-fujid_12' : 'icon-mokuai_12'
          break
        case 'algorithm':
          icon += isp ? 'icon-fujid_11' : 'icon-mokuai_11'
          break
        case 'evalmethod':
          icon += isp ? 'icon-fujid_1' : 'icon-mokuai_1'
          break
        case 'statistics':
          icon += isp ? 'icon-aboutuser' : 'icon-aboutuser'
          break
        default:
          icon = isp ? 'ico-folder-open' : '_icon_node el-icon-tickets'
          break
      }
      return icon
    }
  }
}
