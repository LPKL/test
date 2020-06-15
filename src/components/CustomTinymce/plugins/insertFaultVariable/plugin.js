// 设备名称，数据源名称等值作为变量
import tinymce from 'tinymce/tinymce'

(function(domGlobals) {
  'use strict'

  var getFormats = function(editor) {
    return editor.getParam('insert_fault_variable_formats', [
      'mceDeviceName',
      'mceModelName',
      'mceFaultCode',
      'mceFaultCodeInfo',
      'mceAlertRule',
      'mceHandleInfo',
      'mceFaultState'
    ])
  }

  var getFormatName = function(fmt) {
    var formatname = ''
    var formaticon = ''
    if (fmt === 'mceDeviceName') {
      formatname = '故障设备名称'
      formaticon = 'icon-device'
    } else if (fmt === 'mceModelName') {
      formatname = '故障模型名称'
      formaticon = 'icon-model'
    } else if (fmt === 'mceFaultCode') {
      formatname = '关联故障代码'
      formaticon = 'icon-fault-code'
    } else if (fmt === 'mceFaultCodeInfo') {
      formatname = '关联故障代码详情'
      formaticon = 'icon-fault-code'
    } else if (fmt === 'mceAlertRule') {
      formatname = '告警监控条件'
      formaticon = 'icon-alert-rule'
    } else if (fmt === 'mceHandleInfo') {
      formatname = '故障处理记录'
      formaticon = 'icon-fault-handle'
    } else if (fmt === 'mceFaultState') {
      formatname = '故障处理状态'
      formaticon = 'icon-fault-state'
    }
    return { 'name': formatname, 'icon': formaticon }
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
        if (editor.selection.getNode().innerHTML.indexOf('<br') !== -1) {
          // 解决空格新增后，会在上方产生多余的一行的问题
          editor.selection.getNode().innerHTML = '&nbsp;'
        }
        var table_elem = editor.dom.getParent(editor.selection.getStart(), 'table')
        var append_dataorigin = document.createElement('mark')
        append_dataorigin.setAttribute('contenteditable', 'false')
        append_dataorigin.setAttribute('data-type', format)
        append_dataorigin.title = getFormatName(format).name
        append_dataorigin.textContent = getFormatName(format).name
        if (table_elem !== null) {
          var append_parent = document.createElement('p')
          append_parent.appendChild(append_dataorigin)
          editor.selection.getNode().appendChild(append_parent)
        } else {
          editor.selection.getNode().appendChild(append_dataorigin)
        }
      })
    })
    editor.ui.registry.addMenuButton('insertFaultVariable', {
      tooltip: 'Fault Infos',
      text: 'Fault Info',
      icon: 'insert-fault-variable',
      select: function(value) {
        return value === defaultFormat.get()
      },
      fetch: function(done) {
        return done(formats.join(' '))
      },
      onAction: function() {
        // 点击默认的名称 暂不设置
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
        // icon: getFormatName(format).icon,
        onAction: cmd(format)
      })
    })
  }
  var Buttons = { register: register }

  function Plugin() {
    global.add('insertFaultVariable', function(editor) {
      Buttons.register(editor)
    })
  }

  Plugin()
}(window))
