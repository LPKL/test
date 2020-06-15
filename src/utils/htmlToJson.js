/**
  html 与 json 转换
  contentToJson()函数是进行html转json的入口函数
  根据DOM进行分析，逐行转换
  inlineToJson()是转换自定义json的具体代码
  自定义json基本格式如下：
  {"content":
    {"blocks":[
      {"type":"P","text":"kll"},
      {"type":"P","children":[
        {"type":"chart",
        "attributes":{...各个plugin插入时定义的属性}}
      ]}]
    }
  }
**/
import $ from 'jquery'

function inlineToJson(markup) {
  var obj = {}
  if (markup.nodeType === 3 && markup.nodeValue === '\n') {
    return obj
  }
  obj['type'] = markup.nodeName
  if (markup.nodeName === '#text') {
    obj['type'] = 'span'
  }

  if (markup.nodeType === 1) { // element
    // attributes: style ,data-xxx
    if (markup.attributes.length > 0) {
      obj['attributes'] = {}
      obj['attributes']['style'] = ''
      for (var j = 0; j < markup.attributes.length; j++) {
        var attribute = markup.attributes.item(j)
        if (markup.nodeName === 'IMG' && attribute.nodeName === 'class') {
          if (attribute.nodeValue === 'echart-graphic') {
            // chart
            obj['type'] = 'chart'
          }
        }
        // 特殊表格，采用el-table显示
        if (markup.nodeName === 'TABLE' && attribute.nodeName === 'data-tabletype') {
          if (markup.dataset.model === '') {
            obj['type'] = 'TABLE'
          } else {
            obj['type'] = 'fixedcolumn_table'
          }
        }
        if (attribute.nodeName === 'data-param') {
          obj['attributes']['data-param'] = []
          if (attribute.nodeValue) {
            var param_attribute = JSON.parse(attribute.nodeValue)
            if (typeof param_attribute !== 'object') {
              obj['attributes']['data-param'].push(param_attribute)
            } else {
              $.each(param_attribute, function(key, each_param) {
                if (each_param) {
                // var param_x = ['time']
                  var param_x
                  if (each_param['x']) {
                    param_x = each_param['x']
                    obj['attributes']['data-param'] = obj['attributes']['data-param'].concat(param_x)
                  } else if (each_param['y']) {
                    obj['attributes']['data-param'] = obj['attributes']['data-param'].concat(each_param['y'])
                  } else {
                    obj['attributes']['data-param'] = obj['attributes']['data-param'].concat(each_param)
                  }
                }
              })
            }
          }
        } else if (attribute.nodeName === 'data-device' || attribute.nodeName === 'data-tablehead' || attribute.nodeName === 'data-param-obj') {
          if (attribute.nodeValue) {
            obj['attributes'][attribute.nodeName] = JSON.parse(attribute.nodeValue)
          }
        } else {
          obj['attributes'][attribute.nodeName] = attribute.nodeValue
        }
      }
    }
  } else if (markup.nodeType === 3) { // text
    obj['text'] = markup.nodeValue
  }

  // do children
  if (markup.hasChildNodes() && markup.childNodes.length === 1 && markup.childNodes[0].nodeType === 3 && !obj['attributes']) {
    // If just one text node inside
    obj['text'] = markup.childNodes[0].nodeValue
  } else if (markup.hasChildNodes()) {
    // 嵌套了inline标签
    for (var i = 0; i < markup.childNodes.length; i++) {
      var item = markup.childNodes.item(i)
      var newParamJson = inlineToJson(item)
      if (typeof (obj['children']) === 'undefined') {
        if (!$.isEmptyObject(newParamJson)) {
          obj['children'] = [newParamJson]
        }
      } else {
        if (typeof (obj['children'].push) === 'undefined') {
          var old = obj['children']
          obj['children'] = []
          obj['children'].push(old)
        }
        if (!$.isEmptyObject(newParamJson)) {
          obj['children'].push(newParamJson)
        }
      }
    }
  }
  return obj
}

function commonBlocktoJson(obj) {
  var ret = []

  var $el = obj
  ret.push(inlineToJson($el[0]))
  return ret
}
export function contentToJson(content) {
  var $cd = $('<div/>').html(content)
  var $els = $cd.children() // els 为 block标签
  if ($els.length === 0 && $.trim(content) !== '') {
    $els = $cd.children()
  }
  var ret = []
  var contentJSON = {}
  for (var i = 0, contentLen = $els.length; i < contentLen; i++) {
    var $el = $($els[i])
    ret = ret.concat(commonBlocktoJson($el))
  }
  if (ret.length !== 0) {
    contentJSON = { 'content': { 'blocks': ret }}
  }
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(JSON.stringify(contentJSON))
    }, 1000)
  })
}

