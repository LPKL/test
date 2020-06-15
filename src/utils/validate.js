export function isvalidUsername(str) {
  const valid_map = ['hd']
  return valid_map.indexOf(str.trim()) >= 0
  // return true
}

/** 合法uri*/
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/** 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/** 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/** 大小写字母*/
export function validateAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/** 大小写字母、数字*/
export function validateAlphanum(str) {
  const reg = /^[0-9a-zA-Z]+$/
  return reg.test(str)
}

/** 小写字母、数字*/
export function validateLowerAlphanum(str) {
  const reg = /^[0-9a-z]+$/
  return reg.test(str)
}

/** 英文名称命名规范(字母、数字、下划线) */
export function validateEName(str) {
  var reg = /^[0-9a-zA-Z_]+$/
  return reg.test(str)
}

/** 中文名称命名规范(中文、字母、数字、下划线) */
export function validateZName(str) {
  const reg = /^[0-9a-zA-Z_\u4E00-\u9FA5]+$/
  return reg.test(str)
}
/**
 * 验证只能是中文名
 */
export function validateOnlyZName(str) {
  const reg = /^[\u4E00-\u9FA5]+$/
  return reg.test(str)
}
/**
 * 以字母开头，只能是字母和数字的结合
 */
export function validateFile(str) {
  const reg = /^[a-zA-Z][0-9a-zA-Z]+$/
  return reg.test(str)
}
/**
 * 字母跟数字的组合
 */
export function validateFileName(str) {
  const reg = /^[a-zA-Z][0-9a-zA-Z]+$/
  return reg.test(str)
}
/**
 * 字母数字下划线的组合
 */
export function validateFileName_(str) {
  const reg = /^[a-zA-Z][0-9a-zA-Z_]+$/
  return reg.test(str)
}
/**
 * 判断是否含有特殊字符 可以输入中文(除中文、字母、数组、下划线之外的，是validateZName的负值范围)
 * @param str 字符串
 * @returns {boolean}
 */
export function isHaveSpecial(str) {
  var filterRule = /[^0-9a-zA-Z_\u4E00-\u9FA5]/g
  return filterRule.test(str)
}
export function isHaveSpecials(str) {
  var filterRule = /[0-9a-zA-Z_\u4E00-\u9FA5]+/g
  return filterRule.test(str)
}

/**
 * validate email
 * @param email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:=\?\+\s@"]+(\.[^<>()\[\]\\.,;:=\?\+\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

/**
 * 合法的ip地址
 *  */
export function isUsableIp(str) {
  var filterRule = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/
  return filterRule.test(str)
}
/**
 *  端口号的验证
 * */
export function isUsableport(str) {
  var filterRule = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/
  return filterRule.test(str)
}
/**
 * ip和端口号一起验证
 *  */
export function isUsableIp_port(str) {
  // var filterRule = /((^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9]):\d{0,5})\,)+/
  var filterRule = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9]):\d{0,5}$/
  return filterRule.test(str)
}

/** 身份证*/
export function validateIDCard(str) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(str)
}

/** QQ*/
export function validateQQ(str) {
  const reg = /^[1-9][0-9]{4,10}$/
  return reg.test(str)
}

/** 整数 1到无限大*/
export function validateInteger(str) {
  const reg = /^[0-9]*[1-9][0-9]*$/
  return reg.test(str)
}

/** 类似金钱,首位不为0,最多2位小数*/
export function validateMoney(str) {
  const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
  return reg.test(str)
}
/**
 * 判断文件路径
 */
export function validatefilePath(str) {
  const reg = /^\/[^\/*:?<>|"]+(\/[^\/*:?<>|"]+)+[\.csv|\.parquet]$/
  return reg.test(str)
}
/**
 * 模型服务名称规则 服务名只能由小写字母、数字和中短划线组成，且首位只能为字母
 */
export function validateModelServiceName(str) {
  const reg = /^[a-z][a-z0-9-]*$/
  return reg.test(str)
}
