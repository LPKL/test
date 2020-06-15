import Cookies from 'js-cookie'

const TokenKey = 'a_t'
const Fresh_Token = 'f_t'
const SessionKey = 'sk'
const AdminId = 'ai1'
const Unread = 'unread'
const COOKIE_EXPIRED_AFTER = 1200 // 20分钟 秒为单位的access-token过期时间

export function getToken(str) {
  return Cookies.get(str)
}
export function getSessionkey() {
  return Cookies.get(SessionKey)
}
// 获取id
export function getAdminId() {
  return Cookies.get(AdminId)
}
// 获消息总数
export function getUnread() {
  return Cookies.get(Unread)
}
// 设置消息总数
export function setUnread(num) {
  return Cookies.set(Unread, num)
}
// 设置token，以及过期时间
export function setToken(token, freshToken) {
  Cookies.set(TokenKey, token)
  return Cookies.set(Fresh_Token, freshToken)
}
// 设置token，以及过期时间 -- 带过期时间
export function setTokenWithExpire(token, freshToken) {
  const expiredAt = new Date(new Date().getTime() + COOKIE_EXPIRED_AFTER * 1000)
  Cookies.set(TokenKey, token, { expires: expiredAt })
  return Cookies.set(Fresh_Token, freshToken)
}
// 再次获取token的设置
export function setNewToken(val) {
  return Cookies.set(TokenKey, val)
}
// 再次获取token的设置--过期时间
export function setNewTokenWithExpire(val, refreshUpdated) {
  const expiredAt = new Date(new Date().getTime() + COOKIE_EXPIRED_AFTER * 1000)
  if (refreshUpdated) {
    Cookies.set(Fresh_Token, refreshUpdated)
  }
  return Cookies.set(TokenKey, val, { expires: expiredAt })
}
// 设置id
export function setAdminId(token) {
  return Cookies.set(AdminId, token)
}
// 移除获取信息token
export function removeAccessToken() {
  // 移除id
  return Cookies.remove(TokenKey)
}
// 移除token
export function removeToken() {
  // 移除id
  Cookies.remove(AdminId)
  Cookies.remove(Fresh_Token)
  return Cookies.remove(TokenKey)
}
export function setSessionKey(stoken) {
  return Cookies.set(SessionKey, stoken)
}
export function getMessageStatus(statusinfo) {
  const key_array = statusinfo.split(/[0-9]+/)
  key_array.shift()
  const status_array = statusinfo.split(/[YN]/)
  status_array.pop()
  const messageStatusArr = []
  for (var i = 0; i < key_array.length; i++) {
    messageStatusArr.push({ 'key': status_array[i], 'status': key_array[i] })
  }
  // console.log('getMessageStatus', messageStatusArr)
  return messageStatusArr
}
export function getUnreadNum(statusinfo) {
  let unreadNum = 0
  if (statusinfo.match(/N/g) === null) {
    unreadNum = 0
  } else {
    unreadNum = statusinfo.match(/N/g).length
  }
  // console.log('getUnreadNum', unreadNum)consoleconsole
  return unreadNum
}

