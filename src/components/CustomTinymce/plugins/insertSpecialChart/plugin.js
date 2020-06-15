// 设备名称，数据源名称等值作为变量
import tinymce from 'tinymce/tinymce'
import $ from 'jquery'

(function(domGlobals) {
  'use strict'

  var getFormats = function(editor) {
    return editor.getParam('insert_chart_formats', [
      'mceChartAdaptFault',
      'mceChartLine',
      'mceChartScatter',
      'mceChartHistogram',
      'mceChartPersonalizedThreshold',
      'mceChartMD',
      'mceChartSpectrum',
      'mceChartAxisTrajectory'
    ])
  }

  var getFormatName = function(fmt) {
    var formatname = ''
    var formaticon = ''
    var formattype = ''
    var formatcharttype = ''
    if (fmt === 'mceChartLine') {
      formatname = '折线图'
      formaticon = 'insert-line'
      formattype = 'line'
      formatcharttype = 've-line'
    } else if (fmt === 'mceChartScatter') {
      formatname = '散点图'
      formaticon = 'insert-scatter'
      formattype = 'scatter'
      formatcharttype = 've-scatter'
    } else if (fmt === 'mceChartHistogram') {
      formatname = '柱状图'
      formaticon = 'insert-histogram'
      formattype = 'histogram'
      formatcharttype = 've-histogram'
    } else if (fmt === 'mceChartPersonalizedThreshold') {
      formatname = '个性化阈值图'
      formaticon = 'insert-line'
      formattype = 'personalized_threshold'
      formatcharttype = 've-line'
    } else if (fmt === 'mceChartMD') {
      formatname = '马氏距离图'
      formaticon = 'insert-scatter'
      formattype = 'mahalanobis_distance'
      formatcharttype = 've-scatter'
    } else if (fmt === 'mceChartSpectrum') {
      formatname = '频谱图'
      formaticon = 'insert-histogram'
      formattype = 'spectrum'
      formatcharttype = 'bar'
    } else if (fmt === 'mceChartAxisTrajectory') {
      formatname = '轴心轨迹图'
      formaticon = 'icon-chart-at'
      formattype = 'axis_trajectory'
      formatcharttype = 'scatter'
    } else if (fmt === 'mceChartAdaptFault') {
      formatname = '故障自适应图'
      formaticon = 'icon-chart-adapt'
      formattype = 'adapt_fault'
      formatcharttype = 've-line'
    }
    return { 'name': formatname, 'icon': formaticon, 'type': formattype, 'charttype': formatcharttype }
  }

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools')
  var Cell = function(initial) {
    var value = initial
    var get = function() {
      return value
    }
    var set = function(v) {
      value = v
    }
    var clone = function() {
      return Cell(get())
    }
    return {
      get: get,
      set: set,
      clone: clone
    }
  }

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager')

  var register = function(editor) {
    var formats = getFormats(editor)
    var defaultFormat = Cell(formats[0])
    global$1.map(formats, function(format) {
      editor.addCommand(format, function() {
        var uuid = Math.floor(Math.random() * 1000) // 随机数作为id
        var $img = $('<img>').attr({
          'src': window.location.origin + '/static/images/template/placeholder_' + getFormatName(format).type + '.jpg',
          'title': getFormatName(format).name,
          'alt': getFormatName(format).type,
          'id': uuid,
          'data-model': '-1',
          'data-model-type': 'model',
          'data-param': '[{"time_range":["20"]},{"record_count":["10"]}]',
          'data-parammark': '',
          'data-charttype': getFormatName(format).charttype
        }).css({
          // 'width': '100%'
        }).addClass('echart-graphic')
        // var $figure = $('<figure>').append($img)
        // var $appendcodeAll = $($img)[0].outerHTML
        // editor.execCommand('mceInsertContent', false, $appendcodeAll)

        editor.dom.setAttrib($($img)[0], 'data-mce-id', '__mcenew')
        editor.focus()
        editor.selection.setContent($($img)[0].outerHTML)
        var insertedElm = editor.dom.select('*[data-mce-id="__mcenew"]')[0]
        editor.dom.setAttrib(insertedElm, 'data-mce-id', null)
        editor.selection.select(insertedElm)
        if (getFormatName(format).type === 'adapt_fault') {
          return editor.settings.get_modelitems_callback(editor, 'adapt_chart')
        } else {
          return editor.settings.get_modelitems_callback(editor, 'model_chart')
        }
      })
    })
    editor.ui.registry.addMenuButton('insertSpecialChart', {
      tooltip: 'Echart Infos',
      text: 'Echart',
      icon: 'insert-echart',
      select: function(value) {
        return value === defaultFormat.get()
      },
      fetch: function(done) {
        return done(formats.join(' '))
      },
      onItemAction: function(_, value) {
        // defaultFormat.set(value)
        // console.log('onItemAction', value)
        return editor.execCommand(value)
      }
    })
    var cmd = function(command) {
      return function() {
        return editor.execCommand(command)
      }
    }
    global$1.map(formats, function(format) {
      // console.log('onItemAction', format)
      editor.ui.registry.addMenuItem(format, {
        text: getFormatName(format).name,
        icon: getFormatName(format).icon,
        onAction: cmd(format)
      })
    })
  }
  var Buttons = { register: register }

  function Plugin() {
    global.add('insertSpecialChart', function(editor) {
      Buttons.register(editor)
    })
  }

  Plugin()
}(window))
