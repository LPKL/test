// 选择已有报告模板，直接复制粘贴内容
/* eslint-disable */
import tinymce from 'tinymce/tinymce'
(function() {
  'use strict'

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager')

  var constant = function(value) {
    return function() {
      return value
    }
  }
  
  var never = constant(false)
  var always = constant(true)

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools')

  var global$2 = tinymce.util.Tools.resolve('tinymce.util.XHR')

  var insertTemplate = function(editor, ui, html) {
    var el
    // var n
    var dom = editor.dom
    html = replaceTemplateValues(html)
    el = dom.create('div', null, html)
    // n = dom.select('.mceTmpl', el)
    // if (n && n.length > 0) {
    //   el = dom.create('div', null)
    //   el.appendChild(n[0].cloneNode(true))
    // }
    editor.execCommand('mceInsertContent', false, el.innerHTML)
  }
  var Templates = {
    insertTemplate: insertTemplate
  }

  var never$1 = never
  var always$1 = always
  var none = function() {
    return NONE
  }
  var NONE = (function() {
    var eq = function(o) {
      return o.isNone()
    }
    var call = function(thunk) {
      return thunk()
    }
    var id = function(n) {
      return n
    }
    var noop = function() {
    }
    var nul = function() {
      return null
    }
    var undef = function() {
      return undefined
    }
    var me = {
      fold: function(n, s) {
        return n()
      },
      is: never$1,
      isSome: never$1,
      isNone: always$1,
      getOr: id,
      getOrThunk: call,
      getOrDie: function(msg) {
        throw new Error(msg || 'error: getOrDie called on none.')
      },
      getOrNull: nul,
      getOrUndefined: undef,
      or: id,
      orThunk: call,
      map: none,
      ap: none,
      each: noop,
      bind: none,
      flatten: none,
      exists: never$1,
      forall: always$1,
      filter: none,
      equals: eq,
      equals_: eq,
      toArray: function() {
        return []
      },
      toString: constant('none()')
    }
    if (Object.freeze) {
      Object.freeze(me)
    }
    return me
  }())
  var some = function(a) {
    var constant_a = function() {
      return a
    }
    var self = function() {
      return me
    }
    var map = function(f) {
      return some(f(a))
    }
    var bind = function(f) {
      return f(a)
    }
    var me = {
      fold: function(n, s) {
        return s(a)
      },
      is: function(v) {
        return a === v
      },
      isSome: always$1,
      isNone: never$1,
      getOr: constant_a,
      getOrThunk: constant_a,
      getOrDie: constant_a,
      getOrNull: constant_a,
      getOrUndefined: constant_a,
      or: self,
      orThunk: self,
      map: map,
      ap: function(optfab) {
        return optfab.fold(none, function(fab) {
          return some(fab(a))
        })
      },
      each: function(f) {
        f(a)
      },
      bind: bind,
      flatten: constant_a,
      exists: bind,
      forall: bind,
      filter: function(f) {
        return f(a) ? me : NONE
      },
      equals: function(o) {
        return o.is(a)
      },
      equals_: function(o, elementEq) {
        return o.fold(never$1, function(b) {
          return elementEq(a, b)
        })
      },
      toArray: function() {
        return [a]
      },
      toString: function() {
        return 'some(' + a + ')'
      }
    }
    return me
  }
  var from = function(value) {
    return value === null || value === undefined ? NONE : some(value)
  }
  var Option = {
    some: some,
    none: none,
    from: from
  }

  var map = function(xs, f) {
    var len = xs.length
    var r = new Array(len)
    for (var i = 0; i < len; i++) {
      var x = xs[i]
      r[i] = f(x, i, xs)
    }
    return r
  }
  var find = function(xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i]
      if (pred(x, i, xs)) {
        return Option.some(x)
      }
    }
    return Option.none()
  }

  var global$3 = tinymce.util.Tools.resolve('tinymce.util.Promise')

  var hasOwnProperty = Object.hasOwnProperty
  var get = function(obj, key) {
    return has(obj, key) ? Option.from(obj[key]) : Option.none()
  }
  var has = function(obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  var open = function(editor) {
    var onSubmit = function() {
      return function(api) {
        var data = api.getData()
        // console.log('onsubmit1', api.getData().modifiabletextfaultresult)
        var $predom = $('<pre>').attr({ 'data-type': 'modifiable-text-fault-analysis', 'contenteditable': true }).css({ 'backgroundColor': '#f6d6d6' }).text(api.getData().modifiabletextfaultresult)
        var $appendcodeAll = $($predom)[0].outerHTML
        editor.execCommand('mceInsertContent', false, $appendcodeAll)
        api.close()
      }
    }
    var buildDialogSpec = function() {
      var bodyItems = [
        {
          type: 'input',
          // html: '<p aria-live="polite">' + htmlEscape('template.value.description') + '</p>'
          name: 'modifiabletextfaultresult'
        }
      ]
      return {
        title: 'Insert Modifiable',
        size: 'normal',
        body: {
          type: 'panel',
          items: bodyItems
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            primary: true
          }
        ],
        initialData: {
          modifiabletextfaultresult: '故障分析:',
        },
        onSubmit: onSubmit(),
      }
    }
    var dialogApi = editor.windowManager.open(buildDialogSpec())
  }
  var Dialog = { open: open }

  var showDialog = function(editor) {
    Dialog.open(editor)
  }
  var register$1 = function(editor) {
    editor.ui.registry.addButton('insertModifiableTextFaultAnalysis', {
      icon: 'editable-text',
      text: 'Fault Diagnosis',
      tooltip: 'Insert modifiable text',
      onAction: function() {
        // 获取模型列表
        return showDialog(editor)
      }
    })
  }
  var Buttons = { register: register$1 }

  function Plugin() {
    global.add('insertModifiableTextFaultAnalysis', function(editor) {
      Buttons.register(editor)
    })
  }

  Plugin()
}())
