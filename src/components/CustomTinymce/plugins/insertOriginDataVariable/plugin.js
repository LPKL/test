// 元数据属性作为变量
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

  var getChildMarkNode = function(elem) {
    return child$1(Element.fromDom(elem), 'mark')
  }

  var isDiv = function(editor, elem) {
    return editor.dom.is(elem, 'div')
  }

  var getEditable = function(editor, elem) {
    var isModelData = function(node) {
      if (node.title === 'origindata_variable_type') {
        return true
      }
      return false
    }
    var isEditable = function(node) {
      return isModelData(node)
    }
    if (isDiv(editor, elem)) {
      var nodeOpt = getChildMarkNode(elem)
      return nodeOpt.map(function(node) {
        return isEditable(node.dom()) ? Option.some(node.dom()) : Option.none()
      })
    }
    return isEditable(elem) ? Option.some(elem) : Option.none()
  }

  var Actions = {
    getEditable: getEditable
  }

  var register = function(editor) {
    editor.addCommand('mceOriginDataVariable', function() {
      // ajax
      // console.log('todo ajax')
      // getOriginDataItems('origin', '元数据', editor)
      editor.settings.get_originitems_callback(editor, 'origin', '元数据')
    })
    editor.ui.registry.addButton('insertOriginDataVariable', {
      tooltip: 'Origindata Params Infos',
      text: 'Origindata Attribute',
      icon: 'insert-data-variable',
      onAction: function() {
        // 获取模型列表
        return editor.execCommand('mceOriginDataVariable')
      }
    })
    editor.ui.registry.addButton('originDataVariableToolbarButton', {
      tooltip: 'Attribute Parameter Infos',
      text: 'Attribute Parameter',
      icon: 'insert-data-variable',
      onAction: function() {
        // 获取模型列表
        return editor.execCommand('mceOriginDataVariable')
      }
    })
  }
  var Buttons = { register: register }

  var register$1 = function(editor) {
    editor.ui.registry.addContextToolbar('insertOriginDataVariable', {
      items: 'originDataVariableToolbarButton',
      predicate: function(elem) {
        return Actions.getEditable(editor, elem).isSome()
      },
      position: 'node',
      scope: 'node'
    })
  }
  var ContextToolbar = { register: register$1 }

  function Plugin() {
    global.add('insertOriginDataVariable', function(editor) {
      Buttons.register(editor)
      ContextToolbar.register(editor)
    })
  }

  Plugin()
}(window))
