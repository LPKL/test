import $ from 'jquery'
import { getDataset } from '@/utils/index'
// import _ from 'lodash'
(function(jsPlumbInstance) {
  /**
   * 加载面板json信息
   * @param that
   * @param json
   * @param instance
   */
  jsPlumbInstance.load = function(that, json, instance) {
    const myjsons = typeof json == 'string' ? JSON.parse(json) : json
    const nodess = Object.values(myjsons.nodes || myjsons.blocks)
    const connss = myjsons.connections
    const tempnode = []

    nodess.forEach(v => {
      tempnode.push(addJsplumbNode(v.id, v.label, { x: v.x, y: v.y }, v))
    })

    tempnode.forEach((v, k) =>{
      const innum = parseInt(nodess[k].input)
      const outnum = parseInt(nodess[k].output)
      addJsplumbPort(v, new Array(innum), 'input')
      addJsplumbPort(v, new Array(outnum), 'output')
    })

    connss.forEach(v => {
      instance.connect({ uuids: [v.sourceEndpointUuid, v.targetEndpointUuid], editable: true })
    })
    try { //清空缓存时renderer未定义
      if (window.renderer) {
        window.renderer.setZoom(1)
      }
    }catch (e) {
      console.log(e)
    }
  }
  /**
   * 保存面板信息
   * @param options
   * @param plumbInstance
   * @returns {*}
   */
  jsPlumbInstance.save = function(options, plumbInstance) {
    if (!options || !options.selector) {
      return {}
    }
    plumbInstance = plumbInstance || jsPlumb
    const connection = plumbInstance.getAllConnections()
    let blocks = {}
    $(options.selector).each(function(idx, elem) {
      const dset = getDataset(elem)
      // 再这里$(elem)并没有及时更新list参数项　所以这里获取得是dset的list
      blocks[$(elem).attr('id')] = { //保存时需要整合节点的属性 将来再次渲染时拿到
        id: $(elem).attr('id'),
        tree_node_id:  dset.treenodeid,
        x: $(elem).css('left') + '',
        y: $(elem).css('top') + '',
        label: $(elem).text().trim(),
        input: dset.input,
        type: dset.type,
        deltype: dset.deltype,
        output: dset.output,
        status: dset.status,
        classname: dset.classname
      }
    })
    let connections = []
    for (let i = 0,len = connection.length; i < len; i++) {
      const connector = connection[i].getConnector()
      const type = connector.type
      let attrs = {}
      switch (type) {
        case 'Bezier':
          attrs['curviness'] = connector.getCurviness()
          break
        case 'Straight':
        {
          break
        }
        case 'Flowchart ':
        {
          break
        }
        case 'State Machine':
        {
          attrs['curviness'] = connector.getCurviness()
          break
        }
      }
      let endpointArray = []
      connection[i].endpoints.forEach(function(endpoint) {
        let options = {}
        if (endpoint.type == 'Image') {
          options.url = endpoint.canvas.src
          options.anchor = endpoint.anchor
          endpointArray.push([endpoint.type, options])
        } else {
          options.anchor = endpoint.anchor
          endpointArray.push([endpoint.type, options])
        }
      })
      connections.push({
        sourceEndpointUuid: connection[i].endpoints[0].getUuid(),
        targetEndpointUuid: connection[i].endpoints[1].getUuid()
      })
    }

    const obj = { selector: options.selector, connections: connections, nodes: blocks }
    return obj
  }
})(jsPlumb)
