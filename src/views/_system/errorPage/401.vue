<template>
  <div class="errPage-container">
    <el-button icon="arrow-left" class="pan-back-btn" @click="back">{{ $t('buttons.back') }}</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">{{ $t('errorPages.page401.not_found') }}</h1>
        <h2>{{ $t('errorPages.page401.not_permission') }}</h2>
        <h6>{{ $t('errorPages.page401.contact_admin') }}</h6>
        <ul class="list-unstyled">
          <li>{{ $t('errorPages.page401.go_to') }}</li>
          <li class="link-type">
            <router-link to="/">{{ $t('errorPages.page401.back_home') }}</router-link>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <!--<img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">-->
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" :title="$t('errorPages.page401.dialog_msg')">
      <img :src="ewizardClap" class="pan-img">
    </el-dialog>
  </div>
</template>

<script>
import errGif from '@/assets/images/error/401.gif'

export default {
  name: 'Page401',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
      dialogVisible: false
    }
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/index' })
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .errPage-container {
    width: 800px;
    max-width: 100%;
    margin: 100px auto;
    .pan-back-btn {
      background: #008489;
      color: #fff;
      border: none!important;
    }
    .pan-gif {
      margin: 0 auto;
      display: block;
    }
    .pan-img {
      display: block;
      margin: 0 auto;
      width: 100%;
    }
    .text-jumbo {
      font-size: 60px;
      font-weight: 700;
      color: #484848;
    }
    .list-unstyled {
      font-size: 14px;
      li {
        padding-bottom: 5px;
      }
      a {
        color: #008489;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
