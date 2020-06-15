<template>
  <div class="Mi">
    <div ref="img-container" class="Mi-img">
      <div class = "logo-container">
        <div class="logo">
          <img src="../../assets/images/index/logo.jpg" alt="">
        </div>
      </div>
      <div class="language">
        <span>{{ $t('homepage.mindex.english') }}</span>
        <span>/</span>
        <span>{{ $t('homepage.mindex.chinese') }}</span>
      </div>
      <img src="../../assets/images/index/homePage.jpg" alt="">
      <div class="Mi-img-main">
        <div class="m-info">
          <div class="m-title">{{ $t('homepage.mindex.title') }}</div>
          <div class="m-subtitle">{{ $t('homepage.mindex.subtitle') }}</div>
        </div>
        <div v-if="!islogin" class="m-log">
          <el-form ref="loginForm" :model="logForm" :rules="loginRules">
            <el-row>
              <el-col :span="12">
                <el-form-item prop="username" class="username">
                  <div class="logname">
                    <el-input v-model.trim="logForm.username" :placeholder="$t('strings.login.username_placeholder')" name="username" style="zIndex: 2;" auto-complete="off" @keyup.enter.native="handleLogin"/>
                    <!-- <el-select v-model="logForm.username" :placeholder="$t('strings.login.username_placeholder')" name="username" filterable>
                      <el-option
                        v-for="(item, index) in nameArr"
                        :key="index"
                        :label="item"
                        :value="item"/>
                    </el-select> -->
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="password">
                  <div class="logPsd">
                    <!-- <el-input v-model.trim="logForm.password" :type="passwordType" :placeholder="$t('strings.login.password_placeholder')" style="z-index: 2;" auto-complete="new-password" @keyup.enter.native="handleLogin"/> -->
                    <el-input v-model.trim="logForm.password" :type="passwordType" :placeholder="$t('strings.login.password_placeholder')" class="inputType" style="z-index: 2;" auto-complete="new-password" @focus="changeInputType" @keyup.enter.native="handleLogin"/>
                    <span class="show-pwd" @click="showPwd">
                      <svg-icon v-if="passwordType" icon-class="eye"/>
                      <svg-icon v-if="!passwordType" icon-class="eye1"/>
                    </span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <el-button class="loginBtn" @click.native.prevent="handleLogin">
            <img src="../../assets/images/index/logBtn.png" alt="登陆">
          </el-button>
        </div>
        <div v-else class="m-log">
          <el-button type="primary" plain @click="goSystem">进入开发平台</el-button>
        </div>
      </div>
      <div class="Mi-img-btmLine"/>
    </div>
    <!-- 产品优势 -->
    <div class="Mi-care">
      <p class="Mi-care-title">{{ $t('homepage.mindex.careTitle') }}</p>
      <div class="Mi-care-main">
        <!--标注-->
        <el-row class="care-group">
          <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col leftone">
            <el-card class="cardBox">
              <div class="care-gt">
                <div><svg-icon icon-class="index_01"/></div>
                <div><span class="care-gt-t">{{ $t('homepage.mindex.careShow1') }}</span></div>
              </div>
              <div class="care-container">
                <div class="care-gbt">{{ $t('homepage.mindex.careShow1d') }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
            <el-card class="cardBox">
              <div class="care-gt">
                <div><svg-icon icon-class="index_02"/></div>
                <div><span class="care-gt-t">{{ $t('homepage.mindex.careShow2') }}</span></div>
              </div>
              <div class="care-container">
                <div class="care-gbt">{{ $t('homepage.mindex.careShow2d') }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
            <el-card class="cardBox">
              <div class="care-gt">
                <div><svg-icon icon-class="index_03"/></div>
                <span class="care-gt-t">{{ $t('homepage.mindex.careShow3') }}</span>
              </div>
              <div class="care-container">
                <div class="care-gbt">{{ $t('homepage.mindex.careShow3d') }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6" class="card-panel-col">
            <el-card class="cardBox">
              <div class="care-gt">
                <div><svg-icon icon-class="index_04"/></div>
                <div><span class="care-gt-t">{{ $t('homepage.mindex.careShow4') }}</span></div>
              </div>
              <div class="care-container">
                <div class="care-gbt">{{ $t('homepage.mindex.careShow4d') }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 关于我们 -->
    <div class="Mi-j Mi-fixed-width">
      <p class="Mi-j-title">{{ $t('homepage.mjoin.title') }}</p>
      <div class="containBox">{{ $t('homepage.mjoin.content') }}</div>
    </div>
    <!-- 经典案例 -->
    <div class="Mi-classic Mi-fixed-width">
      <p class="title">{{ $t('homepage.classic.title') }}</p>
      <div class="container">
        <el-row>
          <el-col :xs="24" :sm="8" :lg="8" class="panel-img leftone">
            <div>
              <img src="../../assets/images/index/rail.jpg" alt="" >
            </div>
          </el-col>
          <el-col :xs="24" :sm="8" :lg="8" class="panel-img">
            <div>
              <img src="../../assets/images/index/wind.jpg" alt="">
            </div>
          </el-col>
          <el-col :xs="24" :sm="8" :lg="8" class="panel-img">
            <div>
              <img src="../../assets/images/index/integrate.jpg" alt="">
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <MFooter/>
    <!--<TableSet />-->
  </div>
</template>
<script>
import LangSelect from '@/components/LangSelect'
import MFooter from './MFooter'
import debounce from 'lodash/debounce'
import { checkPassword } from '@/utils/rules'
// import WS4Redis from '@/utils/ws4redis'
import TableSet from '@/components/ModelFlow/components/incomponent/TableSet'
export default {
  name: 'Index',
  components: { LangSelect, MFooter, TableSet },
  props: {},
  data() {
    return {
      ws: '',
      num: 1,
      logForm: {
        username: '',
        password: ''
      },
      passwordType: 'text',
      loading: false,
      loginRules: {
        username: [{ required: true, trigger: ['blur'], message: this.$t('rules.require_username') }],
        password: [{ required: true, trigger: 'blur', validator: checkPassword }]
      },
      nameArr: [],
      cHeight: 0
    }
  },
  computed: {
    islogin() {
      console.log('首页输出', this.$store.state.user.name)
      return this.$store.state.user.name
    }
  },
  mounted() {
    const lsUsername = JSON.parse(window.localStorage.getItem('username'))
    if (lsUsername) {
      this.nameArr = Object.keys(lsUsername)
    }
    // todo 获取故障消息
  },
  methods: {
    showPwd() {
      if (!this.logForm.password) return
      if (!this.passwordType) {
        this.passwordType = 'password'
      } else {
        this.passwordType = ''
      }
    },
    // 修改密码输入框的状态
    changeInputType() {
      const inputEle = document.getElementsByClassName('inputType')[0]
      const innerInput = inputEle.getElementsByClassName('el-input__inner')[0]
      innerInput.type = 'password'
    },
    noOpten() {
      this.$message(this.$t('messages.not_open'))
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    },
    goSystem() {
      this.$router.push({ path: '/newmodel/index' })
    },
    handleLogin: debounce(function(node, status) {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const logFormData = JSON.parse(JSON.stringify(this.logForm))
          this.logForm.username = ''
          this.logForm.password = ''
          const inputEle = document.getElementsByClassName('inputType')[0]
          const innerInput = inputEle.getElementsByClassName('el-input__inner')[0]
          innerInput.type = 'text'
          this.$store.dispatch('LoginByUsername', logFormData).then((res) => {
            // this.$store.dispatch('logoutAction', false)
            // let str = ''
            // str = window.localStorage.username || JSON.stringify({})
            // const tempObj = JSON.parse(str)
            // tempObj[this.logForm.username] = this.logForm.username
            // const loginStr = JSON.stringify(tempObj)
            // window.localStorage.setItem('username', loginStr)
            this.id = res
            this.$router.push({ path: '/newmodel/index' })
            // this.logForm.username = ''
            // this.logForm.password = ''
            // this.$refs.loginForm.clearValidate()
            // this.loading = false
          }).catch((err) => {
            this.loading = false
            if (err.status === 401) {
              this.$message.error(this.$t('messages.name_psd_error'))
            } else if (!err.response) {
              this.$message.error(this.$t('messages.network_error'))
            } else {
              this.$message.error(err.message)
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }, 500)
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  .Mi {
    position: absolute;
    // max-width: 1920px;
    width: 100%;
    right: 0;
    left: 0;
    margin: auto;
    overflow-x: hidden;
    .logo-container {
      width: 10%;
      position: absolute;
      top: 4%;
      left: 2%;
      z-index: 100;
    }
    .language {
      position: absolute;
      right: 3%;
      top: 5%;
      color: #fff;
      font-size: 20px;
    }

    &-img {
      position: relative;
      img {
        width: 100%;
      }
      .left-trip {
        position: absolute;;
        top: 34%;
        left: 4%;
        color: #fff;
        font-size: 20px;
        line-height: 27px;
        height: 100%;
        .line {
          width: 1px;
          height: 20%;
          background-color: #fff;
          margin-left: 11px;
          margin-bottom: 15px;
        }
        .trip {
          position: absolute;
          width: 26px;
          .top {
            position: absolute;
            display: inline-block;
            width: 11px;
            height: 5px;
            border-top: 2px solid #fff;
            border-right: 2px solid #fff;
          }
          .bottom {
            position: absolute;
            display: inline-block;
            width: 11px;
            height: 5px;
            border-bottom: 2px solid #fff;
            border-left: 2px solid #fff;
            margin-left: -4px;
            margin-top: 10px;
          }
          .top1 {
            right: 5px;
            top: -2px;
          }
          .top2 {
            right: 5px;
            top: 36%;
          }
          .bottom1 {
            left: 3px;
            top: 22.5%;
          }
          .bottom2 {
            left: 3px;
            top: 59%;
          }
        }
      }
      .right-num {
        font-size: 13px;
        position: absolute;
        right: -25%;
        height: 100%;
        line-height: 15px;
        top: 49%;
        color:#fff;
        transform: rotateZ(-90deg);
        .short, .long {
          width: 15px;
        }
      }
      &-main {
        /*width: 100%;*/
        /*position: absolute;*/
        /*text-align: center;*/
        /*top: 26%;*/
        /*z-index: 20;*/
        width: 100%;
        height: 400px;
        position: absolute;
        text-align: center;
        margin: auto;
        top: -50px;
        bottom: 0;
        .m {
          position: absolute;
          &-info {
            color: #fff;
            & > div {
              margin-bottom: 30px;
            }
            margin-bottom: 40px;
          }
          &-title {
            font-size: 70px;
            // font-family: sy_regular;
          }
          &-subtitle {
            font-size: 22px;
          }
          &-log {
            width: 27.5%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            height: 36px;
            .logname {
              float: left;
              width: 88.5%;
            }
            .logPsd {
              float: right;
              width: 88.5%;
              position: relative;
              .show-pwd {
                position: absolute;
                right: 5%;
                top: 5px;
                font-size: 20px;
                color: #ccc;
                cursor: pointer;
                z-index: 3;
              }
            }
            .loginBtn {
              width: 252px;
              height: 42px;
              position:absolute;
              left: 50%;
              top: 339%;
              transform: translateX(-50%);
              background-color: transparent;
              border: 1px solid transparent;
              padding: 0 0;
              cursor: pointer;
              &:hover {
                img {
                  content: url('../../assets/images/index/hoverBtn.png')
                }
              }
            }
            & /deep/ input:-webkit-autofill {
              background-color: transparent!important;
              background-image: none !important;
              color: #B3B5B4!important;
            }
            & /deep/ .el-input__inner {
              background-color: transparent!important;
              border: 1px solid transparent!important;
              border-bottom: 2px solid #B3B5B4!important;
              color: #B3B5B4;
            }
            & /deep/ .el-input__inner:hover {
              border-color: transparent;
              border-bottom: 2px solid #B3B5B4;
            }
            & /deep/ .el-input__inner:focus {
              border-color: transparent;
              border-bottom: 2px solid #B3B5B4;
            }
            & /deep/ .el-form-item__error {
              left: 18%;
            }
            & /deep/ .username .el-form-item__error {
              left: 9%;
            }
          }
        }
      }
      &-btmLine {
        width: 2.33%;
        height: 4px;
        border-radius: 1px;
        background-color: #B3B5B4;
        position: absolute;
        bottom: 2%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        cursor: pointer;
      }
    }
    &-care {
      &-title {
        text-align: center;
        padding: 0 0 20px 0;
        margin: 0 0 5.45% 0;
        // font-family: sy_regular;
        font-size: 32px;
        margin-top: 100px;
        margin-bottom: 30px;
      }
      &-main {
        width: 100%;
        .care-group{
          .cardBox{
            margin: 20px 8%;
            padding: 50px 20px;
            min-height: 450px;
            .care{
              &-gt{
                margin-bottom: 30px;
                &-t{
                  font-size: 22px;
                  color: #333333;
                  padding: 10px 20px;
                  border-bottom: 1px solid #333;
                  word-break: keep-all;
                  white-space: nowrap;
                  // font-family: sy_regular;
                  margin-top: 100px;
                  margin-bottom: 30px;
                }
              }
              &-gbt{
                font-size:14px;
                line-height: 30px;
                color: #333333;
              }
            }
            div{
              text-align: center;
              margin-bottom: 20px;
              .svg-icon{
                width: 60px;
                height: 60px;
              }
            }
          }
        }
      }
    }
    &-fixed-width{
      width: 80%;
      margin: 0 auto;
    }
    /*关于我们*/
    &-j{
      text-align: center;
      margin-bottom: 40px;
      &-title {
        // font-family: sy_regular;
        font-size: 32px;
        margin-top: 100px;
        margin-bottom: 30px;
      }
      .containBox {
        padding: 10px 0;
        font-size: 22px;
        line-height: 40px;
      }
    }
    // 经典案例
    &-classic {
      text-align: center;
      margin-bottom: 40px;
      .title {
        // font-family: sy_regular;
        font-size: 32px;
        margin-top: 100px;
        margin-bottom: 30px;
      }
      .el-col{
        div{
          margin: 5%;
        }
      }
      img {
        width: 100%;
      }
    }
  }

</style>
