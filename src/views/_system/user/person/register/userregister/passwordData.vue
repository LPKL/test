
<template>
  <el-form id="register_password_form" ref="registerForm" :model="registerForm" :rules="rules" status-icon class="registerForm">
    <el-form-item prop="password">
      <el-input :placeholder="$t('labels.password')" v-model="registerForm.password" type="text" name="password" onfocus="this.type='password'" auto-complete="off"/>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input :placeholder="$t('labels.confirm_password')" v-model="registerForm.checkPass" type="text" name="confirm_password" onfocus="this.type='password'" auto-complete="off"/>
    </el-form-item>
  </el-form>
</template>

<script>

import { checkPassword } from '@/utils/rules'
export default {
  name: 'RegisterPasswordData',
  props: {
    oldpassword: {
      type: String,
      default: ''
    }
  },
  data() {
    const checkPassword2 = (rule, value, callback) => {
      // 个人中心，新旧密码查重
      if (value === this.oldpassword) {
        callback(new Error(this.$t('rules.invalid_new_password')))
        this.registerForm.password = ''
      } else {
        callback()
      }
    }
    // 再次输入密码
    const checkPassword_sec = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('rules.password_again')))
      } else if (value !== this.registerForm.password) {
        callback(new Error(this.$t('rules.invalid_second_password')))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        password: '',
        checkPass: ''
      },
      rules: {
        password: [
          { validator: checkPassword, trigger: 'blur', required: true },
          { validator: checkPassword2, trigger: 'blur' }
        ],
        checkPass: [
          { validator: checkPassword_sec, trigger: 'blur', required: true }
        ]
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.registerForm {
  margin-left: 10px;
  margin-right: 10px;
}
</style>
