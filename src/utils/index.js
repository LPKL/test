/**
 * Created by jiachenpan on 16/11/18.
 */
import _ from 'lodash'
import baseUrl from '@/utils/baseUrl'
/**
 * 清空对象所有属性
 * @param temp
 */
export function resetTemp(temp) {
  for (const prop in temp) {
    temp[prop] = null
  }
  return temp
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

// 格式化时间
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * 转化时间的方法
 * 不再使用，约定格式通常通过控件参数来指定格式，如yyyy-d，不易随环境等其他因素改变出错
 */
export function changTimeType(str) {
  const reg = /(\d+)/g
  const arr = str.toString().match(reg).slice(2, 5)
  let str1 = ''
  arr.forEach((item) => {
    str1 += ':' + item
  })
  const ymd = str.getFullYear() + '-' + str.getMonth() + '-' + str.getDate()
  const arr1 = str1.split('')
  arr1.shift()
  str1 = arr1.join('')
  const str3 = ymd + ' ' + str1
  return str3
}

// 时间戳转基本时间格式显示 -> 2001-01-01 12:00：00
export function timestampToBasicFormatTime(timestamp) {
  var d = new Date(timestamp * 1000) // 根据时间戳生成的时间对象
  var date = (d.getFullYear()) + '-' +
    (d.getMonth() + 1) + '-' +
    (d.getDate()) + ' ' +
    addZeros(d.getHours(), 2) + ':' +
    addZeros(d.getMinutes(), 2) + ':' +
    addZeros(d.getSeconds(), 2)
  return date
}
// 时间转时间戳
export function timeToTimestamp(date) {
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
  var time = date.getTime()
  var unixTime = time / 1000
  return unixTime
}

/**
  自定义日期时间显示的格式
  fmt:格式 eg: %m/%d -> 06/26
  date:可选参数，要转换显示的时间，若不定义，默认为当前时间
 */
export function showDateTimeByCustomFormat(fmt, date) {
  var daysLong = '星期日 星期一 星期二 星期三 星期四 星期五 星期六'.split(' ')
  var monthsLong = '一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月'.split(' ')
  // date = date || new Date()
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
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
  fmt = fmt.replace('%B', '' + monthsLong[date.getMonth()])
  fmt = fmt.replace('%A', '' + daysLong[date.getDay()])
  fmt = fmt.replace('%%', '%')
  return fmt
}
/* 时间转为时间范围: ('second', '-', 30, 2001-01-01 12:00:00) -> 2001-01-01 11:30:00
  参数说明
  date: 时间，若无为当前时间
  datetype: 时间作用在小时、分钟等
  optype: 加/减
  optime：加减时间值 */
export function timeToTimeRange(datetype, optype, optime, date) {
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
  var c_time = ''
  if (datetype === 'hour') {
    c_time = date.getHours()
    if (optype === '+') {
      date.setHours(c_time + optime)
    } else {
      date.setHours(c_time - optime)
    }
  } else if (datetype === 'minute') {
    c_time = date.getMinutes()
    if (optype === '+') {
      date.setMinutes(c_time + optime)
    } else {
      date.setMinutes(c_time - optime)
    }
  } else if (datetype === 'second') {
    c_time = date.getSeconds()
    if (optype === '+') {
      date.setSeconds(c_time + optime)
    } else {
      date.setSeconds(c_time - optime)
    }
  } else if (datetype === 'year') {
    c_time = date.getYear()
    if (optype === '+') {
      date.setYear(c_time + optime)
    } else {
      date.setYear(c_time - optime)
    }
  } else if (datetype === 'month') {
    c_time = date.getMonth()
    if (optype === '+') {
      date.setMonth(c_time + optime)
    } else {
      date.setMonth(c_time - optime)
    }
  } else if (datetype === 'day') {
    c_time = date.getDay()
    if (optype === '+') {
      date.setDay(c_time + optime)
    } else {
      date.setDay(c_time - optime)
    }
  }
  var formatdate = showDateTimeByCustomFormat('%Y-%m-%d %H:%M:%S', date)
  return formatdate
}

// 字符串前加0占位：5->05
export function addZeros(value, len) {
  value = '' + value
  if (value.length < len) {
    for (var i = 0; i < len - value.length; i++) {
      value = '0' + value
    }
  }
  return value
}
/**
 *get getByteLen
 * @param {Sting} val input value
 * @returns {number} output value
 */
export function getByteLen(val) {
  let len = 0
  for (let i = 0; i < val.length; i++) {
    if (val[i].match(/[^\x00-\xff]/gi) != null) {
      len += 1
    } else {
      len += 0.5
    }
  }
  return Math.floor(len)
}

export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"') +
    '"}'
  )
}

export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function objectMerge(target, source) {
  /* Merges two  objects,
     giving the last one precedence */

  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

export function scrollTo(element, to, duration) {
  if (duration <= 0) return
  const difference = to - element.scrollTop
  const perTick = (difference / duration) * 10
  setTimeout(() => {
    element.scrollTop = element.scrollTop + perTick
    if (element.scrollTop === to) return
    scrollTo(element, to, duration - 10)
  }, 10)
}

export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

export const pickerOptions = [
  {
    text: '今天',
    onClick(picker) {
      const end = new Date()
      const start = new Date(new Date().toDateString())
      end.setTime(start.getTime())
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近一周',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }
]

export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

// 二维数组转置
export function transposeArr(arr) {
  if (Array.isArray(arr)) {
    return _.zip.apply(_, arr)
  } else {
    new Error('param is not array')
  }
}

/**
 * 从对象数组中过滤所有key 值
 * 返回数组
 * @param arr
 * @param key
 */
export function filterArrayName(arr, key) {
  const type = toString.call(arr)
  if (type === '[object Array]') {
    const temp = arr.map(item => {
      return { name: item[key] }
    })
    return temp
  }
}
/**
 * dataset的兼容问题,设置值
 *  */
export function setData(element, attrName, attrValue) {
  if (element.dataset) {
    element.dataset[attrName] = attrValue
  } else {
    element.setAttribute('data-' + attrName, attrValue)
  }
}
/**
 * dataset的兼容问题,获取值
 *  */
export function getDataset(element) {
  const obj = {}
  if (!element) {
    return false
  }
  if (element.dataset) {
    return element.dataset
  } else {
    for (let i = 0; i < element.attributes.length; i++) {
      const key = element.attributes[i].nodeName
      if (/^data-\w+$/.test(key)) { // 判断是否以data-开头的属性名
        const value = element.attributes[i].nodeValue // 值
        const keyName = key.match(/^data-(\w+)/)[1] // 键名
        obj[keyName] = value // 对象添加属性
      }
    }
  }
  return obj
}

/** 获取所有流程内画版信息 正序**/
export function getNodesLinks2($, jsPlumb, that) {
  const s = that.jsp.getAllConnections()
  // 点的关系
  const links = {}
  _.some(s, (v, k) => {
    const t = v.sourceId
    const temp = []
    _.some(s, (vt, kt) => {
      if (t === vt.sourceId) {
        temp.push(vt.targetId)
      }
    })
    links[t] = temp
  })
  const draw = jsPlumb.save({ 'selector': '.jtk-node' }, that.jsp)
  draw['links'] = links
  return draw
}
/** 获取所有流程内画版信息 倒序**/
export function getNodesLinks($, jsPlumb, that) {
  const s = that.jsp.getAllConnections()
  // 点的关系
  const links = {}
  _.some(s, (v, k) => {
    const t = v.targetId
    const temp = []
    _.some(s, (vt, kt) => {
      if (t === vt.targetId) {
        temp.push(vt.sourceId)
      }
    })
    links[t] = temp
  })
  const draw = jsPlumb.save({ 'selector': '.jtk-node' }, that.jsp)
  draw['links'] = links
  return draw
}

/**
 * 根据中文字符串返回可视化type值
 * @param str
 * @returns {string}
 */
export function parseChartType(str) {
  let type = 've-line'
  switch (str) {
    case '散点图':
    case 'scatter':
    case 'abnormal_scatter':
      type = 've-scatter'
      break
    case '散点图(累加式)':
    case 'scatter_add':
      type = 've-scatter_add'
      break
    case '折线图':
    case 'line':
    case 'sequence_stat': // 时序稳定
      type = 've-line'
      break
    case '折线图(累加式)':
    case 'line_add':
      type = 've-line_add'
      break
    case '柱状图':
    case '直方图':
    case 'spectrum': // 实时频谱
    case 'histogram':
      type = 've-histogram'
      break
    case '柱状图(累加式)':
    case 'histogram_add':
      type = 've-histogram_add'
      break
    case '条形图':
    case 'bar':
      type = 've-bar'
      break
    case '饼图':
    case 'pie':
      type = 've-pie'
      break
    case '树图':
    case 'tree':
      type = 've-tree'
      break
    case '热力图':
    case 'heatmap':
      type = 've-heatmap'
      break
    case '表格':
    case 'table':
      type = 'table'
      break
    case '统计表':
    case 'static_table':
      type = 'static_table'
      break
    case '箱形图':
    case 'box':
      type = 'box'
      break
    case '仪表盘':
    case 'dash_board':
      type = 've-gauge'
      break
    default:
      break
    case '轴心轨迹图':
    case 'axis_trajectory':
      type = 've-scatter'
      break
  }
  return type
}
/**
 * 数据可视化根据中文字符串返回可视化type值
 * @param str
 * @returns {string}
 */
export function parseCaseChartType(str) {
  let type = str
  switch (str) {
    case '散点图':
    case 'scatter':
      type = 'scatter'
      break
    case '散点图(累加式)':
    case 'scatter_add':
      type = 'scatter_add'
      break
    case '折线图':
    case 'line':
      type = 'line'
      break
    case '折线图(累加式)':
    case 'line_add':
      type = 'line_add'
      break
    case '直方图':
    case 'histogram':
      type = 'histogram'
      break
    case '柱状图(累加式)':
    case 'histogram_add':
      type = 'histogram_add'
      break
    case '条形图':
    case '柱状图':
    case 'bar':
      type = 'bar'
      break
    case '饼图':
    case 'pie':
      type = 'pie'
      break
    case '箱形图':
    case 'box':
      type = 'box'
      break
    case '树图':
    case 'tree':
      type = 'tree'
      break
    case '热力图':
    case 'heatmap':
      type = 'heatmap'
      break
    case '表格':
    case 'table':
      type = 'table'
      break
    case '统计表':
    case 'static_table':
      type = 'static_table'
      break
    case '数据预览':
    case 'data_preview':
      type = 'data_preview'
      break
    case 'correlation': // 相关性
    case '相关性分析':
      type = 'correlation'
      break
    case 'persthreshold': // 个性化阈值
    case '个性化阈值':
      type = 'persthreshold'
      break
    case 'outlier': // 异常值
    case '异常值分析':
      type = 'outlier'
      break
    case 'distribution_test': // 异常值
    case '分布检验':
      type = 'distribution_test'
      break
    case 'covariance': // 异常值
    case '协方差':
      type = 'covariance'
      break
    case 'p_coefficient': // 异常值
    case '皮尔森系数':
      type = 'p_coefficient'
      break
    default:
      break
  }
  return type
}
// 获取滚动条位置
export function ScollPostion() {
  var t, l, w, h
  if (document.documentElement && document.documentElement.scrollTop) {
    t = document.documentElement.scrollTop
    l = document.documentElement.scrollLeft
    w = document.documentElement.scrollWidth
    h = document.documentElement.scrollHeight
  } else if (document.body) {
    t = document.body.scrollTop
    l = document.body.scrollLeft
    w = document.body.scrollWidth
    h = document.body.scrollHeight
  }
  return {
    top: t,
    left: l,
    width: w,
    height: h
  }
}

/**
 * 去掉不能解析的字符
 * "/{}/[]/空格
 * 虽然有引用，但是没有实际应用，且这种字符串处理函数，应该不属于validate范围内？？？
 */
export function validateReplaceStr(str) {
  var temp = str.replace(/\\\"/g, '"').replace(/\"\{/g, '{').replace(/\}\"/g, '}').replace(/\"\[/, '[').replace(/\]\"/, ']')
  var temp2 = temp.replace(/\"\[/, '[').replace(/\]\"/, ']').replace(/\s/g, '')
  return temp2
}
/** 去掉不能解析的字符*/
export function validateReplaceStr2(str) {
  var temp = str.replace(/\\\"/g, '"').replace(/\"\{/g, '{').replace(/\}\"/g, '}').replace(/\"\]\"/g, "']\"").replace(/=\[\"/g, "=['").replace(/\s/g, '')
  return temp
}

/**
 * 随机生成颜色
 * @returns {string}
 */
export function getRandomColor() {
  return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6)
}

// 字符串显示时，根据给定的特殊字符换行
export function newline(content, symbol) {
  // content = content.replace(/,/g, ',</br>')
  content = content.replace(new RegExp(symbol, 'g'), symbol + '</br>')
  return content
}

// 替换代码其他处process.env.BASE_API参数（为适应build后，在打包文件中动态修改路径的需求，此处判定采用的配置路径）
export function getBaseURL() {
  const { base_url } = baseUrl
  return base_url
}

// export function getBaseAtlasURL() {
//   const { atlasUrl } = baseUrl
//   return atlasUrl
// }
/**
 * 随机生成32位id
 */
export function createUUID() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  var uuid = s.join('')
  return uuid
}

/**
 * 获取数组内最大最小值，根据此值求出最大最小范围
 */
export function getNumberRange(numberdata) {
  // console.log('xxxx', numberdata, numberdata, Math.max.apply(null, numberdata), Math.min.apply(null, numberdata))
  var num_max = Math.max.apply(null, numberdata) // 数组中数据的最大值
  var num_min = Math.min.apply(null, numberdata) // 数组中数据的最小值
  var min_num = 0 // 根据最小值处理后的最小范围
  var max_num = 0 // 根据最大值处理后的最大范围
  var min_num_length = num_min.toString().length
  if (min_num_length >= 5) {
    if (num_min > 0) {
      min_num = Math.ceil(num_min * 0.95)
    } else {
      min_num = Math.ceil(num_min * 1.05)
    }
  } else {
    var min_num_percent = 1
    if (num_min > 0) {
      min_num_percent = min_num_length / 5
    } else {
      min_num_percent = 5 / min_num_length
    }
    // console.log('min_num_percent', min_num_percent)
    min_num = Math.ceil(num_min * min_num_percent)
  }
  // console.log('min_num', min_num)

  var max_num_length = num_max.toString().length
  if (max_num_length >= 5) {
    if (num_max > 0) {
      max_num = Math.ceil(num_max * 1.05)
    } else {
      max_num = Math.ceil(num_max * 0.95)
    }
  } else {
    var max_num_percent = 1
    if (num_max > 0) {
      max_num_percent = 5 / max_num_length
    } else {
      max_num_percent = max_num_length / 5
    }
    // console.log('max_num_percent', max_num_percent)
    max_num = Math.ceil(num_max * max_num_percent)
  }
  // console.log('max_num', max_num)
  return [min_num, max_num]
}

// 过滤拦截response值 替换None NaN Infinity 为null 其他情况直接返回 为了解决算法返回空值或无穷关键字json无法解析的情况
export function filterResponse(response) {
  let data = response.data || response
  if (typeof data === 'string' && data !== '') {
    const aReplace = {
      '\\sNone': '"None"',
      '\\[None': '["None"',
      '\\sNaN': '"NaN"',
      '\\[NaN': '["NaN"',
      'Infinity': '"Infinity"',
      '\\sinf': '"inf"',
      '\\[inf': '["inf"',
      '\\s-inf': '"-inf"',
      '\\[-inf': '["-inf"',
      'true': true,
      'false': false
    }
    try {
      data = data.replace(/\'/g, '"')
      Object.keys(aReplace).some(item => {
        const temp = new RegExp(item, 'ig')
        data = data.replace(temp, aReplace[item])
      })
      response.data = JSON.parse(data)
    } catch (e) {
      console.log('仍然存在json不可解析数据!')
    }
    return response
  } else {
    return response
  }
}
// 判断str是否是number 如果是专程number类型 如果不是原样返回
export function stringParseNumber(str) {
  if (/^[-]?[0-9]+\.?[0-9]+?$|^[-]?[0-9]$/.test(str)) {
    return Number(str)
  }
  return str
}
