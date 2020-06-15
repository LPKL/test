
import $ from 'jquery'
import { setData, getDataset } from '@/utils/index'
export function initJsPlumb(that, myjson) {
  const primcolor = '#3d65c9aa'

  jsPlumb.ready(function() {
    const instance = that.jsp = jsPlumb.getInstance({
      anchor: ["Top", "Bottom"],
      DragOptions: { cursor: 'move', zIndex: 2000 },
      ConnectionOverlays: [
        ['Arrow', { //箭头设置
          location: 1, // 箭头位置
          visible: true, //是否显示
          width: 8,//箭头宽度
          // foldback: 1, // 0.618： 普通箭头，1：平底箭头，2：钻石箭头
          length: 12,//箭头长度
          id: 'ARROW'
        }]
      ],
      Container: 'work_panel',
    })
    const connectorPaintStyle = { // 连线样式
      strokeWidth: 1.5,
      stroke: primcolor,
      outlineStroke: 'white',
    }
    const connectorHoverStyle = { // 连线样式(鼠标放上)
      strokeWidth: 2,
      stroke: primcolor,
      outlineStroke: 'white'
    }
    const endpointHoverStyle = {
      fill: primcolor
    }
    const endpointTargetHoverStyle = {
      fill: primcolor
    }
    const sourceEndpoint = {
      endpoint: 'Dot', // 端点配置和外观参数 点Dot，矩形Rectangle，空白Blank和图像image
      paintStyle: {
        stroke: primcolor,
        fill: '#ffffff',
        radius: 4,
        strokeWidth: 1.5
      },
      isSource: true,
      cssClass: 'source-point',
      //连线的类型，有直线（Straight），有流程图(Flowchart)、贝塞尔曲线（Bezier)，StateMachine（状态机） 参考https://www.jianshu.com/p/e61dd8ec781b
      //https://docs.jsplumbtoolkit.com/toolkit/current/articles/connectors.html#bezier
      // connector: [ "Flowchart", { stub: [1, 1], gap: 1, cornerRadius: 5, alwaysRespectStubs: true} ],
      connector:["Straight"],
      connectorStyle: connectorPaintStyle,
      hoverPaintStyle: endpointHoverStyle,
      hoverClass: 'source-point-hover-class',
      connectorHoverClass: 'connector-hover-class',
      connectorHoverStyle: connectorHoverStyle,
      maxConnections: -1,
      onMaxConnections: function(info) {
        console.log("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
      }
    }
    const targetEndpoint = {
      endpoint: 'Dot',
      paintStyle: {
        stroke: primcolor,
        fill: '#ffffff',
        radius: 4,
        strokeWidth: 1.5
      },
      cssClass: 'target-point',
      hoverPaintStyle: endpointTargetHoverStyle,
      dropOptions: { hoverClass: 'in-hover', activeClass: 'in-hover' },
      isTarget: true,
      events: {
        connected: function() {
          // this.setEnabled(false)
        }
      },
      onMaxConnections: function(info) {
        console.log("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
      }
    }
    // 节点的运行状态设置
    const statusChange = window.changeJspStatusNode = function(status, tn) {
      const t = parseInt(status, 10)
      switch (t) {
        case 0 :
          setData($(tn)[0], 'status', 0) // 未运行
          $($(tn).find('span')[2]).attr('class', 'status ico-warning-o').css('color', '#ffa23d')
          break
        case 1:
          setData($(tn)[0], 'status', 1)　// 正在运行
          $($(tn).find('span')[2]).attr('class', 'status el-icon-loading').css('color', '#4aaf7c')
          break
        case 2 :
          setData($(tn)[0], 'status', 2) // 运行成功
          $($(tn).find('span')[2]).attr('class', 'status el-icon-success').css('color', '#4aaf7c')
          break
        case 3:
          setData($(tn)[0], 'status', 3) // 运行失败
          $($(tn).find('span')[2]).attr('class', 'status el-icon-circle-close').css('color', '#c93634')
          break
        default:
          setData($(tn)[0], 'status', 0)
          $($(tn).find('span')[2]).attr('class', 'status ico-warning-o').css('color', '#ffa23d')
          break
      }
      return tn
    }
    // pipeline 面板节点状态
    const delStatusChange = window.delStatusChange = function(deltype, tn) {
      const t = parseInt(deltype, 10)
      switch (t) {
        case 1:
          setData($(tn)[0], 'deltype', 1)　
          $($(tn).find('span')[2]).attr('class', 'status pipeline-del el-icon-delete').css('color', '#c93634')
          break
        case 2 :
          setData($(tn)[0], 'deltype', 2)
          $($(tn).find('span')[2]).attr('class', 'status pipeline-del el-icon-delete').css('color', '#c93634')
          break
        default:
          setData($(tn)[0], 'deltype', 0)
          $($(tn).find('span')[2]).attr('class', 'status pipeline-del el-icon-delete').css('color', '#c93634')
          break
      }
      return tn
    }
    // 使用模板
    const templateNode = function(template, nodeId, nodeText, classname) {
      let icon = 'el-icon-tickets'
      if(classname){
        icon = classname
      }
      return template
        .replace(/\$\{nodeId\}/g, nodeId).replace(/\$\{icon\}/g, icon)
        .replace(/\$\{text\}/g, nodeText)
        .replace(/\$\{name\}/g, nodeText)
    }
    // 添加节点时状态更改
    const addNodeSetData = function(template, nodeId, node, data, cname) {
      let tmp = ''
      let { classname, status, input, output, type, deltype, tree_node_id, treenodeid } = data
      if(classname && classname !== 'undefined'){
        tmp = templateNode(template, nodeId, node, classname)
      } else if(cname) {
        tmp = templateNode(template, nodeId, node, cname)
      } else {
        tmp = templateNode(template, nodeId, node)
      }
      let tn = $(tmp)[0]
      setData(tn, 'status', status)
      setData(tn, 'input', input)
      setData(tn, 'output', output)
      setData(tn, 'type', type)
      setData(tn, 'classname', cname ? cname: classname ? classname : 'el-icon-tickets')
      setData(tn, 'treenodeid', treenodeid || tree_node_id)
      setData(tn, 'deltype', deltype === 'undefined' ? 0 : deltype)
      if(that.isPipeline){
        return $(delStatusChange(getDataset(tn).deltype, tn))
      } else {
        return $(statusChange(getDataset(tn).status, tn))
      }
    }
    // 添加节点（拖拽时和加载已有面板str）重新设置节点信息
    window.addJsplumbNode = function(nodeId, nodeLable, position, datas) {
      const template = $('#node_template').html()
      let nd = null, tag = 0
      if(typeof nodeLable !== 'string') tag = 0
      if(datas) tag = 1
      switch (tag) {
        case 0: //拖拽时的操作
          const nodeText = nodeLable.find('.node_name').text()
          const nspans = $(nodeLable.find('span'))
          const cnspans = nspans.length === 4 ? nspans[1] : nspans[0]
          let classname = ''
          try {
            classname = cnspans.className.split(' ').slice(1).toString().replace(/\,/g, ' ')
          } catch (e) {
            console.log(e)
            classname = 'el-icon-tickets'
          }
          classname = classname.replace(/\s_icon_node/g,'')
          let nodeLableData = null
          if (nspans.length === 4) {
            nodeLableData = $(nodeLable.find('span')[1]).data()
          } else {
            nodeLableData = $(nodeLable.find('span')[0]).data()
          }
          nd = addNodeSetData(template, nodeId, nodeText, nodeLableData, classname)
          break
        case 1: //加载已有面板字符串时使用
          nd = addNodeSetData(template, nodeId, nodeLable, datas)
          break
        default:
          break
      }
      nd.addClass('draggable')
      nd.css({ left: position.x, top: position.y })
      $(instance.getContainer()).append(nd)
      that.addMenu(2, '#' + nodeId, that)
      instance.fire('jsPlumbDemoNodeAdded', nd[0])
      return $('#' + nodeId)[0]
    }
    //　添加输入输出圆点
    window.addJsplumbPort = function(node, ports, type) {
      // Assume horizental layout
      const number_of_ports = ports.length
      const x_offset = 1 / (number_of_ports + 1)
      let x = 0
      for (let i = 0; i < number_of_ports; i++) {
        const anchor = [0, 0, 0, 0]
        let isSource = false, isTarget = false
        if (type === 'output') {
          anchor[1] = 1
          isSource = true
        } else {
          isTarget = true
        }
        anchor[0] = x + x_offset
        x = anchor[0]
        const p = instance.addEndpoint(node, isSource ? sourceEndpoint : targetEndpoint, {
          anchor: anchor, uuid: node.getAttribute('id') + '-' + type + i
        })

        /* p.bind('mouseover', function (obj, e) {
                $(p.canvas).poshytip('show');
            });

            p.bind('mouseout', function (obj, e) {
                $(p.canvas).poshytip('hide');
            })*/
      }
    }
    instance.batch(function() {
      jsPlumb.load(that, myjson, instance)
      // listen for new connections; initialise them the same way we initialise the connections at startup.
      instance.bind('connection', function(connInfo, originalEvent) {
        console.log(123)
        connInfo.targetEndpoint.fire('connected')
        var uid = jsPlumbUtil.uuid()
        $(connInfo.connection.getConnector().canvas).find('path:first').attr('id', uid)
        // 为线添加右键菜单
        // that.addMenu(3, '#' + uid, that)
      })

      instance.bind('connectionDrag', function(connection) {
        $('.target-point').not('.jtk-endpoint-connected').find('circle').attr({
          'stroke-width': 12,
          'stroke': '#008000',
          'stroke-opacity': '0.5',
          'paint-order': 'stroke fill'
        })
      })
      instance.bind('connectionDragStop', function(connection) {
        $('.target-point').not('.jtk-endpoint-connected').find('circle').attr({
          'stroke-width': 1,
          'stroke': primcolor,
          'stroke-opacity': '1'
        })
        that.updateWhich(connection)
        !that.isPipeline && that.updateNodeParams(connection, false)
        console.warn("连线正常更新...")
      })

      //　点击删除连线
      instance.bind('click', function(conn, originalEvent) {
        const ta = that.$store.getters.upWhich
        that.isProjectRun(ta).then(res=> {
          if (!res) {
            that.deleteOptions('确定删除连线吗?', () => {
              try {
                instance.deleteConnection(conn)
                //  数据实验调用
                !that.isPipeline && that.updateNodeParams(conn, true)
                !that.isPipeline && that.updateOnceDraw()

                // //todo pipeline中调用 删除操作先不管
                // that.isPipeline && that.updateWhich(conn)
                console.log("line update")
              } catch (e) {
                console.log(e)
              }
            })
          }
        })
      })
      instance.bind("connectionMoved", function (params) {
        console.log("connection " + params.connection.id + " was moved");
      })
    })

    jsPlumb.bind('jsPlumbDemoLoaded', function(instance) {
      that.$jsPlumbCanvas = $('.jtk-surface-canvas')
      const jsplen = that.$jsPlumbCanvas.length
      if (jsplen > 0) {
        return
      } else {
        const inter = setInterval(function() {
          if (that.$jsPlumbCanvas.length !== 0) {
            clearInterval(inter)
          } else {
            that.$jsPlumbCanvas = $('.jtk-surface-canvas')
            // that.$jsPlumbCanvas.append('<div id="guide-h" class="guide"></div>')
            // that.$jsPlumbCanvas.append('<div id="guide-v" class="guide"></div>')
            // 空白面板添加右键菜单
            // that.addMenu(1, '.work_panel', that)
          }
        }, 100)

        const renderer = window.renderer = jsPlumbToolkit.Support.ingest({
          jsPlumb: instance,
          // renderParams: {enableWheelZoom: false, miniview: {container: $('.miniview')[0]}, zoomToFitIfNecessary: true}
          renderParams: {
            enableWheelZoom: false ,//　不允许滚轮缩放
            zoom: 1,　//　初始化缩放比例
            zoomRange : [1, 1],//可缩放范围 eg. [0.6, 1.5] // 暂时不允许缩放
            enablePan :　false // 不允许移动面板
          },
        })
        instance.bind('jsPlumbDemoNodeAdded', function(el) {
          renderer.ingest(el)
        })

        /***放大缩小按钮***/
        jsPlumb.on('.controls', 'tap', '[mode]', function() {
          var mode = this.getAttribute('mode')
          if (mode === 'up') {
            renderer.setZoom(renderer.getZoom() + 0.08)
          } else {
            renderer.setZoom(renderer.getZoom() - 0.08)
          }
        })
        /***居中***/
        jsPlumb.on('.controls', 'tap', '[reset]', function() {
          renderer.zoomToFit({ doNotZoomIfVisible: true })
        })
        /***1:1显示***/
        jsPlumb.on('.controls', 'tap', '[realsize]', function() {
          renderer.zoomToFit({ doNotZoomIfVisible: true })
          renderer.setZoom(1)
        })

      }
    })

    jsPlumb.fire('jsPlumbDemoLoaded', instance)
    //适应画布
    // renderer.setZoom(1)
    //renderer.zoomToFit({ doNotZoomIfVisible: true })
  })
}
