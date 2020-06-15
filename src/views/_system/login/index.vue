<template>
  <div class="container">
    <el-header class="navBar">
      <div class="logo">
        <router-link to="/" > <img src="@/assets/images/index/logo.png" alt=""></router-link>
        <i class="Separate"/>
        <span class="register">{{ $t('strings.login.logIn') }}</span>
        <lang-select class = "set-language"/>
        <span class="login"><router-link to="/">{{ $t('route.index') }}</router-link></span>
      </div>
    </el-header>
    <!--<div class="sideBar">这只是一段用来占位的文字</div>-->
    <div class="card">
      <el-card class="box-card">
        <div class="login-container">
          <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
            <el-form-item prop="username">
              <span class="svg-container svg-container_login">
                {{ $t('labels.username') }}
              </span>
              <el-input
                v-model="loginForm.username"
                :placeholder="$t('strings.login.username_placeholder')"
                name="username"
                type="text"
                auto-complete="on"
              />
            </el-form-item>

            <el-form-item prop="password">
              <span class="svg-container">
                {{ $t('labels.password') }}
              </span>
              <el-input
                :type="passwordType"
                v-model="loginForm.password"
                :placeholder="$t('strings.login.password_placeholder')"
                name="password"
                auto-complete="on"
                @change="handleLogin" />
              <span class="show-pwd" @click="showPwd">
                <svg-icon icon-class="eye" />
              </span>
            </el-form-item>

            <el-button id="btnLogin" :loading="loading" type="primary" style="width:100%;margin:20px 0;" @click.native.prevent="handleLogin">{{ $t('strings.login.logIn') }}</el-button>
            <div class="tips">
              <router-link to="/register" >{{ $t('strings.register.name') }}</router-link>
            </div>
            <!--todo第三方登录按钮-->
            <!--<div class="thirdparty">-->
            <!--<el-button class="thirdparty-button" type="primary" >{{ $t('strings.login.thirdparty') }}</el-button>-->
            <!--</div>-->
          </el-form>

          <el-dialog :title="$t('strings.login.thirdparty')" :close-on-click-modal="false" :visible.sync="showDialog" append-to-body>
            {{ $t('strings.login.thirdpartyTips') }}
            <br>
            <br>
            <br>
            <social-sign />
          </el-dialog>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
// import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import { validatePassword } from '@/utils/rules'
export default {
  name: 'Login',
  components: { LangSelect, SocialSign },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      // rules,
      passwordType: 'password',
      loading: false,
      showDialog: false,
      redirect: undefined,
      id: ''
    }
  },
  computed: {
    loginRules() {
      return {
        username: [{ required: true, message: this.$t('rules.require_username'), trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }

  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then((res) => {
            this.id = res
            this.loading = false
            this.$router.push({ path: '/newmodel/index' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.container{
  position: relative;
  width: 100%;
  height: 100%;
  // min-width: 800px;
  .sideBar{
    width: 200px;
    height: 200px;
    border: 1px solid #000;
    position: absolute;
    left: 210px;
    top: 165px;
  }
  .card{
    position: absolute;
    right: 10%;
    // right:248px;
    top: 25%;
    width: 30%;
    height: 360px;
    min-width: 406px;
    .box-card{
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      .login-container {
        .login-form {
          position: absolute;
          left: 0;
          right: 0;
          width: 420px;
          padding: 0px 35px 0px 35px;
          margin: 10px auto;
        }
        .tips {
          font-size: 14px;
          color: #889aa4;
          margin-bottom: 10px;
          span {
            &:first-of-type {
              margin-right: 16px;
            }
          }
        }
        .svg-container {
          color: $dark_gray;
          display: inline-block;
        }
        .title-container {
          position: relative;
          .title {
            font-size: 26px;
            color: $light_gray;
            margin: 0px auto 40px auto;
            text-align: center;
            font-weight: bold;
          }
          .set-language {
            color: #fff;
            position: absolute;
            top: 5px;
            right: 0px;
          }
        }
        .show-pwd {
          position: absolute;
          right: 10px;
          top: 37px;
          font-size: 16px;
          color: $dark_gray;
          cursor: pointer;
          user-select: none;
        }
        .thirdparty {
          position: absolute;
          height:30px;
          right: 35px;
          bottom: 0px;
        }
      }
    }
  }
  .navBar{
    position: absolute;
    top: 10px;
    left: 10%;
    width: 80%;
    height: 70px !important;
    border-bottom: 2px solid #ddd;
    .logo{
      position: relative;
      .set-language{
        position: absolute;
        // right: 6%;
        right:4.6%;
        // right: 73.5px;
        margin-right:10px;
        top: 65%;
      }
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
      .login{
        position: absolute;
        // right: 2%;
        right: 1%;
        top: 69%;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

</style>
