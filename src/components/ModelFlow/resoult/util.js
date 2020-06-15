import $ from 'jquery'
import { ScollPostion } from '@/utils/index'

var jQuery = $
// 工具模块
var util = { browserScrollWidth: null }

function IEVersion() {
  var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 // 判断是否IE<11浏览器
  var isEdge = userAgent.indexOf('Edge') > -1 && !isIE // 判断是否IE的Edge浏览器
  var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
  if (isIE) {
    var reIE = new RegExp('MSIE (\\d+\\.\\d+);')
    reIE.test(userAgent)
    var fIEVersion = parseFloat(RegExp['$1'])
    if (fIEVersion === 7) {
      return 7
    } else if (fIEVersion === 8) {
      return 8
    } else if (fIEVersion === 9) {
      return 9
    } else if (fIEVersion === 10) {
      return 10
    } else {
      return 6// IE版本<=7
    }
  } else if (isEdge) {
    return 'edge'// edge
  } else if (isIE11) {
    return 11 // IE11
  } else {
    return -1// 不是ie浏览器
  }
}

util.isIE = IEVersion() !== -1

// 计算当前浏览器滚动条宽度
util.scrollWidth = function() {
  if (this.browserScrollWidth) {
    return this.browserScrollWidth
  }
  var odiv = document.createElement('div') // 创建一个div
  var styles = {
    width: '100px',
    height: '100px',
    overflowY: 'scroll'// 让他有滚动条
  }
  var i
  var scrollbarWidth
  for (i in styles) odiv.style[i] = styles[i]
  document.body.appendChild(odiv)// 把div添加到body中
  scrollbarWidth = odiv.offsetWidth - odiv.clientWidth// 相减
  document.body.removeChild(odiv)// 移除创建的div
  return scrollbarWidth// 返回滚动条宽度
}
util.hideFollowDialog = function() {
  clearTimeout(tm)
  tm = setTimeout(function() {
    follow_d.close()
  }, 200)
}

// 获取元素位置（js原生方法）
util.getPos = function(obj) {
  const sp = ScollPostion()
  if (obj instanceof jQuery) {
    obj = obj[0]
  }
  var ret = {}
  ret.position = function() {
    return { left: obj.offsetLeft, top: obj.offsetTop-sp.top }
  }

  ret.offset = function() {
    var pos = {}
    pos.left = obj.offsetLeft
    pos.top = obj.offsetTop-sp.top
    while (obj === obj.offsetParent) {
      pos.left += obj.offsetLeft
      pos.top += obj.offsetTop-sp.top
    }
    return pos
  }
  return ret
}


util.elementPos=function(elem){
  /**
   * 获取滚动条信息
   * @returns {{top: number, left: number}}
   */
  function getScroll(){
    return {
      top:document.documentElement.scrollTop || document.body.scrollTop,
      left:document.documentElement.scrollLeft || document.body.scrollLeft
    }
  }
  /***
   * 获取id的位置信息
   * @param divObj id
   * @returns {{width: number, height: number, left: *, top: Window}}
   */
  function divCoordinate(domObj){

    return {
      'width':domObj.offsetWidth,
      'height':domObj.offsetHeight,
      'left':domObj.offsetLeft,
      'top':domObj.offsetTop,
      'bottom':domObj.offsetTop + domObj.offsetHeight,
      'right':domObj.offsetLeft + domObj.offsetWidth,
      'scrollLeft':getScroll().left,
      'scrollTop':getScroll().top
    };
  }
  return divCoordinate(elem)
}

export default util
