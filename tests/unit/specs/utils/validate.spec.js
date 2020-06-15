import {
  validateURL,
  validateLowerCase,
  validateUpperCase,
  validateAlphabets,
  validateAlphanum,
  validateEmail,
  isHaveSpecial,
  validateZName,
  validateEName,
  isUsableIp,
  isUsableport,
  isUsableIp_port,
  validateIDCard,
  validateQQ,
  validateInteger,
  validateMoney
} from '@/utils/validate.js'
describe('Utils:validate', () => {
  it('validateURL', () => {
    expect(validateURL('http://192.168.0.105:8000')).toBe(true)
  })
  it('validateLowerCase', () => { // 只小写字母
    expect(validateLowerCase('abc')).toBe(true)
    expect(validateLowerCase('Abc')).toBe(false)
    expect(validateLowerCase('123abc')).toBe(false)
  })
  it('validateUpperCase', () => { // 只大写字母
    expect(validateUpperCase('ABC')).toBe(true)
    expect(validateUpperCase('Abc')).toBe(false)
    expect(validateUpperCase('123ABC')).toBe(false)
  })
  it('validateAlphabets', () => { // 大小写字母
    expect(validateAlphabets('ABC')).toBe(true)
    expect(validateAlphabets('Abc')).toBe(true)
    expect(validateAlphabets('123aBC')).toBe(false)
  })
  it('validateAlphanum', () => { // 大小写字母、数字
    expect(validateAlphanum('ABC')).toBe(true)
    expect(validateAlphanum('Abc')).toBe(true)
    expect(validateAlphanum('123aBC')).toBe(true)
  })
  it('validateEmail', () => {
    expect(validateEmail('liu_yang@css.com.cn')).toBe(true)
    expect(validateEmail('hlzbm123@163.com')).toBe(true)
    expect(validateEmail('hlzbm123')).toBe(false)
  })
  it('isHaveSpecial', () => { // 非大小写字母、数字、汉字、下划线
    expect(isHaveSpecial('123abcABC')).toBe(false)
    expect(isHaveSpecial('啊啊啊_1')).toBe(false)
    expect(isHaveSpecial('abc=+')).toBe(true)
  })
  it('validateEName', () => { // 大小写字母、数字、下划线
    expect(validateEName('123abcABC')).toBe(true)
    expect(validateEName('a_b')).toBe(true)
    expect(validateEName('abc=+')).toBe(false)
  })
  it('validateZName', () => {
    expect(validateZName('123abcABC啊')).toBe(true)
    expect(validateZName('啊_1')).toBe(true)
    expect(validateZName('啊+1')).toBe(false)
  })
  it('validateEmail', () => {
    expect(validateEmail('abc@css.com.cn')).toBe(true)
    expect(validateEmail('abc@163.com')).toBe(true)
    expect(validateEmail('abc123')).toBe(false)
  })
  it('isUsableIp', () => {
    expect(isUsableIp('1.0.0.0')).toBe(true)
    expect(isUsableIp('255.255.255.255')).toBe(true)
    expect(isUsableIp('0.0.0.0')).toBe(false)
  })
  it('isUsableport', () => {
    expect(isUsableport('8000')).toBe(true)
    expect(isUsableport('0000')).toBe(false)
    expect(isUsableport('65536')).toBe(false)
  })
  it('isUsableIp_port', () => {
    expect(isUsableIp_port('127.0.0.1:8000')).toBe(true)
    expect(isUsableIp_port('255.255.255.a:8000')).toBe(false)
    expect(isUsableIp_port('0.0.0.0:8000')).toBe(false)
  })
  it('validateIDCard', () => {
    expect(validateIDCard('11010119900101123x')).toBe(true)
    expect(validateIDCard('11010119900101123')).toBe(false)
    expect(validateIDCard('1101011990010112345')).toBe(false)
  })
  it('validateQQ', () => { // 5到11位
    expect(validateQQ('123456')).toBe(true)
    expect(validateQQ('1234')).toBe(false)
    expect(validateQQ('12345678901')).toBe(true)
    expect(validateQQ('123456789000')).toBe(false)
  })
  it('validateInteger', () => { // 1到无限大
    expect(validateInteger('100')).toBe(true)
    expect(validateInteger('0.1')).toBe(false)
    expect(validateInteger('0')).toBe(false)
  })
  it('validateMoney', () => {
    expect(validateMoney('100.00')).toBe(true)
    expect(validateMoney('100.0')).toBe(true)
    expect(validateMoney('100')).toBe(true)
    expect(validateMoney('100.000')).toBe(false)
  })
})
