export default function GetDataVisualArgs() {
  return [{
    'arg_doc': '图表类型',
    'arg_name': 'chart_type',
    'arg_type': 'cascade',
    'arg_range': [
      {
        'arg_doc': '数据预览',
        'arg_name': 'data_preview',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': '字段'
          }
        ],
        'arg_value': '',
        'arg_zname': '数据预览'
      },
      {
        'arg_doc': '统计信息查看',
        'arg_name': 'staticsInfo',
        'is_mlti': 'True',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '份数',
            'arg_name': 'bin',
            'arg_type': 'value',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-bin值'
          }
        ],
        'arg_value': '',
        'arg_zname': '统计信息查看'
      },
      {
        'arg_doc': '折线图',
        'arg_name': 'line',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '折线图'
      },
      {
        'arg_doc': '柱状图',
        'arg_name': 'bar',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '柱状图'
      },
      {
        'arg_doc': '散点图',
        'arg_name': 'scatter',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'z',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Z-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'c',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': '颜色'
          }
        ],
        'arg_value': '',
        'arg_zname': '散点图'
      },
      {
        'arg_doc': '热力图',
        'arg_name': 'heatmap',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'z',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Z-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '热力图'
      },
      {
        'arg_doc': '饼图',
        'arg_name': 'pie',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '份数',
            'arg_name': 'bin',
            'arg_type': 'value',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'bin值'
          }
        ],
        'arg_value': '',
        'arg_zname': '饼图'
      },
      {
        'arg_doc': '直方图',
        'arg_name': 'histogram',
        'arg_type': 'addComp',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '份数',
            'arg_name': 'bin',
            'arg_type': 'value',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'bin值'
          }
        ],
        'arg_value': '',
        'arg_zname': '直方图'
      },
      {
        'arg_doc': '箱形图',
        'arg_name': 'box',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '箱形图'
      },
      {
        'arg_doc': '个性化阈值图',
        'arg_name': 'persthreshold',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'columns',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '个性化阈值图'
      },
      {
        'arg_doc': '轴心轨迹图',
        'arg_name': 'axis_trajectory',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': '',
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'list',
            'arg_range': '',
            'arg_value': '',
            'arg_zname': 'Y-轴'
          },
          {
            'arg_doc': '轨迹显示(转/组)',
            'arg_name': 'track_cycle',
            'arg_type': 'value',
            'arg_range': '',
            'arg_value': '0.8',
            'arg_zname': '轨迹周期(秒/转)'
          },
          {
            'arg_doc': '轨迹显示(转/组)',
            'arg_name': 'track_show',
            'arg_type': 'value',
            'arg_range': '',
            'arg_value': '8',
            'arg_zname': '轨迹显示(转/组)'
          }
        ],
        'arg_value': '',
        'arg_zname': '轴心轨迹图'
      },
      {
        'arg_doc': '时序预测图',
        'arg_name': 'time_series',
        'arg_range': [
          {
            'arg_doc': '统计列',
            'arg_name': 'statistical_columns',
            'arg_type': 'list',
            'arg_range': '',
            'arg_value': '',
            'arg_zname': '统计列'
          }

        ],
        'arg_value': '',
        'arg_zname': '时序预测图'
      },
      {
        'arg_doc': '频谱图',
        'arg_name': 'fft',
        'arg_range': [
          {
            'arg_doc': '选择字段',
            'arg_name': 'x',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'X-轴'
          },
          {
            'arg_doc': '选择字段',
            'arg_name': 'y',
            'arg_type': 'list',
            'arg_range': null,
            'arg_value': '',
            'arg_zname': 'Y-轴'
          }
        ],
        'arg_value': '',
        'arg_zname': '频谱图'
      }
    ],
    'arg_value': '折线图',
    'arg_zname': '图表类型'
  },
  {
    'arg_doc': '统计分析',
    'arg_name': 'chart_type',
    'arg_type': 'cascade',
    'arg_range': [{
      'arg_doc': '分布检验',
      'arg_name': 'distribution_test',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'columns',
          'arg_range': null,
          'arg_value': '',
          'arg_zname': '统计列'
        },
        {
          'arg_doc': '校验服从分布',
          'arg_name': 'distName',
          'arg_type': 'list',
          'arg_range': [
            '卡方分布',
            '正态分布',
            'T分布',
            '泊松分布',
            '二项分布'
          ],
          'arg_relation': {
            '卡方分布': {
              'show': [
                3
              ],
              'noshow': [
                4, 5, 6
              ],
              'value': {

              }
            },
            '正态分布': {
              'show': [

              ],
              'noshow': [
                3, 4, 5, 6
              ],
              'value': {

              }
            },
            'T分布': {
              'show': [
                3
              ],
              'noshow': [
                4, 5, 6
              ],
              'value': {

              }
            },
            '泊松分布': {
              'show': [
                4
              ],
              'noshow': [
                3, 5, 6
              ],
              'value': {

              }
            },
            '二项分布': {
              'show': [
                5, 6
              ],
              'noshow': [
                3, 4
              ],
              'value': {

              }
            }
          },
          'arg_value': '卡方分布',
          'arg_zname': '校验服从分布'
        },
        {
          'arg_doc': '显著性水平',
          'arg_name': 'thresh',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0.05,
          'arg_zname': '显著性水平'
        },
        {
          'arg_doc': '自由度',
          'arg_name': 'freenum',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': '0',
          'arg_zname': '自由度'
        },
        {
          'arg_doc': 'λ',
          'arg_name': 'mu',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': 'λ'
        },
        {
          'arg_doc': '独立伯努利实验重复次数n',
          'arg_name': 'n',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': '',
          'arg_style': 'width:80px;',
          'arg_zname': '独立伯努利实验重复次数n'
        },
        {
          'arg_doc': '每次实验成功概率p',
          'arg_name': 'p',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': '',
          'arg_style': 'width:80px;',
          'arg_zname': '每次实验成功概率p'
        }
      ],
      'arg_value': '',
      'arg_zname': '分布检验'
    }, {
      'arg_doc': '协方差',
      'arg_name': 'covariance',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'columns',
          'arg_range': null,
          'arg_value': '',
          'arg_zname': '统计列'
        }
      ],
      'arg_value': '',
      'arg_zname': '协方差'
    }, {
      'arg_doc': '皮尔森系数',
      'arg_name': 'p_coefficient',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'columns',
          'arg_range': null,
          'arg_value': '',
          'arg_zname': '统计列'
        }
      ],
      'arg_value': '',
      'arg_zname': '皮尔森系数'
    }, {
      'arg_doc': '序列平稳性',
      'arg_name': 'sequence_stat',
      'arg_range': [

        { 'arg_doc': '时间列',
          'arg_name': 'timecol',
          'arg_type': 'list',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': '时间列'
        },
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'list',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': '统计列'
        },
        {
          'arg_doc': '检验方法',
          'arg_name': 'examine_func',
          'arg_type': 'list',
          'arg_range': ['ADF检验', 'KPSS检验'],
          'arg_value': '',
          'arg_zname': '检验方法'
        },
        {
          'arg_doc': '差分阶数',
          'arg_name': 'diff',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0,
          'arg_zname': '差分阶数'
        }
      ],
      'arg_value': '',
      'arg_zname': '序列平稳性'
    },
    {
      'arg_doc': '自相关图',
      'arg_name': 'acf',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'list',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': '统计列'
        },
        {
          'arg_doc': '差分阶数',
          'arg_name': 'diff',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0,
          'arg_zname': '差分阶数'
        },
        {
          'arg_doc': '置信水平',
          'arg_name': 'alpha',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0.95,
          'arg_zname': '置信水平'
        },
        {
          'arg_doc': '最高滞后阶数',
          'arg_name': 'nlags',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 40,
          'arg_zname': '最高滞后阶数'
        }
      ],
      'arg_value': '',
      'arg_zname': '自相关图'
    },
    {
      'arg_doc': '偏自相关图',
      'arg_name': 'pacf',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'list',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': '统计列'
        },
        {
          'arg_doc': '差分阶数',
          'arg_name': 'diff',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0,
          'arg_zname': '差分阶数'
        },
        {
          'arg_doc': '置信水平',
          'arg_name': 'alpha',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 0.95,
          'arg_zname': '置信水平'
        },
        {
          'arg_doc': '最高滞后阶数',
          'arg_name': 'nlags',
          'arg_type': 'value',
          'arg_range': '',
          'arg_value': 40,
          'arg_zname': '最高滞后阶数'
        }
      ],
      'arg_value': '',
      'arg_zname': '偏自相关图'
    }, {
      'arg_doc': '白噪声检验',
      'arg_name': 'whitenoise',
      'arg_range': [
        {
          'arg_doc': '统计列',
          'arg_name': 'statistical_columns',
          'arg_type': 'list',
          'arg_range': '',
          'arg_value': '',
          'arg_zname': '统计列'
        },
        {
          'arg_doc': '检验方法',
          'arg_name': 'examine_func',
          'arg_type': 'list',
          'arg_range': [
            'Ljung-box检验(Q检验)',
            'DW检验'
          ],
          'arg_value': '',
          'arg_zname': '检验方法'
        }
      ],
      'arg_value': '',
      'arg_zname': '白噪声检验'
    }
    ],
    'arg_value': '',
    'arg_zname': '统计分析'
  }]
}
