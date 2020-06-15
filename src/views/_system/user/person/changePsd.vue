<template>
  <div class="change_container">
    <el-card class="card">
      <h3>{{ $t('settings.change_password') }}</h3>
      <div class="form_box">
        <el-form ref="passwordForm" :model="passwordForm" :rules="rules" label-position="left" label-width="80px" >

          <el-form-item :label="$t('settings.oldPass')" prop="oldPass">
            <el-input v-model="passwordForm.oldPass" type="password" show-password auto-complete="off" class="new-input"/>
          </el-form-item>
          <el-form-item :label="$t('settings.newPass')" prop="newPass">
            <el-input v-model="passwordForm.newPass" type="password" show-password auto-complete="off" class="new-input"/>
          </el-form-item>
          <el-form-item :label="$t('settings.confirmPass')" prop="confirmPass">
            <el-input v-model="passwordForm.confirmPass" type="password" show-password auto-complete="off" class="new-input"/>
          </el-form-item>
        </el-form>
        <div class="save_button">
          <el-button class="btn" type="primary" @click="savePass">{{ $t('buttons.save') }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
// import { checkOld, updateUserpwd } from '@/api/system/user'
import { siglePassdChange } from '@/api/system/user'
// import { validateEName } from '@/utils/validate'
import { validatePassword } from '@/utils/rules'
export default {
  name: 'Change',
  data() {
    // 验证旧密码

    // const validatePass = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error(this.$t('rules.require_oldpassword')))
    //   } else {
    //     const str = '?old_pass=' + value
    //     checkOld(str).then(res => {
    //       if (!res.data.success) {
    //         callback(new Error(this.$t('rules.invalid_oldpassword')))
    //       } else {
    //         callback()
    //       }
    //     })
    //   }
    // }
    // 验证新密码
    // const validateNewPass = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error(this.$t('rules.password_new')))
    //   } else if (value.length < 6 || value.length.length > 18) {
    //     callback(new Error(this.$t('rules.password_rule1')))
    //   } else if (!validateEName(value)) {
    //     callback(new Error(this.$t('rules.password_rule2')))
    //   } else {
    //     callback()
    //   }
    // }
    // 再次输入密码的验证
    const validateNewPassAgain = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.password_new_again')))
      } else if (value !== this.passwordForm.newPass) {
        callback(new Error(this.$t('rules.invalid_second_password')))
      } else {
        callback()
      }
    }
    return {
      passwordForm: {

        oldPass: '',
        newPass: '',
        confirmPass: ''
      },
      rules: {
        oldPass: [{ validator: validatePassword, trigger: 'blur', required: true }],
        newPass: [{ validator: validatePassword, trigger: 'blur', required: true }],
        confirmPass: [{ validator: validateNewPassAgain, trigger: 'blur', required: true }]
      }
    }
  },
  methods: {
    savePass() {
      this.$refs['passwordForm'].validate(valid => {
        if (!valid) return
        const t = {
          original_password: this.passwordForm.oldPass,
          password: this.passwordForm.newPass
        }
        siglePassdChange(t).then(res => {
          if (res.status === 200) {
            this.$message.success(this.$t('settings.reset_password_success'))
            // 修改成功后，强制用户退出
            this.$store.dispatch('FedLogOut').then(() => {
              this.$store.dispatch('SetName', '')
              this.$store.dispatch('SetStatus', '')
              this.$store.dispatch('changeAction', 'dev_platform')
              localStorage.clear()
              sessionStorage.clear()
              sessionStorage.setItem('islogout', '1')
              location.reload()// In order to re-instantiate the vue-router object to avoid bugs
            })
          }
        }).catch((error) => {
          console.log(error)
          this.$message.error(this.$t('settings.reset_password_faild'))
        })
      })
    }
  }
}

</script>
<style rel="styleSheet/scss" lang="scss" scoped>

  .change_container {
    width: 100%;
    height: calc(100vh - 100px);
    padding: 14px 15px 0 20px;
    .card {
      height: 100%;
      h3 {
        padding: 2% 0 2% 4%;
      }
      .form_box {
        width: 30%;
        margin-left: 8%;
        .save_button {
          margin-top: 53px;
          .btn {
            width: 85px;
            margin-left: 80px;
          }
        }
      }
    }
  }
</style>
