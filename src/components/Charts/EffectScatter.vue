<!--
异常散点图
-->
<template>
  <div v-loading="loading" :id="id" :style="'width:'+width+';height:'+height+';margin-top: 2px;'"/>
</template>

<script>
import echarts from 'echarts'
import isEmpty from 'lodash/isEmpty'
import windowresize from './mixins/windowresize'
export default {
  name: 'EffectScatter',
  mixins: [windowresize],
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    type: {
      type: String,
      default: 'category'
    },
    scatterData: {
      type: Object,
      default: null
    },
    toolbox: {
      type: Object,
      default: null
    },
    names: {
      type: Array,
      default: null
    },
    xName: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: 'scatter'
    }
  },
  data() {
    return {
      chart: null,
      options: null,
      loading: true,
      testData: { effect: [], data: [] }
    }
  },
  watch: {
    '$props.scatterData': {
      handler: function(newer, older) {
        if (!isEmpty(newer)) {
          this.loading = false
        }
        this.initChart(newer, this.chart)
      },
      deep: true
    }
  },
  mounted() {
    const chart = echarts.init(document.getElementById(this.$props.id))
    this.chart = chart
    const tb = this.$props.toolbox || {
      feature: {
        dataZoom: {
        },
        restore: {}
      },
      right: '30px'
    }
    this.options = {
      animation: false, // 去掉渲染动画 不然更新时会有晃动
      tooltip: {
        trigger: 'axis'
      },
      toolbox: tb,
      backgroundColor: '#ffffff',
      xAxis: {
        name: this.$props.xName,
        nameLocation: 'middle',
        nameGap: 30,
        type: this.$props.type,
        scale: true
      },
      yAxis: {
        scale: true
      },
      legend: {
        data: ['异常'].concat(this.$props.names),
        left: 'center'
      },
      series: []
    }
    this.initChart(this.$props.scatterData, chart)
  },
  methods: {
    initChart(pdata, chart) {
      let data = this.testData
      if (!isEmpty(pdata)) {
        data = pdata
      }
      try {
        const temp = [{
          name: '异常',
          type: 'effectScatter',
          symbolSize: 15,
          data: data.effect
        }].concat(data.data.map((item, key) => {
          return {
            name: this.$props.names[key],
            type: 'scatter',
            data: item
          }
        }))
        this.options.series = temp
        chart.setOption(this.options)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

