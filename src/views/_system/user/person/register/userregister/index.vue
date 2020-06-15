<template>
  <div class="container">
    <div class="box-card register-box">
      <h1 style="text-align: center;">{{ $t('strings.register.name') }}</h1>
      <p style="text-align: center;">{{ $t('strings.register.subtitle') }}</p>
      <el-form ref="registerForm" status-icon class="registerForm">
        <baseData ref="refBaseData"/>
        <passwordData ref="refPasswordData"/>
        <el-form-item align="center">
          <el-button id="btnRegester" type="primary" @click="submitForm('registerForm')">{{ $t('buttons.submit') }}</el-button>
          <el-button id="btnRegesterReset" type="text" @click="resetForm('registerForm')">{{ $t('buttons.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import { addUser } from '@/api/system/user'
import baseData from './baseData'
import passwordData from './passwordData'
export default {
  name: 'Register',
  components: {
    baseData,
    passwordData
  },
  methods: {
    submitForm(formName) {
      var registerForm_merge = Object.assign(this.$refs.refBaseData.registerForm, this.$refs.refPasswordData.registerForm)
      registerForm_merge.username = registerForm_merge.name
      if (!this.$refs.refBaseData.nameIsUseAble || !this.$refs.refBaseData.emalIsUseAble) return
      if (this.$refs.refBaseData.count === 0) {
        this.$message({
          message: this.$t('strings.register.timeout_code'),
          type: 'warning',
          duration: 1000
        })
        return
      }
      // this.resetEmailCodeField()
      this.$refs.refBaseData.$refs['registerForm'].validate((valid1) => {
        if (valid1) {
          this.$refs.refPasswordData.$refs['registerForm'].validate((valid2) => {
            if (valid2) {
              // alert('submit!')
              if (!this.$refs.refBaseData.emalIsUseAble) return
              addUser(registerForm_merge).then(res => {
                this.$message({
                  message: this.$t('messages.register.reg_success'),
                  type: 'success',
                  duration: 1000
                })
                this.$router.push({ path: '/login' })
              }).catch(error => {
                console.log(error)
                this.$message({
                  message: this.$t('messages.register.reg_failed'),
                  type: 'error',
                  duration: 1000
                })
              })
            } else {
              console.log('password data error submit!!')
              return false
            }
          })
        } else {
          console.log('base data error submit!!')
          this.$refs.refPasswordData.$refs['registerForm'].validateField('password')
          // this.$refs.refPasswordData.$refs['registerForm'].validateField('checkPass')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs.refBaseData.$refs[formName].resetFields()
      this.$refs.refPasswordData.$refs[formName].resetFields()
      this.$refs.refBaseData.codestatus = true // 禁用获取验证码按钮
      this.resetEmailCodeField()
    },
    resetEmailCodeField() {
      this.$refs.refBaseData.status = false
      clearInterval(this.$refs.refBaseData.timer)
      this.$refs.refBaseData.$refs['count'].$el.style.display = 'none'
      this.$refs.refBaseData.$refs['verify'].$el.style.display = 'inline-block'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.container{
  // position: absolute;
  width: 100%;
  height: 100%;
  min-width: 500px;
  .box-card{
    width: 435px;
    margin: 50px auto;
    .registerForm {
      margin-top: 30px;
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
.register-box{
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.3);
  padding: 28px 5px
}
</style>
