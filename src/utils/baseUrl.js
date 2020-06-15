/**
 * build之后的配置信息 todo 此处是为了获取要更改的配置信息分发到各处
 * @type {{}}
 */
const baseUrl = {}

if (process.env.NODE_ENV === 'package') {
  baseUrl['baseSwUrl'] = window.serverConfig.baseSocketURL
  baseUrl['base_url'] = window.serverConfig.baseURL
} else { // 默认配置信息
  baseUrl['atlasUrl'] = 'http://10.28.0.250:8089'
  baseUrl['baseSwUrl'] = 'ws://10.28.0.39:30881' // dev
  // baseUrl['baseSwUrl'] = 'ws://10.28.0.39:30882' // test
  baseUrl['base_url'] = process.env.BASE_API
  baseUrl['showPlatform'] = true
}

// 去掉末尾'/'
for (const key in baseUrl) {
  if (typeof baseUrl[key] === 'string' && baseUrl[key].trim().slice(-1) === '/') {
    baseUrl[key] = baseUrl[key].slice(0, -1)
  }
}
console.log(baseUrl)
export default baseUrl
