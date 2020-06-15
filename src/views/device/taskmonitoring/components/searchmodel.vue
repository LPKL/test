<template>
  <el-header class="s-header">
    <el-row class="main">
      <el-select v-model="device" :placeholder="$t('strings.flow.select_device')" filterable class="cdevice">
        <el-option
          v-for="item in message"
          :key="item.value"
          :label="item.label"/>
      </el-select>
      <el-select v-model="device" :placeholder="$t('strings.flow.select_user')" filterable class="cusername">
        <el-option
          v-for="item in message"
          :key="item.value"
          :label="item.label"/>
      </el-select>
      <el-button type="primary" class="button">{{ $t('buttons.search') }}</el-button>
    </el-row>
  </el-header>
</template>

<script>
export default {
  name: 'Searchmodel',
  props: {
    message: {
      type: [Object],
      require: true,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      device: '',
      username: ''
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
