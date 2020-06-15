/**
 * 预上线环境配置
 * @type {{NODE_ENV: string, ENV_CONFIG: string, BASE_API: string}}
 */
module.exports = {
  NODE_ENV: '"production"',
  ENV_CONFIG: '"sit"',
  BASE_API: '"http://10.28.0.168:8080"'//内网服务器地址
  // BASE_API: '"http://218.247.237.27:28080"'　//外网服务器地址
  // BASE_API: '"http://218.247.237.29:18080"'　//外网服务器地址
  // BASE_API: '"http://10.28.0.151:8080"'//内网服务器地址
  // BASE_API: '"http://192.168.1.110:8080"'//内网服务器地址
  // BASE_API: '"http://10.232.41.148.:8080"'//内网服务器地址

}

