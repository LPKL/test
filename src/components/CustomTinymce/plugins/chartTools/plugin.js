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

  var constant = function(value) {
    return function() {
      return value
    }
  }
  var never = constant(false)
  var always = constant(true)

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

  var getToolbarBaseItems = function(editor) {
    return editor.getParam('charttools_toolbar', 'chartModelButton')
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

  var fromHtml = function(html, scope) {
    var doc = scope || domGlobals.document
    var div = doc.createElement('div')
    div.innerHTML = html
    if (!div.hasChildNodes() || div.childNodes.length > 1) {
      domGlobals.console.error('HTML does not have a single root node', html)
      throw new Error('HTML must have a single root node')
    }
    return fromDom(div.childNodes[0])
  }
  var fromTag = function(tag, scope) {
    var doc = scope || domGlobals.document
    var node = doc.createElement(tag)
    return fromDom(node)
  }
  var fromText = function(text, scope) {
    var doc = scope || domGlobals.document
    var node = doc.createTextNode(text)
    return fromDom(node)
  }
  var fromDom = function(node) {
    if (node === null || node === undefined) {
      throw new Error('Node cannot be null or undefined')
    }
    return { dom: constant(node) }
  }
  var fromPoint = function(docElm, x, y) {
    var doc = docElm.dom()
    return Option.from(doc.elementFromPoint(x, y)).map(fromDom)
  }
  var Element = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  }

  var ELEMENT = domGlobals.Node.ELEMENT_NODE

  var ELEMENT$1 = ELEMENT
  var is = function(element, selector) {
    var dom = element.dom()
    if (dom.nodeType !== ELEMENT$1) {
      return false
    } else {
      var elem = dom
      if (elem.matches !== undefined) {
        return elem.matches(selector)
      } else if (elem.msMatchesSelector !== undefined) {
        return elem.msMatchesSelector(selector)
      } else if (elem.webkitMatchesSelector !== undefined) {
        return elem.webkitMatchesSelector(selector)
      } else if (elem.mozMatchesSelector !== undefined) {
        return elem.mozMatchesSelector(selector)
      } else {
        throw new Error('Browser lacks native selectors')
      }
    }
  }

  var child = function(scope, predicate) {
    var pred = function(node) {
      return predicate(Element.fromDom(node))
    }
    var result = find(scope.dom().childNodes, pred)
    return result.map(Element.fromDom)
  }

  var child$1 = function(scope, selector) {
    return child(scope, function(e) {
      return is(e, selector)
    })
  }

  // var getFigureInput = function(elem) {
  //   return child$1(Element.fromDom(elem), 'input')
  // }

  var getFigureImg = function(elem) {
    return child$1(Element.fromDom(elem), 'img')
  }
  var isFigure = function(editor, elem) {
    return editor.dom.is(elem, 'figure')
  }

  var getEditableChart = function(editor, elem) {
    var isChartImage = function(imgNode) {
      // TODO: 判断是插入的echart图形
      if (imgNode.className === 'echart-graphic') {
        return true
      }
      return false
    }
    var isEditable = function(imgNode) {
      return isChartImage(imgNode)
    }
    if (isFigure(editor, elem)) {
      var imgOpt = getFigureImg(elem)
      return imgOpt.map(function(img) {
        return isEditable(img.dom()) ? Option.some(img.dom()) : Option.none()
      })
    }
    return isEditable(elem) ? Option.some(elem) : Option.none()
  }

  var Actions = {
    getEditableChart: getEditableChart
  }

  var register = function(editor) {
    editor.addCommand('mceModelConfig', function() {
      var chartElm = editor.dom.getParent(editor.selection.getStart(), 'img')
      if (chartElm.alt === 'adapt_fault') {
        return editor.settings.get_modelitems_callback(editor, 'adapt_chart')
      } else {
        if (chartElm.getAttribute('data-model') !== '-1') {
          return editor.settings.get_modelitems_callback(editor, 'model_chart', chartElm.getAttribute('data-model'), chartElm.getAttribute('data-model-type'), 'columns_list_json')
        } else {
          return editor.settings.get_modelitems_callback(editor, 'model_chart')
        }
      }
    })
    editor.ui.registry.addButton('chartModelButton', {
      tooltip: '图形设置',
      icon: 'chart-model',
      onAction: function() {
        // 获取模型列表
        return editor.execCommand('mceModelConfig')
      }
    })
  }
  var Buttons = { register: register }

  var register$1 = function(editor) {
    editor.ui.registry.addContextToolbar('chartTools', {
      items: getToolbarBaseItems(editor),
      predicate: function(elem) {
        return Actions.getEditableChart(editor, elem).isSome()
      },
      position: 'node',
      scope: 'node'
    })
  }
  var ContextToolbar = { register: register$1 }

  function Plugin() {
    global.add('chartTools', function(editor) {
      editor.on('init', function() {
        editor.ui.registry.addIcon(
          'chart-model',
          '<svg t="1566435361846" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12628" width="20" height="20"><path d="M977.728 292.736a30.272 30.272 0 0 0-3.264-10.432L864.128 39.36a31.36 31.36 0 0 0-1.152-2.752L862.72 36.096 862.08 35.2a30.272 30.272 0 0 0-26.496-16H190.272a29.952 29.952 0 0 0-18.112 6.528c-0.896 0.576-1.792 1.024-2.56 1.728-1.024 0.96-1.792 2.112-2.688 3.2-1.6 1.728-3.392 3.2-4.608 5.376L50.624 282.24c-1.344 2.432-1.728 4.992-2.368 7.552a29.824 29.824 0 0 0-4.672 15.232V974.08c0 16.896 13.76 30.656 30.72 30.656H949.76a30.72 30.72 0 0 0 30.656-30.72V305.152a30.336 30.336 0 0 0-2.688-12.352zM209.6 80.64h605.824l89.152 193.856H120.512l89.152-193.92zM104.96 335.744H919.04v607.68H104.96V335.808z" fill="" p-id="12629"></path><path d="M843.776 452.416a32 32 0 0 0-45.056-4.48L576.576 630.144l-105.088-97.92c-1.92-1.728-4.096-2.56-6.208-3.776-0.768-0.448-1.472-1.024-2.24-1.408a31.104 31.104 0 0 0-7.744-2.304c-1.664-0.32-3.2-0.64-4.864-0.768-1.856 0-3.584 0.256-5.44 0.512a30.72 30.72 0 0 0-7.36 1.728c-0.96 0.384-1.856 0.96-2.752 1.408-2.112 1.088-4.288 1.728-6.144 3.264l-243.456 199.68a32 32 0 1 0 40.576 49.536L448 597.888l105.088 97.92c1.92 1.728 4.16 2.56 6.272 3.84 0.704 0.384 1.344 0.896 2.112 1.28 2.56 1.216 5.12 1.856 7.808 2.368 1.664 0.32 3.2 0.64 4.864 0.768 1.792 0 3.52-0.256 5.312-0.512a30.72 30.72 0 0 0 7.552-1.728c0.896-0.384 1.664-0.96 2.56-1.408 2.112-1.024 4.352-1.728 6.272-3.328l243.456-199.68a32 32 0 0 0 4.48-45.056z" fill="" p-id="12630"></path></svg>'
        )
      })
      Buttons.register(editor)
      ContextToolbar.register(editor)
    })
  }

  Plugin()
}(window))
