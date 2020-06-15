// 保存功能
import tinymce from 'tinymce/tinymce'
(function(domGlobals) {
  'use strict'

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

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.Delay')

  var global$3 = tinymce.util.Tools.resolve('tinymce.util.Tools')

  var fireStoreDraft = function(editor) {
    // 保存的实际代码 未创建的模板不会被保存
    return editor.settings.save_editor_callback(editor)
  }

  var parse = function(timeString, defaultTime) {
    var multiples = {
      s: 1000,
      m: 60000
    }
    var toParse = timeString || defaultTime
    var parsedTime = /^(\d+)([ms]?)$/.exec('' + toParse)
    return (parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(toParse, 10)
  }

  var getAutoSaveInterval = function(editor) {
    return parse(editor.settings.autosave_interval, '30s')
  }

  var isEmpty = function(editor, html) {
    var forcedRootBlockName = editor.settings.forced_root_block
    html = global$3.trim(typeof html === 'undefined' ? editor.getBody().innerHTML : html)
    return html === '' || new RegExp('^<' + forcedRootBlockName + '[^>]*>((\xA0|&nbsp;|[ \t]|<br[^>]*>)+?|)</' + forcedRootBlockName + '>|<br>$', 'i').test(html)
  }
  var hasDraft = function(editor) {
    return true
  }

  var storeDraft = function(editor) {
    if (!isEmpty(editor) && editor.isDirty()) {
      // console.log('auto save template')
      fireStoreDraft(editor)
    }
  }

  var startStoreDraft = function(editor, started) {
    var interval = getAutoSaveInterval(editor)
    if (!started.get()) {
      global$1.setInterval(function() {
        if (!editor.removed) {
          storeDraft(editor)
        }
      }, interval)
      started.set(true)
    }
  }

  function curry(fn) {
    var initialArgs = []
    for (var _i = 1; _i < arguments.length; _i++) {
      initialArgs[_i - 1] = arguments[_i]
    }
    return function() {
      var restArgs = []
      for (var _i = 0; _i < arguments.length; _i++) {
        restArgs[_i] = arguments[_i]
      }
      var all = initialArgs.concat(restArgs)
      return fn.apply(null, all)
    }
  }

  var get = function(editor) {
    return {
      hasDraft: curry(hasDraft, editor),
      storeDraft: curry(storeDraft, editor),
      isEmpty: curry(isEmpty, editor)
    }
  }

  var makeSetupHandler = function(editor, started) {
    return function(api) {
      api.setDisabled(!hasDraft(editor))
      var editorEventCallback = function() {
        return api.setDisabled(!hasDraft(editor))
      }
      editor.on('StoreDraft', editorEventCallback)
      return function() {
        return editor.off('StoreDraft', editorEventCallback)
      }
    }
  }
  var register = function(editor, started) {
    startStoreDraft(editor, started) // 固定时间间隔，自动保存
    editor.ui.registry.addButton('saveEditor', {
      tooltip: 'Save Infos',
      text: 'Save',
      icon: 'save-editor',
      onAction: function() {
        storeDraft(editor)
      },
      onSetup: makeSetupHandler(editor)
    })
  }

  function Plugin() {
    global.add('saveEditor', function(editor) {
      var started = Cell(false)
      register(editor, started)
      editor.ui.registry.addIcon(
        'save-editor',
        '<svg t="1568859989731" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3321" width="20" height="20"><path d="M720.92 754.51c-17.11 0-30.97-13.87-30.97-30.97s13.87-30.97 30.97-30.97c97.47 0 176.77-63.77 176.77-142.15 0-65.62-55.51-122.35-135-137.95-14.84-2.91-25.41-16.12-24.99-31.24 0.04-1.62 0.16-2.97 0.24-3.95 0.01-0.14 0.02-0.27 0.04-0.41-0.29-100.79-101.55-182.72-225.98-182.72-124.43 0-225.69 81.93-225.97 182.72l0.03 0.4c0.08 0.99 0.2 2.33 0.24 3.97 0.4 15.11-10.16 28.31-25 31.22-79.49 15.6-135 72.33-135 137.95 0 78.38 79.3 142.15 176.77 142.15 17.11 0 30.97 13.87 30.97 30.97s-13.87 30.97-30.97 30.97c-62.72 0-121.93-20.56-166.72-57.88-22.33-18.61-39.93-40.41-52.31-64.8-13.06-25.73-19.68-53.12-19.68-81.4 0-47.28 19.28-93.32 54.3-129.63 27.92-28.95 65.03-50.88 106.32-63.11 2.48-26.88 10.06-52.95 22.65-77.74 14.86-29.27 36.01-55.46 62.86-77.84 54.08-45.07 125.65-69.9 201.51-69.9s147.43 24.82 201.52 69.89c26.85 22.38 48 48.56 62.86 77.84 12.58 24.79 20.17 50.86 22.65 77.74 41.28 12.23 78.4 34.15 106.32 63.11 35.01 36.31 54.3 82.35 54.3 129.63 0 28.29-6.62 55.68-19.68 81.4-12.38 24.39-29.98 46.19-52.31 64.8-44.81 37.34-104.02 57.9-166.74 57.9z" fill="#2c2c2c" p-id="3322"></path><path d="M512 891.8c-17.11 0-30.97-13.87-30.97-30.97V474.69c0-17.1 13.87-30.97 30.97-30.97s30.97 13.87 30.97 30.97v386.13c0 17.11-13.86 30.98-30.97 30.98z" fill="#2c2c2c" p-id="3323"></path><path d="M540.56 354.02l118 153.85c12.69 16.55-3.17 37.24-28.56 37.24H394c-25.39 0-41.26-20.69-28.56-37.24l118-153.85c12.69-16.56 44.43-16.56 57.12 0z" fill="#2c2c2c" p-id="3324"></path></svg>'
      )
      return get(editor)
    })
  }

  Plugin()
}(window))
