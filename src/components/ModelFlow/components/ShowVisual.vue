<!--- 此文件已经不再使用 此处是为了后期排查 ---->

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="titles.title"
    :before-close="setVisible"
    width="95%">
    <div style="min-height:400px">
      <el-tabs v-if="titles.type=== 'evaluator'" type="card" v-model="m" style="min-height: 600px;">
        <div v-for="(item, index) in allData" :key="index">
          <el-tab-pane :label="item.title" :name=index.toString()>
            <div v-for="(value, key) in item.data" :key="key"
                 v-bind:style="value['chartType']==='table'?{'margin-right': '10px'}:{'display': 'inline-block','margin-right': '10px'}">
              <component
                v-if="value['chartType']==='table'"
                is="PreviewTable"
                :fileup-end-data="value['values'] | splitData"
                :table-header="value['values'] | splitDataH" ></component>
              <BaseCharts v-else :chartType="value['chartType']" :chartData="value['chartData']"></BaseCharts>
            </div>
          </el-tab-pane>
        </div>
      </el-tabs>
      <div v-else-if="titles.type==='dataset'">
        <template>
          <el-tabs v-if="lists" v-model="datasetEditableTabsValue" type="card">
            <el-tab-pane type="card" v-for="(item, index) in lists" :key="index" :label=index.toString() :name=index.toString()>
              <PreviewKvTable :fileup-end-data="item.data | splitData"
                        :table-header="item.data | splitDataH" :left-data="item.leftdata">
              </PreviewKvTable>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>
      <div v-else-if="titles.type==='net'">
        <NetChart />
      </div>
      <div v-else-if="titles.type==='tree'">
        <treeChartOne  :chart-data="treeChart" height="600px" width="100%"/>
      </div>
      <div v-else>
        <h1>{{titles.type}}</h1>
        <span>暂未实现</span>
      </div>
    </div>
  </el-dialog>
</template>
<script>
  import PreviewTable from '@/components/Table/PreviewTable' //基础表格组件
  import PreviewKvTable from '@/components/Table/PreviewKvTable' //基础表格组件
  import BaseCharts from '@/components/Charts/BaseCharts'　//基础图表组件
  import NetChart from '@/components/Charts/NetChart'　//神经网络
  import treeChartOne from '@/components/Charts/treeChartOne'　//树

  import { parseTime, parseChartType } from '@/utils/index'

  export default {
    name: 'ShowVisual',
    components: { PreviewTable, PreviewKvTable, BaseCharts, NetChart, treeChartOne },
    props: {
      dialogVisible: {
        type: Boolean,
        default: false
      },
      lists: {
        // type: Object,
        type: Array,
        default: null
      },
      titles: {
        type: Object,
        default: null
      }
    },
    filters: {
      splitData(data) {
        let t = data.slice(1)
        return t
      },
      splitDataH(data) {
        let t = data.slice(0, 1)
        return t[0]
      }
    },
    data() {
      return {
        m: '1',
        datasetEditableTabsValue: '0',
        allData: null,
        chartDataZoom: [{ type: 'slider' }],
        previewDatas: [],
        dataset: {
          'data': [["columns1", "columns2"], [1, 2, 3], [1, 2, 3]],
          'leftdata': {
            'statistics': [
              [
                { 'Mean': 38 },
                { 'Median': 37 },
                { 'Mi': 17 },
                { 'Standard Deviation': 13.34 },
                { 'Unique Values': 73 },
                { 'Missing Values': 0 },
                { 'Feature Type': 'Numeric Feature' }
              ], [
                { 'Mean': 38 },
                { 'Median': 37 },
                { 'Mi': 17 },
                { 'Standard Deviation': 13.34 },
                { 'Unique Values': 73 },
                { 'Missing Values': 0 },
                { 'Feature Type': 'Numeric Feature' }
              ]
            ],
            'visual': [[['Mon', 22], ['Tue', 34], ['Wed', 45]], [['Mon', 22], ['Tue', 34], ['Wed', 45]]]
          }
        },
        kvtable: [{
          'type': 'kvtable',
          'titles': 'Settings',
          'cols': ['Setting', 'Value'],
          'value': [{ 'Number of Leaves': 20 }, { 'Minimum Leaf Instances': 10 }, { 'Learning Rate': 0.2 }]
        }],
        evaluator: [{
          'type': 'line',
          'title': 'ROC Precison/Recall LIFT',
          'x_label': 'False Positive Rate',
          'y_lbbel': 'True Positive Rate',
          'value': [
            [1, 2],
            [3, 4],
            [5, 6]
          ]
        }, {
          'type': 'table',
          'title': '',
          'cols': ['Score Bin', 'Positive Examples', 'Negative Examples'],
          'value': [
            ['(0.900,1.000]', 853, 61],
            []
          ]
        }, {
          'type': 'scatter',
          'title': '',
          'x_label': 'X axis label',
          'y_label': 'y axis label',
          'value': [
            [1, 2],
            [3, 4],
            [5, 6]
          ]
        }],
        tree: {
          'type': 'tree',
          'tree_num': 100,
          'name': 'petal length(cm) > 2.45',
          'children': [
            {
              'name': 'petal width(cm) >1.75',
              'children': [{}, {}]
            },
            {
              'name': '50 of setosa'
            }
          ]
        },
        net: {
          'type': 'net',
          'value': []
        },
        treeChart:[
          {
            'name': '450000047683716450000047683716 petal length (cm) > 2.450000047683716',
            'children': [
              {
                'name': 'petal width (cm) > 1.75',
                'children': [
                  {
                    'name': 'petal length (cm) > 4.850000381469727',
                    'children': [
                      {
                        'name': '0 of setosa, 0 of versicolor, 43 of virginica'
                      },
                      {
                        'name': 'sepal length (cm) > 5.949999809265137',
                        'children': [
                          {
                            'name': '0 of setosa, 0 of versicolor, 2 of virginica'
                          },
                          {
                            'name': '0 of setosa, 1 of versicolor, 0 of virginica'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    'name': 'petal length (cm) > 4.949999809265137',
                    'children': [
                      {
                        'name': 'petal width (cm) > 1.5499999523162842',
                        'children': [
                          {
                            'name': 'sepal length (cm) > 6.949999809265137',
                            'children': [
                              {
                                'name': '0 of setosa, 0 of versicolor, 1 of virginica'
                              },
                              {
                                'name': '0 of setosa, 2 of versicolor, 0 of virginica'
                              }
                            ]
                          },
                          {
                            'name': '0 of setosa, 0 of versicolor, 3 of virginica'
                          }
                        ]
                      },
                      {
                        'name': 'petal width (cm) > 1.6500000953674316',
                        'children': [
                          {
                            'name': '0 of setosa, 0 of versicolor, 1 of virginica'
                          },
                          {
                            'name': '0 of setosa, 47 of versicolor, 0 of virginica'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                'name': '50 of setosa, 0 of versicolor, 0 of virginica'
              }
            ]
          }
        ]
      }
    },

    methods: {
      setVisible() {
        this.$emit('setVisualVisible', false)
      },
      // 接收数据并格式化
      updateChart(data) {
        const testdata = JSON.parse(data)
        const d = testdata.result
        this.allData = d.map((item, index) => {
          const chartType = parseChartType(item.node_zname)
          const data = item.x_y_data ? item.x_y_data.map((value, key) => {
            const culomn = [value.x_title, value.y_title]
            const seri = value.x.map((v, k) => {
              const a = {}
              a[value.x_title] = parseTime(v * 1000)
              a[value.y_title] = value.y[k]
              return a
            })
            const y_thresholds = value.y_thresholds
            const markline = y_thresholds.map(item => {
              return {
                yAxis: item,
                name: this.$t('strings.flow.threshold_value')
              }
            })
            return {
              chartData: {
                columns: culomn,
                rows: seri
              },
              chartType: chartType,
              markLine: {
                label: {
                  normal: {
                    position: 'middle'
                  }
                },
                data: markline
              }
            }
          }) : [{
            chartType: chartType,
            values: item.values
          }]
          return {
            title: item.title,
            data: data
          }
        })
      }
    }
  }

</script>

<style scoped>

</style>
