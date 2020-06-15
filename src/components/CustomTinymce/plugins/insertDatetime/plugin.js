import tinymce from 'tinymce/tinymce'
// import $ from 'jquery'
(function() {
  'use strict'

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager')

  var getFormats = function(editor) {
    return editor.getParam('insertdatetime_formats', [
      '%Y 年 %m 月 %d 日 %H 时 %M 分 %S 秒',
      '%Y-%m-%d %H:%M:%S',
      '%Y',
      '%Y-%m',
      '%Y-%m-%d',
      '%H:%M:%S',
      '%p %I:%M:%S'
      // '%A',
      // '%B'
    ])
  }

  var daysLong = '星期日 星期一 星期二 星期三 星期四 星期五 星期六'.split(' ')
  var monthsLong = '一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月'.split(' ')
  var addZeros = function(value, len) {
    value = '' + value
    if (value.length < len) {
      for (var i = 0; i < len - value.length; i++) {
        value = '0' + value
      }
    }
    return value
  }
  var getDateTime = function(editor, fmt, date) {
    date = date || new Date()
    fmt = fmt.replace('%D', '%m/%d/%Y')
    fmt = fmt.replace('%r', '%I:%M:%S %p')
    fmt = fmt.replace('%Y', '' + date.getFullYear())
    fmt = fmt.replace('%y', '' + date.getYear())
    fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2))
    fmt = fmt.replace('%d', addZeros(date.getDate(), 2))
    fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2))
    fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2))
    fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2))
    fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1))
    fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? '上午' : '下午'))
    fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]))
    fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]))
    fmt = fmt.replace('%%', '%')
    return fmt
  }
  var insertDateTime = function(editor, format) {
    // var $timedom = $('<time>').attr({ 'data-format': format, 'data-type': 'currentTime', 'contenteditable': false }).css({ 'backgroundColor': '#ffff00' }).text(getDateTime(editor, format))
    // var $appendcodeAll = $($timedom)[0].outerHTML
    // editor.execCommand('mceInsertContent', false, $appendcodeAll)

    if (editor.selection.getNode().innerHTML.indexOf('<br') !== -1) {
      // 解决空格新增后，会在上方产生多余的一行的问题
      editor.selection.getNode().innerHTML = '&nbsp;'
    }
    var table_elem = editor.dom.getParent(editor.selection.getStart(), 'table')
    var append_dataorigin = document.createElement('time')
    append_dataorigin.setAttribute('contenteditable', 'false')
    append_dataorigin.setAttribute('data-type', 'currentTime')
    append_dataorigin.setAttribute('data-format', format)
    append_dataorigin.textContent = getDateTime(editor, format)
    if (table_elem !== null) {
      var append_parent = document.createElement('p')
      append_parent.appendChild(append_dataorigin)
      editor.selection.getNode().appendChild(append_parent)
    } else {
      editor.selection.getNode().appendChild(append_dataorigin)
    }
  }
  var Actions = {
    insertDateTime: insertDateTime,
    getDateTime: getDateTime
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

  var register$1 = function(editor) {
    var formats = getFormats(editor)
    var defaultFormat = Cell(formats[0])
    editor.ui.registry.addSplitButton('insertDatetime', {
      icon: 'insert-time',
      text: 'Current Time',
      tooltip: 'Insert date/time',
      select: function(value) {
        return value === defaultFormat.get()
      },
      fetch: function(done) {
        done(global$1.map(formats, function(format) {
          return {
            type: 'choiceitem',
            text: Actions.getDateTime(editor, format),
            value: format
          }
        }))
      },
      onAction: function() {
        var args = []
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i]
        }
        Actions.insertDateTime(editor, defaultFormat.get())
      },
      onItemAction: function(_, value) {
        defaultFormat.set(value)
        Actions.insertDateTime(editor, value)
      }
    })
  }
  var Buttons = { register: register$1 }

  function Plugin() {
    global.add('insertDatetime', function(editor) {
      Buttons.register(editor)
    })
  }

  Plugin()
}())
