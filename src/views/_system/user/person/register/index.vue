<template>
  <div class="container">
    <el-header class="navBar">
      <div class="logo">
        <router-link to="/" > <img src="@/assets/images/index/logo.png" alt=""></router-link>
        <i class="Separate"/>
        <span class="register hidden-xs-only">{{ $t('strings.register.name') }}</span>
        <span class="rlogin">{{ $t('strings.register.start_reg') }}   <router-link to="/login"><el-button type="primary" plain class="loginBtn">{{ $t('strings.login.logIn') }}</el-button></router-link></span>
      </div>
    </el-header>
    <div class="registerbox">
      <Userregister/>
    </div>
  </div>
</template>

<script>
import Userregister from './userregister'
import 'element-ui/lib/theme-chalk/display.css' // 隐藏元素
export default {
  name: 'Register',
  components: {
    Userregister
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .container{
    position: absolute;
    width: 100%;
    height: 100%;
    .navBar{
      position: absolute;
      top: 10px;
      left: 10%;
      width: 80%;
      height: 70px !important;
      border-bottom: 2px solid #ddd;
    .logo{
      position: relative;
      .Separate{
        position: absolute;
        // left: 14%;
        left:152px;
        top: 54%;
        display: inline-block;
        width: 2px;
        height: 22px;
        background-color: #ccc;
        z-index: 10;
      }
      .register{
        position: absolute;
        // left: 15%;
        left:163px;
        top: 52%;
        color: #606266;
        font-size: 20px;
      }
      .rlogin{
        position: absolute;
        // right: 2%;
        right: 8px;
        top: 48%;
        font-size: 14px;
        color: #606266;
        .loginBtn{
          font-size: 14px;
          width: 80px;
        }
      }
    }
  }
    .registerbox{
      // position: absolute;
      // left: 140px;
      // top: 185px;
      position: relative;
      top: 80px;
    }
  }
</style>
