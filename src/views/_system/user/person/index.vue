<template>
  <div class="tab-positon">
    <!-- 个人信息 -->
    <div class="personal_message">
      <el-card class="box-card card">
        <div class="top_header">
          <h3 style="color: #333">{{ $t('settings.setting_account') }}</h3>
        </div>
        <el-main class="main">
          <!-- <div v-for="(val, index) in userMessage" :key="index" class="text item"> -->
          <el-row :gutter="0">
            <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.username') }}:</div></el-col>
            <el-col :span="16"><div class="grid-content">{{ userMessage.username }}</div></el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.name') }}:</div></el-col>
            <el-col :span="16"><div class="grid-content">{{ userMessage.name }}</div></el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.email') }}:</div></el-col>
            <el-col :span="12" class="change_email"><div v-if="!emailForm_status" class="grid-content">{{ baseemail }}</div>
              <el-form v-if="emailForm_status" ref="emailForm" :model="emailForm" :rules="rules" class="emailForm">
                <el-form-item prop="email" class="email">
                  <el-input v-model="emailForm.email" :placeholder="$t('labels.user.newEmail')" auto-complete="off"/>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col v-if="emailForm_status" :span="4" class="form_btn">
              <el-button type="text" size="mini" @click="submituForm">{{ $t('buttons.confirm') }}</el-button>
              <el-button type="text" size="mini" @click="emailForm_status = false">{{ $t('buttons.cancel') }}</el-button>
            </el-col>
            <el-col v-if="!emailForm_status" :span="4"><div class="grid-content change_btn"><el-button type="text" size="mini" @click="emailForm_status = true">{{ $t('buttons.change') }}</el-button></div></el-col>
          </el-row>
          <!-- <el-row v-if="emailForm_status" :gutter="0">
            <el-form ref="emailForm" :model="emailForm" :rules="rules" class="emailForm">
              <el-form-item prop="email" class="email">
                <el-input v-model="emailForm.email" :placeholder="$t('labels.user.newEmail')" auto-complete="off"/>
              </el-form-item>
              <el-form-item prop="verify_code" class="verify_code">
                <div class="input_btn">
                  <el-input v-model="emailForm.verify_code" :placeholder="$t('labels.user.verify_code')" auto-complete="off"/>
                  <el-button :disabled="count_status" type="primary" size="mini" @click="getVerifyCode">
                    <span v-if="count_status">{{ count_down }}s</span>
                    <span>{{ $t('labels.user.send_verify_code') }}</span>
                  </el-button>
                </div>
              </el-form-item>
              <div class="operate_btn">
                <el-button size="mini" @click="submituForm">{{ $t('buttons.confirm') }}</el-button>
                <el-button size="mini" @click="emailForm_status = false">{{ $t('buttons.cancel') }}</el-button>
              </div>
            </el-form>
          </el-row> -->
          <!-- <el-row :gutter="0">
              <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.belong_group') }}:</div></el-col>
              <el-col :span="16"><div class="grid-content">{{ val.attributes.group_zname }}</div></el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.role') }}:</div></el-col>
              <el-col :span="16"><div class="grid-content">xxx</div></el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.device_manage') }}:</div></el-col>
              <el-col :span="16"><div class="grid-content">xxx</div></el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="6"><div class="grid-content grid-title">{{ $t('labels.user.own_platform') }}:</div></el-col>
              <el-col :span="16"><div class="grid-content">xxx</div></el-col>

            </el-row> -->
          <!-- </div> -->
        </el-main>
      </el-card>
    </div>
    <!-- 常规设置 -->
    <!-- <div class="general_setting">
      <el-card class="card-box card">
        <div class="top_header">
          <h3>{{ $t('labels.user.normal_setting') }}</h3>
        </div>
        <div class="radioBox">
          <div class="remindBox">
            <span class="emailRemind">{{ $t('labels.user.login_platform') }}:</span>
            <el-radio v-for="(item, index) in platformData" v-model="env.radio" :key="index" :label="item.label" :class="item.name">{{ item.label }}</el-radio>
          </div>
          <div class="fault_email_Box">
            <span class="emailRemind">{{ $t('labels.user.fault_email_notice') }}:</span>
            <el-radio v-for="(item, index) in faultEmailData" :key="index" v-model="env.radio1" :label="item.label" :class="'radio' + index">{{ item.label }}</el-radio>
          </div>
          <div class="fault_message_Box">
            <span class="emailRemind">{{ $t('labels.user.fault_message_notice') }}:</span>
            <el-radio v-for="(item, index) in faultMessageData" :key="index" v-model="env.radio2" :label="item.label" :class="'radio' + index + ' ' + item.name">{{ item.label }}</el-radio>
          </div>
          <el-button type="primary" size="mini" class="messagebtn" @click="messagesave">{{ $t('buttons.save')
          }}</el-button>
        </div>
      </el-card>
    </div> -->
  </div>
</template>

<script>

// import { getSingleUser, singleChange, registerTest, getVerCode, checkemailcode } from '@/api/system/user'
import { getSingleUser, singleChange } from '@/api/system/user'
import baseData from './register/userregister/baseData'
import passwordData from './register/userregister/passwordData'
// import { validateEmail } from '@/utils/validate'
import { checkEmail } from '@/utils/rules'
export default {
  name: 'Usermessage',
  components: {
    baseData,
    passwordData
  },
  data() {
    // 验证邮箱验

    // const checkEmail = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error(this.$t('rules.require_email')))
    //   } else if (!validateEmail(value)) {
    //     callback(new Error(this.$t('rules.invalid_email')))
    //   } else {
    //     const str = '?email=' + value.trim()
    //     registerTest(str).then(res => {
    //       if (res.data) {
    //         callback()
    //       } else {
    //         callback(new Error(this.$t('rules.duplicate_email')))
    //       }
    //     }).catch(error => {
    //       console.log(error)
    //       this.$message.error(this.$t('errors.email_error'))
    //     })
    //   }
    // }
    // 验证码
    // const checkEmailCode = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error(this.$t('rules.require_verify_code')))
    //   } else {
    //     const str = '?email=' + this.emailForm.email + '&' + 'code=' + this.emailForm.verify_code
    //     checkemailcode(str).then(res => {
    //       if (res.data.success) {
    //         callback()
    //       } else {
    //         callback(new Error(res.data.message))
    //       }
    //     }).catch(e => {
    //       this.$message.error(this.$t('errors.verify_error'))
    //     })
    //   }
    // }
    return {
      userMessage: [],
      name: '',
      basename: '',
      baseemail: '',
      // 修改用户资料
      user: {
        name: this.$store.state.user.name,
        email: this.$store.state.user.email,
        code: ''
      },
      // 修改
      emailForm: {
        email: '',
        verify_code: ''
      },
      // 倒计时
      count_down: 120,
      count_status: false,
      emailForm_status: false,
      rules: {
        email: [
          { validator: checkEmail, trigger: 'blur', required: false }
        ]
        // verify_code: [{ required: true, trigger: 'blur', validator: checkEmailCode }]
      },
      timer: null
      // env: {
      //   radio: '开发平台',
      //   radio1: '全故障邮件',
      //   radio2: '全部'
      // },
      // platformData: [
      //   { label: '开发平台', value: 0, name: 'dev' },
      //   { label: '运行平台', value: 2, name: 'run' }
      // ],
      // faultEmailData: [
      //   { label: '全故障邮件', value: 0 },
      //   { label: '未处理故障邮件', value: 2 },
      //   { label: '不接收', value: 3 }
      // ],
      // faultMessageData: [
      //   { label: '全部', value: 0, name: 'all' },
      //   { label: '只接受未处理故障消息', value: 2, name: 'only_faults' }
      // ]
    }
  },
  created() {
    this.fetchDate()
  },
  methods: {
    // 获取数据
    fetchDate() {
      getSingleUser(this.$store.state.user.id).then(res => {
        this.userMessage = res.data
        this.user.name = this.userMessage.username
        this.user.email = this.userMessage.email
        this.baseemail = this.userMessage.email
        this.emailForm.email = this.userMessage.email
        // this.basename = res.data.username
        this.$store.dispatch('SetEmail', this.userMessage.email)
        this.$store.dispatch('SetName', this.userMessage.username)
      })
    },
    // 获取邮箱验证码

    // getVerifyCode() {
    //   if (this.count_status) return
    //   const t = {
    //     email: this.emailForm.email
    //   }
    //   getVerCode(t).then(res => {
    //     if (res.status === 200) {
    //       this.$message({
    //         message: this.$t('strings.register.sended_code'),
    //         type: 'success',
    //         duration: 1000
    //       })
    //       this.count_down = 120
    //       this.count_status = true
    //       this.timer = setInterval(() => {
    //         this.count_down--
    //         if (this.count_down === 0) {
    //           this.count_status = false
    //           clearInterval(this.timer)
    //         }
    //       }, 1000)
    //     }
    //   }).catch(error => {
    //     console.log(error)
    //   })
    // },
    // 修改资料
    submituForm() {
      this.$refs['emailForm'].validate(valid => {
        if (valid) {
          const t = {

            email: this.emailForm.email
          }
          singleChange(t).then(res => {
            const data = res.data
            if (res.status === 200) {
              this.$message.success(this.$t('messages.update_success'))
              this.baseemail = data.email
              this.emailForm_status = false
              this.$store.dispatch('SetEmail', data.email)
              this.$refs['emailForm'].resetFields()
            }
          }).catch((error) => {
            console.log(error)
            this.$message.error(this.$t('messages.update_failed'))
          })
        }
      })
    },
    // 常规设置的保存
    messagesave() {
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
p {
  line-height: 20px;
}
.tab-positon{
  width: 100%;
  // padding-left: 214px;
  // height: calc(100vh - 40px);
  .personal_message {
    width: 30%;
    float: left;
    margin: 2% 0 0 5%;
    min-width: 460px;
    .card {
      & /deep/ .el-card__body {
        padding: 0!important;
      }
      .top_header {
        border-bottom: 1px solid #ccc;
        h3 {
          margin-left: 7%;
          margin-top: 5%
        }
      }
      .main{

        padding:0 4% 0 15%;
        position: relative;
        margin-top: 10px;
        margin-bottom: 40px;
        .change_email {
          overflow: hidden;
          line-height: 70px;
          height: 70px;
          .emailForm {
            display: inline-block;
            .email {

            }
            .verify_code {
              .input_btn {
                display: flex;
                input {
                  flex: 3;
                }
                button {
                  flex: 1;
                  margin-left: 5%;
                }
              }
            }
            .operate_btn {
              button {
                float: right;
                &:nth-child(2) {
                  margin-right: 5px;
                }
              }
            }
          }
        }

        .form_btn {
          height: 60px;
          line-height: 60px;
        }
        label{
          color: #606266;
        }
        .grid-content {
          line-height: 60px;
        }
        .grid-title {
          color: #5f6368;
          font-weight: 700;
        }
      }
    }
  }
  .general_setting {
    width: 30%;
    margin: 2% 0 0 5%;
    float: left;
    min-width: 590px;
    .card {
      & /deep/ .el-card__body {
        padding: 0!important;
      }
      .top_header {
        border-bottom: 1px solid #ccc;
        h3 {
          margin-left: 7%;
          margin-top: 5%
        }
      }
      .radioBox{
        margin-top: 20px;
        margin-left: 10%;
        .emailRemind{
          margin-right: 25px;
          font-weight: 700;
        }
        .remindBox {
          .dev {
            margin-right: 36px;
          }
        }
        .fault_email_Box{
          margin-top: 30px;
          .radio1{
            margin-left: -14px;
          }
        }
        .fault_message_Box {
          margin-top: 30px;
          .radio1{
            margin-left: 29px;
          }
          .radio2{
            margin-left: 65px;
          }
          .all {
            margin-right: 40px;
          }
        }
        .messagebtn{
          float: right;
          width: 16%;
          margin: 10% 7% 5% 0;
        }
      }
    }
  }
}
</style>
