
<template>
  <el-form id="register_base_form" ref="registerForm" :model="registerForm" :rules="rules" status-icon class="registerForm">
    <el-form-item prop="name">
      <el-input :placeholder="$t('labels.username')" v-model="registerForm.name" name="username" auto-complete="off"/>
    </el-form-item>
    <el-form-item prop="email">
      <el-input :placeholder="$t('labels.user.email')" v-model="registerForm.email" name="email" type="email" auto-complete="off"/>
    </el-form-item>
    <el-form-item prop="code">
      <el-row>
        <el-col :span="13"><el-input :placeholder="$t('labels.user.email_code')" v-model="registerForm.code" name="email_code" type="code" auto-complete="off"/></el-col>
        <el-col :span="1">
          <el-button ref="registcode" :disabled="codestatus" type="primary" size="small" class="btn" @click="getPassCode(registerForm.email)">
            <el-col ref="count" :span="1" class="count">{{ count }}s</el-col>
            <el-col ref="verify" :span="1" class="verify">{{ $t('buttons.register.get_email_code') }}</el-col>
          </el-button>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script>

import { registerTest, getVerCode, checkemailcode } from '@/api/system/user'
import { checkUsername, checkEmail } from '@/utils/rules'
export default {
  name: 'RegisterBaseData',
  props: {
    userbaseobject: {
      type: Object,
      default: function() {
        return {
          name: '',
          email: '',
          code: ''
        }
      }
    },
    isloggedin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 验证用户名
    const checkUserByAPI = (rule, value, callback) => {
      const str = '?username=' + value
      registerTest(str).then(res => {
        if (res.data) {
          callback()
          this.nameIsUseAble = true
        } else {
          this.nameIsUseAble = false
          callback(new Error(this.$t('rules.duplicate_username')))
          this.registerForm.name = ''
        }
      }).catch(error => {
        console.log(error)
      })
    }
    // 验证邮箱验证码
    const checkEmailCodeByAPI = (rule, value, callback) => {
      const str = '?email=' + this.registerForm.email + '&' + 'code=' + this.registerForm.code
      checkemailcode(str).then(res => {
        if (res.data.success) {
          callback()
        } else {
          callback(new Error(res.data.message))
          this.registerForm.code = ''
        }
      })
    }
    // 验证邮箱是否已注册
    const checkEmailByAPI = (rule, value, callback) => {
      if (!this.isloggedin) {
        // 个人中心中对已存的邮箱，不再验证是否重复
        const str = '?email=' + value.trim()
        registerTest(str).then(res => {
          if (res.data) {
            callback()
            this.emalIsUseAble = true
            this.codestatus = false
          } else {
            callback(new Error(this.$t('rules.duplicate_email')))
            this.emalIsUseAble = false
            this.registerForm.email = ''
          }
        }).catch(error => {
          console.log(error)
        })
      } else {
        callback()
        this.emalIsUseAble = true
        this.codestatus = false
      }
    }
    return {
      codestatus: true,
      registerForm: this.userbaseobject,
      emalIsUseAble: true,
      nameIsUseAble: true,
      count: 120,
      timer: null,
      rules: {
        name: [
          { validator: checkUsername, trigger: 'blur', required: true },
          { validator: checkUserByAPI, trigger: 'blur', required: true }
        ],
        code: [
          { message: this.$t('rules.require_emailcode'), trigger: 'blur', required: true },
          { validator: checkEmailCodeByAPI, trigger: 'blur', required: true }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' },
          { validator: checkEmailByAPI, trigger: 'blur', required: true }
        ]
      },
      status: false
    }
  },
  methods: {
    // 获取邮箱验证码
    getPassCode(data) {
      if (data === '') return
      if (this.status) return
      if (!this.emalIsUseAble) return
      this.status = true
      const t = {
        email: data
      }
      getVerCode(t).then(res => {
        if (res.status === 200) {
          this.$message({
            message: this.$t('strings.register.sended_code'),
            type: 'success',
            duration: 1000
          })
          this.$refs['count'].$el.style.display = 'inline-block'
          this.$refs['verify'].$el.style.display = 'none'
          this.count = 120
          this.timer = setInterval(() => {
            this.count--
            if (this.count === 0) {
              this.status = false
              clearInterval(this.timer)
              this.$refs['count'].$el.style.display = 'none'
              this.$refs['verify'].$el.style.display = 'inline-block'
            }
          }, 1000)
        }
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.registerForm {
  margin-top: 30px;
  margin-left: 10px;
  margin-right: 10px;
}
.btn {
  margin-left: 10px;
  display: inline-block;
  // width: 147px;
}
.count{
  display: none;
  // background-color: #ccc;
  width: 31px;
  height: 15px;
  text-align: center;
  margin-left: 43px;
  border-radius: 3px;
  color: #fff;
}
</style>
