import { parseChartType, parseCaseChartType, getRandomColor, filterResponse } from '@/utils/index'
import { savegetDataVisualchart, addDataExperiments } from '@/api/experiment'
import { getAtlasStandValue } from '@/api/algorithm/atlas'
import { addPeriodMonitorRunDataExperiments, updatePeriodMonitorRunDataExperiments } from '@/api/datamining/period/periodMonitor'
import GetDataVisualArgs from '../config/cascadeArguments'
import _ from 'lodash'

const colors_abnormal = [...Array(2)].map(_ => getRandomColor())
const fixed_colors_array = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
export default {
  data() {
    return {
      transferChart: { 0: 'primary' },
      provData: null,
      cascadeData: [{ arg_range: [] }],
      cascadeIndex: '',
      cascadeIndexData: null,
      cascadeIndexId: null,
      updatecas: null,
      updatecasTemp: null,
      updatecasAllTemp: [],
      cascadeCache: {},
      cascadeCacheScatterColor: {},
      simpleCharts: ['line', 'scatter', 'bar', 'heatmap'],
      cascadeChartData: [],
      dataset_id: null,
      cascadeChartDataZoom: [{ type: 'slider', start: 0, end: 10 }, { type: 'inside', zoomLock: true, start: 0, end: 10 }],
      toolbox: {
        feature: {
          dataZoom: {},
          restore: {}
          // ,saveAsImage: {backgroundColor: '#ffffff'}
        },
        right: '30px'
      },
      tooltipTime: { // 存在时间字段时,图表显示内容设置
        trigger: 'axis',
        formatter: function(params) {
          let temp = ''
          params.some(item => {
            temp += item.value[0] + ' : ' + item.value[1] + '<br/>'
          })
          return temp
        }
      },
      cfgSnoopingGroup: [], // 纵向按钮组：数据可视化、统计分析
      cascadeLoading: false,
      available_space: 51200, // 可用图表空间
      data_sizess: [],
      cascheight: null,
      maxThreshold: 0,
      minThreshold: 0,
      receiveMmessage: null, // todo 接受探查socket返回数据函数
      isSendChart: true,
      reuseFields: null, // 分组字段名称
      reuseNodeDataKey: null, // 分组字段的枚举值，下拉列表里面的选项，reuseNodeDataKey不为空时，说明是流程复用的节点
      reuseSelectedNodeDataKey: null // 数据探查时选中的分组数据列表
    }
  },
  computed: {
    cascadeDataWithZName() {
      if (!this.cascadeData || !this.cascadeData[Object.keys(this.transferChart)[0]].arg_range) { return [] }
      return this.cascadeData[Object.keys(this.transferChart)[0]].arg_range.filter(c => !!c.arg_zname)
    }
  },
  methods: {
    /** *
     * 数据可视化请求结束,cascade组件弹框操作
     */
    loadCharts(provData, chart_conf, dataset_id, reuse_fields, reuse_node_data_key) {
      this.cascadeData = GetDataVisualArgs() // _.cloneDeep(item)
      this.provData = provData
      this.dataset_id = dataset_id
      this.updatecasAllTemp = chart_conf
      this.reuseFields = reuse_fields
      this.reuseNodeDataKey = reuse_node_data_key
      if (!_.isEmpty(chart_conf)) {
        this.eachSendChart(chart_conf)
      }
    },
    // 请求已经保存的图表信息 采用定时请求
    eachSendChart(chart_conf) {
      const aConfs = _.cloneDeep(chart_conf)
      const time = setInterval(async() => {
        if (this.isSendChart) { // 请求打开标志
          const oConf = aConfs.shift()
          if (oConf) {
            const { name } = oConf
            const sendColumns = [...new Set(oConf.z ? [oConf.x].concat(oConf.y).concat(oConf.z) : [oConf.x].concat(oConf.y))]
            if (oConf.c) {
              sendColumns.push(oConf.c)
            }
            // TODO:区分流程复用的探查和普通探查
            if (this.reuseNodeDataKey !== null) {
              this.getReuseCascChartsData(sendColumns, null, false, name, oConf)
            } else {
              if (this.simpleCharts.indexOf(name) < 0) {
                await this.getCascChartsData(null, oConf, false, name, oConf)
              } else {
                await this.getCascChartsData(sendColumns, null, true, name, oConf)
              }
            }
            this.isSendChart = false
          } else {
            clearInterval(time)
          }
        }
      }, 1000)
    },
    cascadeIndexChange() {
      const argRange = this.cascadeData[Object.keys(this.transferChart)[0]].arg_range[this.cascadeIndex]
      const comps = argRange.arg_range.map(c => {
        const appendProps = {
          clearable: false,
          placeholder: c.placeholder || ''
        }
        // 折线图x轴、序列稳定性时间列、可以为空，默认序号
        if (argRange.arg_name === 'line' && c.arg_name === 'x' ||
            argRange.arg_name === 'sequence_stat' && c.arg_name === 'timecol') {
          appendProps.clearable = true
          appendProps.placeholder = this.$t('strings.flow.sequence_default')
        }
        return {
          ...c,
          ...appendProps
        }
      })

      this.cascadeIndexData = {
        args: comps,
        provData: this.provData,
        provids: [],
        index: null
      }
    },
    /**
     * 更新操作
     * @param update
     */
    updateCascade(update) {
      this.updatecas = update
    },
    /**
     * 添加操作
     */
    addCascade: _.throttle(function() {
      if (this.$isMutexing('experiment')) {
        return
      }
      let temp = {}
      let sendColumns = []
      let data = null
      let scatterColor = null // 散点图的离散型数据映射 参数值序列 是否已存在
      if (!this.cascadeIndex && this.cascadeIndex !== 0) {
        this.$message.error(this.$t('strings.flow.select_chart_type'))
        return false
      }
      if (this.periodicTimeRange.length < 2) {
        this.$message.error(this.$t('messages.flow.select_time_range'))
        return false
      }
      if (this.explorerType === 'periodMonitorRun') {
        temp['start_time'] = this.periodicTimeRange[0]
        temp['end_time'] = this.periodicTimeRange[1]
      }
      // const name = this.cascadeData[Object.keys(this.transferChart)[0]].arg_range[this.cascadeIndex].arg_zname
      let chartType = this.cascadeData[Object.keys(this.transferChart)[0]].arg_range[this.cascadeIndex].arg_name
      let isHaveEmpty = false
      let isSimpleCharts = true
      if (this.simpleCharts.indexOf(chartType) >= 0) {
        this.updatecas.some(item => {
          if (_.isEmpty(item.arg_value) && !_.isNumber(item.arg_value)) {
            isHaveEmpty = true
          }
          temp[item.arg_name] = item.arg_value
        })
        if (chartType === 'line' && temp.y) { // 折线图支持单位，默认x轴为自然序号
          isHaveEmpty = false
        }
        if (chartType === 'scatter') { // 三维散点图和普通散点图参数检测
          if ((temp.x && temp.y && temp.z) || (temp.x && temp.y || temp.z)) {
            isHaveEmpty = false
          }
        }

        sendColumns = [...new Set(temp.z ? [temp.x].concat(temp.y).concat(temp.z) : [temp.x].concat(temp.y))] // 合并单个图x y or z 并去重
        if (temp.c && temp.c !== '') {
          sendColumns.push(temp.c)
          if (!this.isHaveCascCacheScatterColor(temp.c)) { // 查看缓存
            scatterColor = temp.c
          }
        }
        data = sendColumns.filter(item => {
          if (!this.isHaveCascCache(item)) { // 查看缓存
            return item
          }
        })
        if (chartType === 'scatter' && this.reuseNodeDataKey !== null) { // 流程复用散点图，轴选中值是分组字段，只绘制一张图
          if (this.reuseFields.indexOf(temp.x) !== -1 || this.reuseFields.indexOf(temp.y) !== -1 || this.reuseFields.indexOf(temp.z) !== -1) {
            chartType = 'scatter_process_reuse'
            temp['name'] = chartType
            isSimpleCharts = false
            data = null
          } else {
            temp = {}
          }
        } else {
          temp = {}
        }
        // temp = {}
      } else {
        this.updatecas.some(item => {
          if (_.isEmpty(item.arg_value) && !_.isNumber(item.arg_value)) {
            isHaveEmpty = true
          }
          temp[item.arg_name] = item.arg_value
        })
        if (chartType === 'distribution_test' && temp.distName && temp.thresh) { // 三维散点图和普通散点图参数检测
          isHaveEmpty = false // 卡放分布和t分布不再检测自由度
          console.log(temp)
        }
        if (chartType === 'sequence_stat' && temp.statistical_columns && temp.examine_func) {
          isHaveEmpty = false
        }
        if (chartType === 'staticsInfo') {
          // !temp.bin && (temp.bin = '10')
          isHaveEmpty = false
        }
        temp['name'] = chartType
        isSimpleCharts = false
      }
      // 检查参数完整性
      if (isHaveEmpty) {
        this.$message.error(this.$t('messages.flow.incomplete_param'))
        this.cascadeLoading = false
        isHaveEmpty = false
        return false
      }
      if (this.argsCascReset(chartType)) {
        if (this.reuseNodeDataKey !== null) {
          this.getReuseCascChartsData(data, temp, isSimpleCharts, chartType, this.updatecasTemp)
        } else {
          if (!_.isEmpty(data) || !_.isEmpty(temp) || !_.isEmpty(scatterColor)) {
            this.getCascChartsData(data, temp, isSimpleCharts, chartType, this.updatecasTemp)
          } else {
            this.setCascChartsData(chartType, this.updatecasTemp)
          }
        }
      }
    }, 1000),
    /**
     * 不用异步时调用函数
     * todo 将来改成异步时删除此函数
     * @param data
     * @param temp
     * @param isSimpleCharts
     * @param chartType
     * @param columnsTemp
     * @returns {Promise<any>}
     */
    // getCascChartsData(data,temp,isSimpleCharts,chartType, columnsTemp){
    //   this.cascadeLoading = true
    //   // 普通图data特殊图temp
    //   const mytemp = _.clone(temp || columnsTemp)
    //   delete mytemp.type // 处理保存之后多一个type问题
    //   return new Promise((resolve, reject) => {
    //     runCurrentNodes({
    //       flag:'DataVisualzation',
    //       visualdata:data?data:mytemp,
    //       project_id: parseInt(this.$store.getters.curProId),
    //       node_id:this.cascadeIndexId,
    //       available_space: this.available_space,
    //       type:columnsTemp.type
    //     }).then(res => {
    //       resolve(true)
    //       console.log(res)
    //       if(typeof res.data === 'string'){
    //         this.$message.error("选择的字段包含不规则数据,请重新选择或处理之后再试")
    //         this.resetEcasAllTemp()
    //         reject(false)
    //         return false
    //       }
    //       if(res.data.status !== 200){
    //         this.$message.error(res.data.message)
    //         this.resetEcasAllTemp()
    //         return false
    //       }
    //       const result = res.data.datas
    //       if(isSimpleCharts){
    //         this.maxThreshold = result.maxValue
    //         this.minThreshold = result.minValue
    //         this.cascadeCache = _.merge({},this.cascadeCache,result.raw_data)
    //         this.available_space = this.available_space-result.dataSize
    //         this.data_sizess.push(result.dataSize)
    //         this.setCascChartsData(parseCaseChartType(chartType), columnsTemp)
    //       }else{
    //         this.setCascChartsDatam(parseCaseChartType(chartType), result, temp.statistical_columns, temp)
    //       }
    //       this.cascadeLoading = false
    //
    //     }).catch(error=>{
    //       console.log(error)
    //       this.$message.error("执行失败!")
    //       this.resetEcasAllTemp()
    //       reject(false)
    //     })
    //   })
    //
    // },
    /**
     * 添加可视化图表请求操作 todo 异步调用时使用
     * @param data
     * @param temp
     * @param isSimpleCharts
     * @param chartType
     */
    async getCascChartsData(data, temp, isSimpleCharts, chartType, columnsTemp) {
      this.cascadeLoading = true
      // 普通图data 特殊图temp
      const mytemp = _.clone(temp || columnsTemp)
      delete mytemp.type // 处理保存之后多一个type问题
      let new_form_args = {}
      if (this.explorerType === 'periodMonitorRun') {
        // 周期监测中流运行详情的数据探查
        new_form_args = {}
        if (data) {
          new_form_args['raw_data'] = data
          if (mytemp.hasOwnProperty('start_time')) {
            new_form_args['start_time'] = mytemp['start_time']
          } else {
            new_form_args['start_time'] = this.periodicTimeRange[0]
          }
          if (mytemp.hasOwnProperty('end_time')) {
            new_form_args['end_time'] = mytemp['end_time']
          } else {
            new_form_args['end_time'] = this.periodicTimeRange[1]
          }
        } else {
          new_form_args = mytemp
        }
        if (columnsTemp.c) {
          if (columnsTemp.c !== '' && !this.isHaveCascCacheScatterColor(columnsTemp.c)) { // 查看缓存
            // 没有过颜色序列，需要请求获取
            new_form_args['visualmap_column'] = columnsTemp.c
          }
        }
        const params = {
          form_args: new_form_args,
          available_space: this.available_space,
          type: columnsTemp.type
        }
        try {
          const response = await addPeriodMonitorRunDataExperiments(parseInt(this.periodicDatasourceId), parseInt(this.streamingId), parseInt(this.runId), params)
          this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)
          if (response) {
            this.receiveMmessage = this.afterAddCass(temp, chartType, isSimpleCharts, columnsTemp)
            if (this.receiveMmessage !== false) {
              return await true
            }
          }
        } catch (e) {
          console.log(e)
          this.resetEcasAllTemp()
          return await false
        }
      } else {
        const params = {
          visualdata: data || mytemp,
          node_id: this.cascadeIndexId,
          available_space: this.available_space,
          type: columnsTemp.type,
          data_key: this.dataKey
        }
        if (columnsTemp.c) {
          if (columnsTemp.c !== '' && !this.isHaveCascCacheScatterColor(columnsTemp.c)) { // 查看缓存
            // 没有过颜色序列，需要请求获取
            params['visualmap_column'] = columnsTemp.c
          }
        }
        console.log('添加可视化图表参数', params)
        this.parseVisualizeParams(params)
        try {
          const response = await addDataExperiments(parseInt(this.$store.getters.curProId), params)
          this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)
          if (response) {
            this.receiveMmessage = this.afterAddCass(temp, chartType, isSimpleCharts, columnsTemp)
            if (this.receiveMmessage !== false) {
              return await true
            }
          }
        } catch (e) {
          console.log(e)
          this.resetEcasAllTemp()
          return await false
        }
      }
    },
    // TODO：流程复用
    getReuseCascChartsData(data, temp, isSimpleCharts, chartType, columnsTemp) {
      this.cascadeLoading = true
      // 普通图data 特殊图temp
      const mytemp = _.clone(temp || columnsTemp)
      delete mytemp.type // 处理保存之后多一个type问题
      console.log('getReuseCascChartsData', data, temp, isSimpleCharts, chartType, columnsTemp)
      console.log('getReuseCascChartsData111', data, mytemp)

      const params = {
        visualdata: data || mytemp,
        node_id: this.cascadeIndexId,
        available_space: this.available_space,
        type: columnsTemp.type,
        data_key: this.dataKey
      }
      if (columnsTemp.c) {
        if (columnsTemp.c !== '') { // 查看缓存
          // 没有过颜色序列，需要请求获取
          params['visualmap_column'] = columnsTemp.c
        }
      }
      if (this.reuseSelectedNodeDataKey !== null) {
        if (chartType === 'scatter_process_reuse') {
          params['reuse_group_id'] = this.reuseSelectedNodeDataKey
          this.reusePostAaddDataExperiments(params, temp, chartType, isSimpleCharts, columnsTemp)
        } else {
          this.reuseSelectedNodeDataKey.map(item => {
            const each_params = { ...params }
            each_params['reuse_group_id'] = [item]
            this.reusePostAaddDataExperiments(each_params, temp, chartType, isSimpleCharts, columnsTemp)
          })
        }
      } else {
        this.reusePostAaddDataExperiments(params, temp, chartType, isSimpleCharts, columnsTemp)
      }
    },
    async reusePostAaddDataExperiments(params, temp, chartType, isSimpleCharts, columnsTemp) {
      console.log('添加可视化图表参数 reuse', params)
      this.parseVisualizeParams(params)
      try {
        const response = await addDataExperiments(parseInt(this.$store.getters.curProId), params)
        this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)
        if (response) {
          this.receiveMmessage = this.afterAddCass(temp, chartType, isSimpleCharts, columnsTemp)
          if (this.receiveMmessage !== false) {
            return await true
          }
        }
      } catch (e) {
        console.log(e)
        this.resetEcasAllTemp()
        return await false
      }
    },
    parseVisualizeParams(params) {
      // 特殊图表参数处理
      // CSSAI-696 折线图支持単维，保存的x轴为空，导致运行报错
      const columns = params.visualdata
      if (columns && Array.isArray(columns)) {
        params.visualdata = columns.filter(c => c && c.trim())
      }
    },
    afterAddCass(temp, chartType, isSimpleCharts, columnsTemp) {
      return function(res) {
        if (typeof res.data === 'string') {
          this.$message.error(this.$t('messages.flow.parsing_error'))
          this.resetEcasAllTemp()
          return false
        }
        const result = res.data
        if (isSimpleCharts || chartType === 'scatter_process_reuse') {
          if (this.available_space <= 0 && !result.raw_data) {
            this.$message.error(this.$t('messages.flow.not_available_space'))
            this.resetEcasAllTemp()
            return false
          }

          this.maxThreshold = result.maxValue
          this.minThreshold = result.minValue
          this.cascadeCache = _.merge({}, this.cascadeCache, result.raw_data)
          if (result.hasOwnProperty('labeldistinctvalues') && this.reuseNodeDataKey === null) {
            if (!this.isHaveCascCacheScatterColor(columnsTemp.c)) {
              const scatterColorOjbect = {}
              scatterColorOjbect[columnsTemp.c] = result.labeldistinctvalues
              this.cascadeCacheScatterColor = _.merge({}, this.cascadeCacheScatterColor, scatterColorOjbect) // result中增加一列为颜色枚举集合labeldistinctvalues, 只有在个数<=10的时候才返回
            }
          }
          this.available_space = this.available_space - result.dataSize
          this.data_sizess.push(result.dataSize)
          this.setCascChartsData(parseCaseChartType(chartType), columnsTemp)
        } else {
          this.setCascChartsDatam(parseCaseChartType(chartType), result, temp.statistical_columns, temp)
        }
        this.cascadeLoading = false
      }
    },
    /**
     * 删除操作
     * @param index
     */
    deleteCass(index) {
      this.cascadeChartData.splice(index, 1)
      this.updatecasAllTemp.splice(index, 1)
      if (this.data_sizess[index]) {
        this.available_space = this.available_space + this.data_sizess[index]
      }
    },
    fullsize(index) {
      const isFullsized = this.cascadeChartData[index].isfullsize
      this.$set(this.cascadeChartData[index], 'isfullsize', !isFullsized)
      if (!isFullsized) {
        const mask = document.createElement('div')
        mask.className = 'v-modal chat-item-mask'
        mask.style.zIndex = 2002
        this.$el.appendChild(mask)
      } else {
        const existMask = this.$el.querySelector('.chat-item-mask')
        if (existMask) {
          existMask.remove()
        }
      }
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
        // this.$refs['chartItem_' + index].resizechart()
      })
    },
    /**
     * 保存此次画的图表 只保存配置信息
     */
    drawSaveCascade() {
      // 不要进行图表个数保存限制 图表为空时也可以保存
      if (this.explorerType === 'periodMonitorRun') {
        updatePeriodMonitorRunDataExperiments(parseInt(this.periodicDatasourceId), parseInt(this.streamingId), parseInt(this.runId), {
          chart_conf_json: JSON.stringify(this.updatecasAllTemp)
        }).then(res => {
          if (res.data.status !== 200) {
            this.$message.error(res.data.message)
          } else {
            this.$message.success(res.data.message)
          }
          this.cascadeLoading = false
        }).catch(error => {
          console.log(error)
          this.cascadeLoading = false
        })
      } else {
        savegetDataVisualchart('post', {
          chart_conf: JSON.stringify(this.updatecasAllTemp),
          project_id: parseInt(this.$store.getters.curProId),
          node_id: this.cascadeIndexId
        }).then(res => {
          if (res.data.status !== 200) {
            this.$message.error(res.data.message)
          } else {
            this.$message.success(res.data.message)
          }
          this.cascadeLoading = false
        }).catch(error => {
          console.log(error)
          this.cascadeLoading = false
        })
      }
    },
    /**
     * 缓存中是否存在
     * @param name
     * @returns {boolean}
     */
    isHaveCascCache(name) {
      return !!this.cascadeCache[name]
    },
    isHaveCascCacheScatterColor(name) {
      return !!this.cascadeCacheScatterColor[name]
    },
    /**
     * 重新设置参数信息
     * @param name
     */
    argsCascReset(name) {
      const oCastemp = { name: name }
      oCastemp['start_time'] = this.periodicTimeRange[0]
      oCastemp['end_time'] = this.periodicTimeRange[1]
      this.updatecas.map(item => {
        oCastemp[item.arg_name] = item.arg_value
      })
      oCastemp['type'] = parseInt(Object.keys(this.transferChart)[0])
      this.updatecasTemp = oCastemp
      const filter = this.updatecasAllTemp.filter(item => {
        if (_.isEqual(item, this.updatecasTemp)) {
          return item
        }
      })
      if (!_.isEmpty(filter)) {
        this.$message.error(this.$t('messages.flow.already_exists'))
        this.cascadeLoading = false
        return false
      } else {
        this.updatecasAllTemp.push(this.updatecasTemp)
        return true
      }
    },
    /**
     * 设置Casc Chart data 普通图表
     * @param chartType
     */
    setCascChartsData(chartType, columnsTemp) {
      const temp = columnsTemp
      const columns = temp.z ? [temp.x].concat(temp.y).concat(temp.z) : [temp.x].concat(temp.y)
      let chartVisualMapSetting = null
      if (temp.c) {
        if (temp.c !== '' && this.isHaveCascCacheScatterColor(temp.c)) {
          columns.push(temp.c)
          chartVisualMapSetting = {
            calculable: false,
            dimension: temp.c,
            right: 0,
            top: '10%',
            categories: this.cascadeCacheScatterColor[temp.c], // 已缓存过的颜色序列
            inRange: { color: fixed_colors_array }
          }
        }
      }
      // 此处特别处理热力图
      if (chartType === 'heatmap') {
        this.resetHeatMap(columns)
        return false
      }
      const columnsData = this.resetSimpleChartData(this.cascadeCache, columns)
      const size = columnsData.length > 5000 ? 2 : 4
      const setting = this.resetSetting([columnsTemp['x']], size, null, null, columns[0])
      if (chartType === 'bar') {
        setting.xAxisType = 'category'
      }

      if (chartType === 'scatter') {
        if (temp.z) {
          this.cascadeChartData.push({
            name: temp.c ? 'x=' + temp.x + ',y=' + temp.y + ',z=' + temp.z + ',c=' + temp.c : 'x=' + temp.x + ',y=' + temp.y + ',z=' + temp.z,
            scatter3D: this.scatter3Ddata(this.cascadeCache, [temp.x, temp.y, temp.z], temp.c ? temp.c : null),
            chartVisualMap: chartVisualMapSetting
          })
        } else {
          let formatColumnsData = columnsData
          if (temp.c) {
            if (temp.c !== '' && this.isHaveCascCacheScatterColor(temp.c)) { // 组装成v-charts的二维数据格式
              formatColumnsData = {}
              formatColumnsData[temp.y] = columnsData
            }
          }
          this.lastChartDataSet(chartType, columns, formatColumnsData, setting)
        }
        return false
      }
      this.lastChartDataSet(chartType, columns, columnsData, setting)
    },

    resetHeatMap(columns) {
      const data = columns.map(item => {
        return this.cascadeCache[item]
      })

      const headData = data[0].map((item, key) => {
        const temp = []
        columns.some((it, k) => {
          temp.push(data[k][key])
        })
        return temp
      })
      const headmapData = {
        xyz: columns,
        data: headData,
        min: Math.min(...data[2]),
        max: Math.max(...data[2])
      }
      this.cascadeChartData.push({ heatdata: headmapData })
    },
    /**
     * 特殊图表 [统计表,直方图,饼图,箱图,静态图,时序稳定]
     * @param chartType
     * @param result
     */
    setCascChartsDatam(chartType, result, cols, temp) {
      const name = chartType
      console.log(result)
      const data = result[name]
      if ((!data && data !== 0) || data === []) {
        this.$message.error(this.$t('messages.flow.data_compile_err'))
        this.resetEcasAllTemp()
        return false
      }
      const dkeys = Object.keys(data)
      switch (name) {
        case 'box':// 箱图
          this.cascadeChartData.push({ boxdata: result })
          break
        case 'static_table':// 统计表
          data[dkeys[0]]['统计字段'] = dkeys[0]
          this.cascadeChartData.push({ tabledata: data[dkeys[0]] })
          break
        case 'data_preview':// 数据预览
          this.dataPreviewChart(result.data_preview, result.rownum)
          break
        case 'persthreshold':// 个性化阈值
          // this.setCascChartsData()
          this.lastChartDataSet(chartType, temp, result)
          break
        case 'axis_trajectory': {
          const xname = temp.x + '_' + temp.y + ' ' + this.$t('strings.flow.axial_trajectory')
          let xdata = data[temp.x]
          let ydata = data[temp.y]
          if (typeof data[temp.x] === 'string') {
            xdata = data[temp.x].split('/')
            ydata = data[temp.y].split('/')
          }
          const scatterData = xdata.map((item, key) => [item, ydata[key]])
          this.cascadeChartData.push({
            multiScatter: scatterData,
            time: data['time'] || [],
            subTitle: data['time'][0],
            xName: xname,
            len: 8 })
          break
        }
        case 'correlation':// 相关性
          this.lastChartDataSet(chartType, null, result)
          break
        case 'outlier':// 相关性
          this.lastChartDataSet(chartType, null, result)
          break
        case 'pie':// 饼图
        case 'histogram':// 直方图
          this.pieHistogramChart(data, dkeys, name)
          break
        case 'covariance':// 协方差
        case 'p_coefficient':// p r sen
          this.cascadeChartData.push({ matrix: data, prex: cols, isConcat: true })
          break
        case 'sequence_stat': // 时序稳定
          this.sequenceStatChart(data, dkeys, chartType, temp)
          break
        case 'whitenoise': // 白噪声检验
          this.whitenoiseChart(data, dkeys, chartType, temp)
          break
        case 'fft': { // 频谱图
          const sname = temp.y + ' ' + this.$t('strings.flow.spectrum')
          const axdata = data[temp.x]
          const aydata = data[temp.y]
          const ascatterData = axdata.map((item, key) => [item, aydata[key]])
          this.cascadeChartData.push({
            multiScatter: ascatterData,
            toolBox: { feature: { dataZoom: { yAxisIndex: 'none' }, restore: {}}},
            time: data['time'] || [],
            subTitle: data['time'][0],
            xName: sname,
            chartType: 'bar',
            len: 1 })
          break
        }
        case 'distribution_test': { // 分布检验
          const eltabledata = data
          const header = [{ prop: 'column', label: 'column' }]
          // const header = Object.keys(data[0]).map(item => {
          //   return {
          //     prop: item,
          //     label: item
          //   }
          // })
          for (const item of Object.keys(data[0])) {
            if (item !== 'column') { header.push({ prop: item, label: item }) }
          }
          this.cascadeChartData.push({ eltabledata: eltabledata, elheader: header, eltabletitle: `${temp.distName}检验结果` })
          break
        }
        case 'time_series':// arima预测
          this.timeSeriesChart(data, cols)
          break
        case 'acf': // 自相关
        case 'pacf': // 偏自相关
          this.acfChart(data, cols)
          break
        case 'staticsInfo': // 统计信息查看
          this.setStaticsInfo(data, cols, temp)
          break
        default:
          console.log(name)
          this.$message.info('此图表暂未开发')
          break
      }
    },
    /**
     * 判断是否是时间字段
     * @param name
     * @returns {boolean}
     */
    isacTime(name) {
      const RG = ['time', '时间', 'date', 'datetime', '日期']
      let isTime = false
      const temp = RG.map(item => {
        return new RegExp(item, 'gi')
      })
      temp.some(item => {
        if (item.test(name)) {
          isTime = true
        }
      })
      return isTime
    },
    // 饼图直方图
    pieHistogramChart(data, dkeys, chartType) {
      const temp = []
      data[dkeys[0]][0].some((item, key) => {
        const t = {}
        t[dkeys[0]] = item
        t['count'] = data[dkeys[0]][1][key]
        temp.push(t)
      })
      dkeys.push('count')
      const setting = {
        xAxisName: [dkeys[0]],
        symbolSize: 1,
        xAxisType: 'category',
        large: true
      }
      this.lastChartDataSet(chartType, dkeys, temp, setting)
    },
    // 自相关 偏自相关
    acfChart(data, cols) {
      const acf_x = data.acf_x || data.pacf_x
      const acf_lower = data.acf_confint_lower || data.pacf_confint_lower
      const acf_upper = data.acf_confint_upper || data.pacf_confint_upper
      const acfname = data.acf_x ? (' ' + this.$t('strings.flow.autocorrelation')) : (' ' + this.$t('strings.flow.partial_correlation'))
      const acfdata = {
        value: acf_x,
        date: [...Array(acf_x.length).keys()],
        l: acf_lower,
        u: acf_upper
      }
      this.cascadeChartData.push({ arimadata: [acfdata], name: cols + acfname, chartType: 'bar' })
    },
    // arima时序预测
    timeSeriesChart(data, cols) {
      const oldtime = data.all_time.slice(0, -1)
      const newtime = [...data.all_time.slice(-1), ...data.new_time]
      const olddata = data[cols].slice(0, -1).map((item, key) => {
        return {
          value: item,
          date: oldtime[key],
          l: 0,
          u: 0
        }
      })

      const prediction = data[cols + '_Prediction']
      const prediction_u = data[cols + '_prediction_Lower']
      const prediction_l = data[cols + '_prediction_Upper']
      newtime.some((item, key) => {
        olddata.push({
          value: prediction[key],
          date: item,
          l: prediction_u[key],
          u: prediction_l[key]
        })
      })
      this.cascadeChartData.push({ arimadata: olddata, name: cols + ' ' + this.$t('strings.flow.timing_prediction') + ' ', chartType: 'line' })
    },

    // 时序稳定
    sequenceStatChart(data, dkeys, chartType, paramInfo) {
      const diffLabel = paramInfo.diff === '2' ? '二' : '一'
      const setting = {
        labelMap: {
          'ori_data': this.$t('strings.flow.original_sequence'),
          'diff_data': diffLabel + this.$t('strings.flow.order_difference')
        },
        xAxisType: 'category'
      }
      const columns = dkeys.filter(c => c !== 'test_result')
      let rows
      const diffLength = data.diff_data ? data.diff_data.length : -1
      if (paramInfo.timecol === '') {
        columns.unshift('__seq')

        rows = data.ori_data.map((c, i) => {
          const item = {}
          columns.forEach(v => {
            if (v === '__seq') { item[v] = i } else if (i < diffLength || v === 'ori_data') {
              item[v] = data[v][i]
            }
          })
          return item
        })
      } else {
        if (data.ori_data.length > 0 && (!data.timecol || data.timecol.length === 0)) {
          // throw new Error("时间列数据读取异常！")
          this.$message.error('时间列数据读取异常！')
          return
        }
        rows = data.ori_data.map((c, i) => {
          const item = {}
          columns.forEach(v => {
            if (i < diffLength || v === 'ori_data' || v === 'timecol') {
              item[v] = data[v][i]
            }
          })
          return item
        })
        columns.splice(columns.indexOf('timecol'), 1)
        columns.unshift('timecol')
      }

      const temp = {
        chartType: parseChartType(chartType),
        chartData: { columns, rows },
        chartDataZoom: [],
        chartSettings: setting
      }
      const titlePrefix = paramInfo.examine_func
      let limits = ''
      let pValue = 0
      let subTitle = `${this.$t('strings.flow.timecol')}：${paramInfo.timecol || '#seq'}, ${this.$t('strings.flow.statistics_column')} ：${paramInfo.statistical_columns}`
      let posLegend = 'center'
      if (Array.isArray(data.test_result)) {
        limits = this.$t('strings.flow.critical_value') + '：' + data.test_result[1].map(c => {
          return `[${c[0]}:${c[1]}]`
        }).toString()
        pValue = data.test_result[0]
        subTitle += '\n' + limits + '\n' + '{tip|' + this.$t('strings.flow.itisstable') + '}'
        posLegend = 'right'
      } else {
        pValue = data.test_result
        if (pValue < 0.05) {
          subTitle += '\n' + this.$t('strings.flow.less_significant') + '，{yes|' + this.$t('strings.flow.stable') + '}'
        } else {
          subTitle += '\n' + this.$t('strings.flow.less_significant') + '，{no|' + this.$t('strings.flow.nostable') + '}'
        }
      }

      temp.chartExtend = {
        grid: {
          show: true,
          top: limits ? 110 : 90,
          left: 20
        },
        legend: {
          top: limits ? 40 : 30,
          left: posLegend
        },
        title: {
          text: titlePrefix + 'p-value=' + pValue,
          subtext: subTitle,
          textStyle: {
            fontWeight: 'bold',
            fontSize: 14
          },
          subtextStyle: {
            color: '#333333',
            lineHeight: 20,
            rich: {
              yes: {
                color: 'blue'
              },
              no: {
                color: 'red'
              },
              tip: {
                fontStyle: 'italic',
                color: '#666666',
                padding: [0, 0, 0, 40]
              }
            }
          },
          padding: 10
        },
        xAxis: {
          axisLine: { show: false },
          splitLine: { show: false }
        },
        yAxis: {
          axisLine: { show: false },
          splitLine: { show: false }
        },
        series: {
          symbol: 'none'
        }
      }
      this.cascadeChartData.push(temp)
    },
    // 白噪声检验
    whitenoiseChart(data, dkeys, chartType, paramInfo) {
      const card = {
        chartType: 'card'
      }
      let resultSentence = this.$t('strings.flow.correlation')
      if (paramInfo.examine_func.indexOf('Ljung-box') >= 0) {
        if (data < 0.05) {
          resultSentence = this.$t('strings.flow.nowhite_noise')
        } else {
          resultSentence = this.$t('strings.flow.white_noise')
        }
      }
      card.innerHtml = `<div style="padding:20px;"><h4 style="margin-bottom:30px;">${this.$t('strings.flow.white_noise_test')}</h4>
        <ul style="padding:2em;">
          <li>${this.$t('strings.flow.statistics_column')}：${paramInfo.statistical_columns}</li>
          <li>${paramInfo.examine_func}&nbsp;&nbsp;p-value=${data}</li>
          <li>${resultSentence}</li>
        </ul>
      </div>`
      this.cascadeChartData.push(card)
    },
    // 数据预览信息
    dataPreviewChart(data, row) {
      const col = data.shift()
      const preview = { preheader: col, preview: data, r: row, c: col.length }
      this.cascadeChartData.push(preview)
    },
    // // 获取标准阈值
    // async getGCHThresholdValue(str) {
    //   return await getAtlasStandValue(str)
    // },
    // 组装标准阈值
    setGCHThresholdValue(data, cols) {
      const str = new Set()
      for (let i = 0, len = data.length; i < len; i++) {
        str.add(data[i].col.split('#')[0])
      }
      const tcn = this.$t('strings.column')
      const tct = this.$t('strings.flow.threshold_value')
      console.log(str, this.dataset_id, this.dataset_id.toString())
      return new Promise((resolve, reject) => {
        getAtlasStandValue(this.dataset_id, { names: Array.from(str) }).then(res => {
          const otherDatas = res.data
          console.log(res, otherDatas)
          const aResThreshold = []
          try {
            /** todo 当data和entities返回数据长度不一致时将出现bug 这里需要保持一致 */
            data.some((item, key) => {
              const temp = {}
              const col = data[key].col
              const otherData = otherDatas[key]
              const thres = data[key].maxThreshold ? data[key].maxThreshold : '-'
              if (otherDatas && otherData) {
                const { standard_value } = typeof otherData.other === 'string' ? JSON.parse(otherData.other) : otherData.other
                const asv = {}
                standard_value.some(t => {
                  asv[t.name] = t.value
                })
                temp[tcn] = col
                temp[tct] = thres
                console.log(col, temp, asv)
                aResThreshold.push(Object.assign(temp, asv))
              } else {
                temp[tcn] = col
                temp[tct] = thres
                aResThreshold.push(temp)
              }
            })
            resolve(aResThreshold)
          } catch (e) {
            console.log(e)
            reject('标准阈值获取失败!')
            // this.$message.error(this.$t('messages.flow.throsheld_geterror'))
          }
        }).catch(error => {
          console.log(error)
          /** todo 当data和entities返回数据长度不一致时将出现bug 这里需要保持一致 */
          reject('标准阈值获取失败!')
        })
      })
    },
    pushThresholdValue(temp, res) {
      const colum = Object.keys(res[0])
      temp = {
        ...temp,
        ...{ chartSettings: { xAxisName: '', xAxisType: 'category' },
          chartType: parseChartType('histogram'),
          chartData: { columns: colum, rows: res },
          chartExtend: { xAxis: { axisLabel: { interval: 0, rotate: 40 }}}
        }}
      this.cascadeChartData.push(temp)
    },
    /**
     * 数据统计信息查看 多图显示
     * @param data
     * @param cols
     * @param temp
     */
    setStaticsInfo(data, cols, temp) {
      const aCharts = []
      console.log(arguments)
      temp['x'].some(item => {
        const oD = data[item]
        const aData = oD.data
        const res = aData[0].map((v, key) => {
          const ot = {}
          ot[item] = v
          ot['count'] = aData[1][key]
          return ot
        })
        aCharts.push({
          staticsInfo: {
            info: oD,
            chartSettings: { xAxisName: item, xAxisType: 'category' },
            chartType: parseChartType('histogram'),
            proportion: aData[2], // 比重 在图表中特殊处理
            chartData: { columns: [item, 'count'], rows: res },
            chartDataZoom: [],
            legend: false
          }
        })
      })
      console.log(aCharts)
      this.cascadeChartData = [...this.cascadeChartData, ...aCharts]
    },
    /**
     * 最后chart的渲染过滤工作
     * @param chartType
     * @param columns
     * @param rows
     * @param setting
     */
    lastChartDataSet(chartType, columns, rows, setting) {
      let temp = {
        chartType: parseChartType(chartType),
        chartData: { columns: columns, rows: rows },
        chartDataZoom: [],
        chartSettings: setting,
        chartBrush: null,
        chartVisualMap: null
      }
      let perdata = []
      if (Array.isArray(rows[chartType])) {
        perdata = rows[chartType]
      }
      console.log(rows, perdata)
      // const perdata = rows[chartType]
      if (chartType === 'pie' || chartType === 'heatmap') { // 并图不需要chartDataZoom
        chartType === 'pie' && (temp.toolbox = {})
      } else if (chartType === 'persthreshold') { // 阈值
        const tcn = this.$t('strings.column')
        const tct = this.$t('strings.flow.threshold_value')
        this.setGCHThresholdValue(perdata, columns).then(res => {
          this.pushThresholdValue(temp, res)
        }).catch(err => { // 当atlas获取失败时也显示个性化阈值图
          const res = []
          perdata.some((item, key) => {
            const temp = {}
            const col = perdata[key].col
            const thres = perdata[key].maxThreshold ? perdata[key].maxThreshold : '-'
            temp[tcn] = col
            temp[tct] = thres
            res.push(temp)
          })
          console.log(temp, res)
          this.pushThresholdValue(temp, res)
          // this.resetEcasAllTemp()
          this.$message.error(err)
        })
        return
      } else if (chartType === 'correlation') { // 相关性
        const cols = Object.keys(perdata)
        const row = this.resetSimpleChartData(perdata, cols)
        const marklines = [rows['fit_curve'], rows['lower_boundary'], rows['upper_boundary']]
        const ths = this.settingThreshData(marklines, perdata[cols[0]])
        const mkdata = this.setMarkLine(ths, ['1', '2', '3'], marklines)
        const setting = this.resetSetting([cols[0]])
        temp = _.assign({}, temp, {
          chartData: { columns: cols, rows: row },
          chartType: parseChartType('scatter'),
          chartSettings: setting,
          markLine: mkdata
        })
      } else if (chartType === 'outlier') { // 相关性
        const cols = Object.keys(perdata)
        const row = this.resetSimpleChartData(perdata, cols)
        const outliers = rows['outlierClassifyMap'][cols[1]]
        const setting = this.resetSetting([cols[0]])
        setting['itemStyle'] = {
          'normal': {
            lineStyle: { 'width': 1 },
            color: function(param) {
              if (outliers[param.dataIndex] === -1) {
                return 'green'
              } else {
                return colors_abnormal[1]
              }
            }
          }
        }
        temp = _.assign({}, temp, {
          chartData: { columns: cols, rows: row },
          chartType: parseChartType('scatter'),
          chartSettings: setting
        })
      } else {
        const rowsize = rows.length
        if ((rowsize > 100000 && chartType === 'histogram') || rowsize > 300000) {
          this.$message.warning('Data is too large')
          return
        } else if (chartType === 'bar') {
          temp['chartType'] = parseChartType('histogram')
          temp['chartDataZoom'] = this.cascadeChartDataZoom
        } else if (chartType === 'histogram') {
          temp['chartDataZoom'] = []
        } else if (chartType === 'line') {
          // 折线图获取阈值
          const ml = []
          const mkEr = []
          const cls = columns.filter((item, key) => {
            if (key > 0 && this.cascadeCache['threshold_' + item]) { return item }
          })
          if (!_.isEmpty(cls)) {
            cls.some(item => {
              const t = this.cascadeCache['threshold_' + item]
              mkEr.push(t)
              t[0] && ml.push({ name: 'min_' + item, 'yAxis': t[0] })
              t[1] && ml.push({ name: 'max_' + item, 'yAxis': t[1] })
            })
            temp['markLine'] = temp['markLine'] = {
              data: ml,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    position: 'middle'
                  }
                }
              }
            }
            temp.chartSettings.max = [this.maxThreshold + 20]
            temp.chartSettings.min = [this.minThreshold - 20]
          }
          temp['chartDataZoom'] = this.cascadeChartDataZoom
          temp['chartExtend'] = { series: { showSymbol: false, smooth: true/*, smoothMonotone: 'x'*/ }}
        } else {
          if (chartType === 'scatter') {
            temp['chartVisualMap'] = null
            if (Object.prototype.toString.call(rows) === '[object Object]') {
              // 带颜色 TODO
              temp['chartVisualMap'] = {
                dimension: 2,
                right: 0,
                top: '10%',
                categories: this.cascadeCacheScatterColor[columns[2]], // 总是columns第二位代表颜色， dimension=2也是同意思
                inRange: { color: fixed_colors_array }
              }
            }
            temp['chartBrush'] = { toolbox: ['rect', 'clear'], throttleType: 'debounce', throttleDelay: '500' } // brushselect间歇执行
          }
          temp['chartDataZoom'] = this.cascadeChartDataZoom
        }
        console.log(temp)
        this.cascadeChartData.push(temp)
        return
      }
      this.cascadeChartData.push(temp)
    },
    /**
     * 关闭弹窗时重置操作
     */
    reset() {
      this.cascadeLoading = false
      this.cascadeData = [{ arg_range: [] }]
      this.updatecass = []
      this.cascadeChartData = []
      this.transferChart = { 0: 'primary' }
      this.cfgSnoopingGroup = [
        { key: '0', type: 'primary', label: this.$t('buttons.flow.select_chart') },
        { key: '1', type: 'normal', label: this.$t('buttons.flow.select_func') }]
      this.updatecasAllTemp = []
      this.cascadeCache = {}
      this.cascadeCacheScatterColor = {}

      this.cascadeIndexData = null
      this.cascadeIndex = null

      this.available_space = 51200
    },
    /**
     * 设置普通图表setting
     * @param xname
     * @param size
     * @param min
     * @param max
     * @returns {{xAxisName: *, xAxisType: string, symbolSize: *, heatColor: string[], itemStyle: {normal: {lineStyle: {width: number}}}}}
     */
    resetSetting(xname, size = 4, min, max, col) {
      const s = 5 // 防止阈值出现在底端或顶端
      const ma = [max + s]
      const mi = [min - s]
      const setting = {
        xAxisName: xname,
        xAxisType: 'value',
        symbolSize: size,
        heatColor: fixed_colors_array,
        // heatColor: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        itemStyle: {
          normal: {
            lineStyle: {
              width: 1// 设置线条粗细
            }
            // 异常值使用这里
            // color: function (param) {
            //   return getRandomColor();
            // }
          }
        }
      }
      min && (setting['min'] = mi)
      max && (setting['max'] = ma)
      this.isacTime(col) && (setting.xAxisType = 'category')
      return setting
    },
    /**
     * 重新组合chart所需要的数据格式
     * @param data Object
     * @param cols Array
     * @returns [{*}] Array
     */
    resetSimpleChartData(data, cols, color) {
      if (cols[0] === '') {
        // 如果x轴字段未设置，设置为序号
        cols[0] = '__seq'
        let _seq = 1
        return data[cols[1]].map((value, k) => {
          const t = {}
          cols.map(item => {
            if (item === '__seq') {
              t[item] = _seq++
            } else {
              t[item] = data[item][k]
            }
          })
          return t
        })
      }

      let mapData = data[cols[0]]
      if (!data[cols[0]]) {
        mapData = data[cols[1]]
        console.log('resetSimpleChartData接收的data：', data)
      }

      if (!mapData) return []
      return mapData.map((value, k) => {
        const t = {}
        cols.map(item => {
          if (data[item]) {
            t[item] = data[item][k]
          }
          // t['reactive_power_m'] = parseInt(Math.random() * (148 - 138 + 1) + 138, 10) // TODO
        })
        return t
      })
    },
    /**
     * 设置阈值chart中所需要的数据格式信息
     * @param values Array
     * @param names Array
     * @param num object 判断是否是多斜率阈值 y=ax+b
     * @returns {{data: *}} Object
     */
    setMarkLine(values, names, num) {
      if (num) {
        const d = values.map(item => {
          return item.map(em => {
            return {
              coord: em,
              symbol: 'none'
            }
          })
        })
        return {
          label: {
            normal: {
              show: true,
              formatter: function(param) {
                const temp = num[param.dataIndex]
                return 'y = ' + temp[0] + ' * x + ' + temp[1]
              },
              textStyle: {
                align: 'right'
              }
            }
          },
          lineStyle: {
            normal: {
              type: 'solid',
              color: '#666'
            }
          },
          data: d
        }
      }
      const ml = names.map((item, key) => {
        return {
          name: item,
          yAxis: values[key]
        }
      }).filter(item => {
        if (item.yAxis) {
          return true
        }
      }) // 组装并过滤空值
      return {
        data: ml,
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'middle'
            }
          }
        }
      }
    },
    settingThreshData(ths, data) {
      const min = Math.min(...data)
      const max = Math.max(...data)
      return ths.map((th, key) => {
        return [[min, th[0] * min + th[1]], [max, th[0] * max + th[1]]]
      })
    },
    /**
     * 专门处理数据探查子组件返回数据信息处理
     * @param temp
     * @param chartType
     * @param id
     * @param time
     * @returns {Function}
     */
    afterAddCass2(temp, chartType, id, time) {
      return function(res) {
        let data, xdata, ydata, scatterData
        if (chartType === 'bar') {
          data = res.data['fft']
          xdata = data[temp.x]
          ydata = data[temp.y]
          scatterData = xdata.map((item, key) => [item, ydata[key]])
        } else {
          data = res.data['axis_trajectory']
          xdata = data[temp.x]
          ydata = data[temp.y]
          if (typeof data[temp.x] === 'string') {
            xdata = data[temp.x].split('/')
            ydata = data[temp.y].split('/')
          }
          scatterData = xdata.map((item, key) => [item, ydata[key]])
        }

        this.cascadeChartData[id]['subTitle'] = time
        this.cascadeChartData[id]['multiScatter'] = scatterData
      }
    },
    /**
     * 多轴心轨迹子组件返回信息 并进行重新绘制
     * todo 不用异步时将会删除这段代码
     * @param time
     * @param id
     * @param chartType
     */
    // multiScattercallback(time,id,chartType){
    //   const temp = this.updatecasAllTemp[id]
    //   const mytemp = _.clone(temp)
    //   mytemp['time'] = time
    //   delete mytemp.type // 处理保存之后多一个type问题
    //   runCurrentNodes({
    //     flag:'DataVisualzation',
    //     visualdata:mytemp,
    //     project_id: parseInt(this.$store.getters.curProId),
    //     node_id:this.cascadeIndexId,
    //     available_space: this.available_space,
    //     type:temp.type
    //   }).then(res => {
    //     let data,xdata,ydata,scatterData
    //     if(chartType === 'bar'){
    //       data = res.data.datas['fft']
    //       xdata = data[temp.x]
    //       ydata = data[temp.y]
    //       scatterData = xdata.map((item,key) =>[item,ydata[key]])
    //     }else{
    //       data = res.data.datas['axis_trajectory']
    //       xdata = data[temp.x]
    //       ydata = data[temp.y]
    //       if(typeof data[temp.x] === 'string'){
    //         xdata = data[temp.x].split('/')
    //         ydata = data[temp.y].split('/')
    //       }
    //       scatterData = xdata.map((item,key) =>[item,ydata[key]])
    //     }
    //
    //     this.cascadeChartData[id]['subTitle'] = time
    //     this.cascadeChartData[id]['multiScatter'] = scatterData
    //   }).catch(err => {
    //     console.log(err)
    //     this.$message.error('获取失败!')
    //   })
    // }, // 5s内执行一次
    /**
     * 多轴心轨迹子组件返回信息 并进行重新绘制
     * todo 异步时调用
     * @param time
     * @param id
     */
    async multiScattercallback(time, id, chartType) {
      const oCasca = this.updatecasAllTemp[id]
      const oCascaClone = _.clone(oCasca)
      if (time === undefined) {
        this.cascadeLoading = false
        this.$message.warning('时间选择错误')
      } else {
        oCascaClone['time'] = time
        delete oCascaClone.type // 处理保存之后多一个type问题
        if (this.explorerType === 'periodMonitorRun') {
        // 周期监测中流运行详情的数据探查
          const params = {
            form_args: oCascaClone,
            available_space: this.available_space,
            type: oCasca.type
          }
          try {
            const response = await addPeriodMonitorRunDataExperiments(parseInt(this.periodicDatasourceId), parseInt(this.streamingId), parseInt(this.runId), params)
            this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)
            if (response) {
              this.receiveMmessage = this.afterAddCass2(oCasca, chartType, id, time)
            }
          } catch (e) {
            console.log(e)
            this.resetEcasAllTemp()
          }
        } else {
          const params = {
            visualdata: oCascaClone,
            node_id: this.cascadeIndexId,
            available_space: this.available_space,
            type: oCasca.type
          }
          try {
            const response = await addDataExperiments(parseInt(this.$store.getters.curProId), params)
            this.$socket.emit('join', `/runs/${this.$store.getters.id}/logs`)
            if (response) {
              this.receiveMmessage = this.afterAddCass2(oCasca, chartType, id, time)
            }
          } catch (e) {
            console.log(e)
            this.resetEcasAllTemp()
          }
        }
      }
    },
    /**
     * 重置3d散点图数据结构
     */
    scatter3Ddata(data, head, color) {
      const x = data[head[0]]
      const y = data[head[1]]
      const z = data[head[2]]
      let c = null
      if (color && this.isHaveCascCacheScatterColor(color)) {
        c = data[color]
        head.push(color)
      }

      const d = x.map((item, key) => {
        if (c) {
          return [item, y[key], z[key], c[key]]
        }
        return [item, y[key], z[key]]
      })
      d.unshift(head)
      return d
    },
    /**
     * 重置操作-数据探查出现错误时去除loading和弹出已经保存的参数
     */
    resetEcasAllTemp() {
      this.updatecasAllTemp.pop()
      this.cascadeLoading = false
    },
    // ws返回数据
    receive_message(res) {
      if (res) {
        try {
          if (res.status === 'success') {
            // 数据探查返回的数据
            console.log('数据探查数据返回渲染', res)
            this.receiveMmessage(filterResponse(res))
          } else if (res.status === 'error') {
            // 数据探查返回的数据
            console.log('数据探查数据返回错误')
            this.$message.error(res.data)
            this.resetEcasAllTemp()
          } else {
            console.log(res)
          }
          this.isSendChart = true // 打开请求
        } catch (err) {
          console.error(err)
        }
      }
    },
    // 数据探查，保存数据到历史记录 or 导出csv，调用公共导出弹框操作在flowcommon.js
    handleOutputDropdownCommand(command) {
      this.$emit('dataExplorerOutputData', command, this.provData)
    },
    dataExplorerOutputData(type, chart) {
      return {
        'type': type,
        'chart': chart
      }
    },
    getDataBaseChartExplorerOutputData(command, datazoomEvent, brushSelectedEvent, xAxisDataRange) {
      if (command.chart.chartType === 've-line' && command.chart.chartData.columns[0] === '__seq') {
        // x轴未指定字段不允许导出
        this.$message.error('x轴未指定字段不允许导出')
      } else {
        let xAxisDataRangeNew = xAxisDataRange
        if (command.chart.chartSettings.xAxisType === 'value') {
          if (this.minThreshold >= 0) {
            xAxisDataRangeNew = [0, xAxisDataRange[1]]
          }
          if (this.maxThreshold <= 0) {
            xAxisDataRangeNew = [xAxisDataRange[0], 0]
          }
        }
        this.$emit('dataExplorerOutputData', command, this.provData, datazoomEvent, xAxisDataRangeNew, brushSelectedEvent)
      }
    }
  },
  sockets: {
    message(data) {
      console.log('socket data', data)// 接收的消息
      this.receive_message(data)
    }
  }
}
