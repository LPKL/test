<!--
 * @author cuichuanwa
 * @date 19-9-19 下午3:53
 * @description 多图显示(默认散点图) 根据传递过来的数来决定显示个数 过多可能每一张图会比较小 主要用在轴心轨迹和频谱图中
 -->
<template>
  <div :style="'width:'+mwidth+';height:'+mheight+';'" class="multi-scatter">
    <i v-show="multiPages" class="el-icon-arrow-left ileft" @click="clickchange(currentPage-1)"/>
    <i v-show="multiPages" class="el-icon-arrow-right iright" @click="clickchange(currentPage+1)"/>
    <div style="text-align: center;padding-top: 10px;"><span style="font-size: 12px;">{{ xName }}</span></div>
    <div style="text-align: center;padding-top: 5px;"><span style="font-size: 11px;">{{ subTitle }}</span></div>
    <div v-loading="loading" :style="'width:'+mwidth + ';height:calc(100% - 110px);'" >
      <template v-for="(item, key) in [...Array(ids)]" >
        <div :id="'multi_scatter'+key+''+id" :key="key" :style="'width:'+width+';height:'+height+';margin-top:-30px;'" class="multi-chart"/>
      </template>
    </div>
    <TimeSelect v-show="multiPages" :times="time" :width="timewidth" :onetime="onetime" :canvasid="Number(new Date())" :isload="loading" height="90" style="margin-top: -12px;" @pagechange="pagechange"/>
  </div>
</template>

<script>
import echarts from 'echarts'
import TimeSelect from './TimeSelect'
import debounce from 'lodash/debounce'
import windowresize from './mixins/windowresize'

export default {
  name: 'MultipleScatterPlot',
  components: { TimeSelect },
  mixins: [windowresize],
  props: {
    mwidth: { // 组件宽度
      type: String,
      default: '100%'
    },
    toolBox: {
      type: Object,
      default: null
    },
    mheight: { // 组件高度
      type: String,
      default: '100%'
    },
    xName: { // 图表名称
      type: String,
      default: 'xiax-xiay轴心轨迹'
    },
    subTitle: { // 图表名称
      type: String,
      default: '2019-13-01'
    },
    chartType: {
      type: String,
      default: 'scatter'
    },
    time: { // 图表名称
      type: Array,
      default: () => { return [1, 2, 3, 4, 5, 6, 7] }
    },
    chartData: { // 轴心轨迹数据
      type: Array,
      default: () => {
        return [
          [10.0, 8.04],
          [8.0, 6.95],
          [13.0, 5.58],
          [9.0, 8.81],
          [11.0, 8.33],
          [14.0, 0.96],
          [6.0, 7.24],
          [11.0, 7.58],
          [9.0, 8.81],
          [11.0, 8.33],
          [14.0, 0.96],
          [6.0, 7.24],
          [11.0, 7.58]
        ]
      }
    },
    ids: {
      type: Number,
      default: 8 // 默认显示8张图表
    },
    id: {
      type: Number,
      default: 8 // 默认显示8张图表
    },
    multiPages: { // true时只显示指定时间的数据，无翻页，时间轴控件
      type: Boolean,
      default: true
    }

  },
  data() {
    return {
      width: '90px', // 每张图的宽计算得出
      height: '180px', // todo 现在高先是固定的
      loading: false,
      xtime: null,
      charts: [],
      currentPage: 0,
      pageSize: 1,
      pagerCount: 5,
      upnum: 0,
      oldnum: 0,
      oldpage: 1,
      timewidth: '600px',
      onetime: 0,
      offsetTop: 120
      // times: ['2018-10-28 10:00:00', '2018-10-28 10:20:90', '2018-10-28 10:00:90', '2018-10-28 10:00:80', '2018-10-28 10:00:70', '2018-10-28 10:00:60', '2018-10-28 10:00:50', '2018-10-28 10:00:40', '2018-10-28 10:00:30', '2018-10-28 10:00:20', '2018-10-28 10:00:00', '2018-10-28 10:20:90', '2018-10-28 10:00:90', '2018-10-28 10:00:80', '2018-10-28 10:00:70', '2018-10-28 10:00:60', '2018-10-28 10:00:50', '2018-10-28 10:00:40', '2018-10-28 10:00:30', '2018-10-28 10:00:20', '2018-10-28 10:00:00', '2018-10-28 10:20:90', '2018-10-28 10:00:90', '2018-10-28 10:00:80', '2018-10-28 10:00:70', '2018-10-28 10:00:60', '2018-10-28 10:00:50', '2018-10-28 10:00:40', '2018-10-28 10:00:30', '2018-10-28 10:00:20'],

    }
  },

  watch: {
    '$props.chartData': {
      handler: function(newer, older) {
        this.resetChart(newer)
        this.oldnum++
        this.loading = false
      },
      deep: true
    },
    'currentPage': {
      handler: function(newer, older) {
        this.oldpage = older
      }
    }
  },
  created() {
    const len = this.$props.ids
    // 每个图的宽度百分比
    if (len > 2) {
      this.width = 100 / (len / 2) + '%'
      this.height = '50%' // 计算得出每个图表的高度
    } else {
      this.width = 100 / len + '%'
      this.height = '100%' // 计算得出每个图表的高度
    }
    this.xtime = this.$props.time
  },
  mounted() {
    this.timewidth = document.querySelector('.multi-scatter').clientWidth // 获取图宽度
    const len = this.$props.ids
    // 分割传递进来的数组
    const arr = this.spliteArray(this.$props.chartData, (this.$props.chartData.length / len))
    for (let i = 0; i < len; i++) {
      const chart = echarts.init(document.getElementById('multi_scatter' + i + '' + this.id))
      this.charts.push(chart)
      const option = this.getOptions(arr[i])
      chart.setOption(option)
    }
  },
  methods: {
    /**
     * 把一个数组分割成num份 每一份都放到一个数组中
     * @param arr
     * @param num
     * @returns {Array}
     */
    spliteArray(arr, num) {
      const result = []
      for (let i = 0, len = arr.length; i < len; i += num) {
        result.push(arr.slice(i, i + num))
      }
      return result
    },
    getOptions(data) {
      return {
        grid: {
          x: this.$props.toolBox ? 40 : 20,
          y2: 18
        },
        xAxis: {
          scale: true,
          axisLabel: {
            fontSize: '8'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        // backgroundColor: '#ffffff',
        toolbox: this.$props.toolBox,
        yAxis: {
          scale: true,
          axisLabel: {
            fontSize: '6'
          }
        },
        series: [{
          symbolSize: 4,
          data: data,
          type: this.$props.chartType
        }]
      }
    },
    resetChart(data) {
      const len = this.$props.ids
      const arr = this.spliteArray(data, (this.$props.chartData.length / len))
      for (let i = 0; i < len; i++) {
        const option = this.getOptions(arr[i])
        this.charts[i].setOption(option)
      }
    },
    /**
     * 更新面板 时开启更新 history
     */
    pagechange: debounce(function(ctime) {
      this.currentPage = this.xtime.indexOf(ctime)
      if (this.upnum === this.oldnum) {
        this.loading = true
        console.log('第' + ctime + '页数据', ctime)
        this.upnum++
        this.$emit('callback', ctime, this.$props.id, this.$props.chartType)
      } else {
        this.$message.error(this.$t('messages.flow.speed_fast'))
      }
      // 返回给父组件数据信息 页码 todo 请注意callback函数内容
    }, 800),
    /**
     * 左右选择按钮
     * @param page
     */
    clickchange(page) {
      if (page >= 0 && page <= this.$props.time.length) {
        // this.currentPage = page
        this.onetime = page
        this.pagechange(this.xtime[page])
      } else {
        console.log('数据不存在')
      }
    }
  }
}
</script>

<style  rel="stylesheet/scss" lang="scss"  scoped>
  .multi-scatter {
    position: relative;
    .multi-chart{
      display: inline-block;
    }
    i{
      position: absolute;
      top:0;
      bottom: 0;
      margin: auto;
      font-size: 40px;
      height: 40px;
      line-height: 40px;
      color: #ccc;
      z-index: 9999;
      cursor: pointer;
      opacity: 0.3;
      &:hover{
        color: #000;
        background-color: #ccc;
        opacity: 0.4;
      }
      &.ileft{
        left: 0;
      }
      &.iright{
        right: 0;
      }
    }
  }
</style>

