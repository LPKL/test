/**
 * 基础验证组件,特殊验证除外
 */
import i18n from '@/lang'
import { validateZName, validateAlphanum, validateEmail, validateIDCard, validateInteger, validateMoney, validateQQ, validateFile } from '@/utils/validate'
import { registerTest } from '@/api/system/user'

var qqnumber = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(i18n.t('rules.require_qq')))
  } else if (!validateQQ) {
    callback(new Error(i18n.t('rules.invalid_qq')))
  } else {
    callback()
  }
}
// 类似金钱,首位不为0,最多2位小数
export function checkNumPot2(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_number')))
  } else if (!validateMoney) {
    return callback(new Error(i18n.t('rules.invalid_number')))
  } else {
    callback()
  }
}
// 身份证
export function checkIdNum(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_IDCard')))
  } else if (!validateIDCard) {
    return callback(new Error(i18n.t('rules.invalid_IDCard')))
  } else {
    callback()
  }
}

// 整数
export function checkInterNum(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_integer')))
  } else if (!validateInteger) {
    return callback(new Error(i18n.t('rules.invalid_integer')))
  } else {
    callback()
  }
}

// 用户名规则拦截
export function checkUsername(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_username')))
  } else if (!validateAlphanum(value)) {
    return callback(new Error(i18n.t('rules.invalid_username_length')))
  } else if (value.length < 3 || value.length > 15) {
    return callback(new Error(i18n.t('rules.invalid_username_length')))
  } else {
    callback()
  }
}
// 用户密码拦截 可以使用特殊字符得密码
export function validatePassword(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_password')))
  } else if (value.length < 6 || value.length > 18) {
    return callback(new Error(i18n.t('rules.invalid_password_length')))
  } else {
    callback()
  }
}
// 用户密码拦截6~18
export function checkPassword(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_password')))
  } else if (value.length < 6 || value.length > 18) {
    return callback(new Error(i18n.t('rules.invalid_password_symbol')))
  } else {
    callback()
  }
}
// 输入名称类检测， 只允许字母，数组，汉字，下划线（空格不允许）
export function validateInputName(rule, value, callback) {
  if (!value || value.length === 0 || value.trim() === '') {
    return callback(new Error(i18n.t('rules.require_name')))
  } else if (!validateZName(value)) {
    return callback(new Error(i18n.t('rules.invalid_name')))
  } else {
    return callback()
  }
}

export function validateFilezname(rule, value, callback) {
  if (!value || value.length === 0 || value.trim() === '') {
    callback(new Error(i18n.t('rules.require_filename')))
  } else if (!validateFile(value)) {
    callback(new Error(i18n.t('rules.invalid_csv_name')))
  } else {
    callback()
  }
}
// 填写正确文件名
const validateFilename = (rule, value, callback) => {
  if (!value || value.length === 0 || value.trim() === '') {
    callback(new Error(i18n.t('rules.require_filename')))
  } else if (!validateFile(value)) {
    callback(new Error(i18n.t('rules.invalid_csv_name')))
  } else {
    callback()
  }
}
// 正确项目名称
const validateName = (rule, value, callback) => {
  if (!value || value.length === 0 || value.trim() === '') {
    callback(new Error(i18n.t('rules.require_name')))
  } else if (!validateZName(value)) {
    callback(new Error(i18n.t('rules.invalid_name')))
  } else {
    callback()
  }
}
// 正确模型名称
const modelname = (rule, value, callback) => {
  if (!value) {
    callback(new Error(i18n.t('rules.require_modelname')))
  } else if (!validateZName(value)) {
    callback(new Error(i18n.t('rules.invalid_modelname')))
  } else {
    callback()
  }
}
// textArea的输入
const textAreaInput = (rule, value, callback) => {
  if (!value) {
    callback(new Error(i18n.t('rules.require_desc')))
  } else {
    callback()
  }
}

// email
export function checkEmail(rule, value, callback) {
  if (!value) {
    return callback(new Error(i18n.t('rules.require_email')))
  } else if (!validateEmail(value)) {
    return callback(new Error(i18n.t('rules.invalid_email')))
  } else {
    callback()
  }
}

// 通过API验证用户名是否已在系统中存在
export function checkUserByAPI(rule, value, callback) {
  const str = '?username=' + value
  registerTest(str).then(res => {
    if (res.data) {
      callback()
    } else {
      callback(new Error(i18n.t('rules.duplicate_username')))
      this.userForm.username = ''
    }
  }).catch(error => {
    console.log(error)
  })
}
// 通过API验证邮箱是否已在系统中存在
export function checkEmailbyAPI(rule, value, callback) {
  const str = '?email=' + value
  registerTest(str).then(res => {
    if (res.data) {
      callback()
    } else {
      callback(new Error(i18n.t('rules.duplicate_email')))
      this.userForm.email = ''
    }
  }).catch(error => {
    console.log(error)
  })
}
/** ** 公共rules 直接引入使用即可 尽量使用这里的rules 特殊情况再处理****/
export default {
  /** **有验证函数部分****/
  qqNumber: [{ required: true, trigger: 'blur', validator: qqnumber }],
  numPot2: [{ required: true, trigger: 'blur', validator: checkNumPot2 }],
  InterNum: [{ required: true, trigger: 'blur', validator: checkInterNum }],
  // username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  // email: [{ required: true, trigger: 'blur', validator: validateEmail }],
  // 可以使用特殊字符
  password: [{ required: true, trigger: 'blur', validator: validatePassword }],
  // 不可以使用特殊字符
  // password2: [{ required: true, trigger: 'blur', validator: validatePassword2 }],
  file_name: [{ required: true, trigger: 'blur', validator: validateFilename }],
  model_name: [{ required: true, trigger: 'blur', validator: modelname }],
  project_zname: [{ required: true, trigger: 'blur', validator: validateName }],
  /** ***无验证函数部分*****/
  phone: [{ required: true, pattern: /^1[34578]\d{9}$/, message: '目前只支持中国大陆的手机号码', trigger: 'blur' }],
  isheader: [{ required: true, message: '请选择表头', trigger: 'change' }],
  encoding: [{ required: true, message: '请选择编码', trigger: 'change' }],
  isprivate: [{ required: true, message: '请选择文件集', trigger: 'change' }],
  file_doc: [{ required: false, validator: textAreaInput, trigger: 'blur' }]
}
