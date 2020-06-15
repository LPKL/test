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
  var never = constant(false)
  var always = constant(true)

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools')

  var global$2 = tinymce.util.Tools.resolve('tinymce.util.XHR')

  var getTemplates = function(editorSettings) {
    return editorSettings.templates
  }

  var Settings = {
    getTemplates: getTemplates
  }

  var createTemplateList = function(editorSettings, callback) {
    return function() {
      var templateList = Settings.getTemplates(editorSettings)
      if (typeof templateList === 'function') {
        templateList(callback)
        return
      }
      if (typeof templateList === 'string') {
        global$2.send({
          url: templateList,
          success: function(text) {
            callback(JSON.parse(text))
          }
        })
      } else {
        callback(templateList)
      }
    }
  }
  var replaceTemplateValues = function(html) {
    // console.log('replaceTemplateValues', html)
    return html
  }

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
    // editor.addVisual()
  }
  var Templates = {
    createTemplateList: createTemplateList,
    replaceTemplateValues: replaceTemplateValues,
    insertTemplate: insertTemplate
  }

  var register = function(editor) {
    editor.addCommand('mceInsertTemplate', curry(Templates.insertTemplate, editor))
  }
  var Commands = { register: register }

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

  var entitiesAttr = {
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '\'': '&#039;'
  }
  var htmlEscape = function(html) {
    return html.replace(/["'<>&]/g, function(match) {
      return get(entitiesAttr, match).getOr(match)
    })
  }

  var getPreviewContent = function(editor, html) {
    if (html.indexOf('<html>') === -1) {
      var contentCssLinks_1 = ''
      global$1.each(editor.contentCSS, function(url) {
        contentCssLinks_1 += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">'
      })
      var bodyClass = editor.settings.body_class || ''
      if (bodyClass.indexOf('=') !== -1) {
        bodyClass = editor.getParam('body_class', '', 'hash')
        bodyClass = bodyClass[editor.id] || ''
      }
      var encode = editor.dom.encode
      var directionality = editor.getBody().dir
      var dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : ''
      html = '<!DOCTYPE html>' + '<html>' + '<head>' + contentCssLinks_1 + '</head>' + '<body class="' + encode(bodyClass) + '"' + dirAttr + '>' + html + '</body>' + '</html>'
    }
    return Templates.replaceTemplateValues(html)
  }
  var open = function(editor, templateList) {
    var createTemplates = function() {
      if (!templateList || templateList.length === 0) {
        var message = editor.translate('No Template')
        editor.notificationManager.open({
          text: message,
          type: 'info'
        })
        return Option.none()
      }
      return Option.from(global$1.map(templateList, function(template, index) {
        return {
          selected: index === 0,
          text: template.title,
          value: {
            url: template.url,
            content: template.content,
            description: template.description
          }
        }
      }))
    }
    var createSelectBoxItems = function(templates) {
      return map(templates, function(v) {
        return {
          text: v.text,
          value: v.text
        }
      })
    }
    var findTemplate = function(templates, templateTitle) {
      return find(templates, function(t) {
        return t.text === templateTitle
      })
    }
    var getTemplateContent = function(t) {
      return new global$3(function(resolve) {
        resolve(t.value.content)
      })
    }
    var onChange = function(templates, updateDialog) {
      return function(api, change) {
        if (change.name === 'template') {
          var newTemplateTitle = api.getData().template
          findTemplate(templates, newTemplateTitle).each(function(t) {
            api.block('Loading...')
            getTemplateContent(t).then(function(previewHtml) {
              updateDialog(api, t, previewHtml)
              api.unblock()
            })
          })
        }
      }
    }
    var onSubmit = function(templates) {
      return function(api) {
        var data = api.getData()
        findTemplate(templates, data.template).each(function(t) {
          getTemplateContent(t).then(function(previewHtml) {
            // console.log('eeee', previewHtml)
            Templates.insertTemplate(editor, false, previewHtml)
            api.close()
          })
        })
      }
    }
    var openDialog = function(templates) {
      var selectBoxItems = createSelectBoxItems(templates)
      var buildDialogSpec = function(bodyItems, initialData) {
        return {
          title: 'Insert Template',
          size: 'large',
          body: {
            type: 'panel',
            items: bodyItems
          },
          initialData: initialData,
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
          onSubmit: onSubmit(templates),
          onChange: onChange(templates, updateDialog)
        }
      }
      var updateDialog = function(dialogApi, template, previewHtml) {
        var content = getPreviewContent(editor, previewHtml)
        var bodyItems = [
          {
            type: 'selectbox',
            name: 'template',
            label: 'Templates',
            items: selectBoxItems
          },
          // {
          //   type: 'htmlpanel',
          //   html: '<p aria-live="polite">' + htmlEscape(template.value.description) + '</p>'
          // },
          {
            label: 'Preview',
            type: 'iframe',
            name: 'preview',
            sandboxed: false
          }
        ]
        var initialData = {
          template: template.text,
          preview: content
        }
        dialogApi.unblock()
        dialogApi.redial(buildDialogSpec(bodyItems, initialData))
        dialogApi.focus('template')
      }
      var dialogApi = editor.windowManager.open(buildDialogSpec([], {
        template: '',
        preview: ''
      }))
      dialogApi.block('Loading...')
      getTemplateContent(templates[0]).then(function(previewHtml) {
        updateDialog(dialogApi, templates[0], previewHtml)
      })
    }
    var optTemplates = createTemplates()
    optTemplates.each(openDialog)
  }
  var Dialog = { open: open }

  var showDialog = function(editor) {
    return function(templates) {
      Dialog.open(editor, templates)
    }
  }
  var register$1 = function(editor) {
    editor.ui.registry.addButton('insertTemplate', {
      icon: 'insert-template',
      text: 'Template Reuse',
      tooltip: 'Template Reuse Infos',
      onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
    })
  }
  var Buttons = { register: register$1 }

  function Plugin() {
    global.add('insertTemplate', function(editor) {
      Buttons.register(editor)
      Commands.register(editor)
      // FilterContent.setup(editor)
    })
  }

  Plugin()
}())
