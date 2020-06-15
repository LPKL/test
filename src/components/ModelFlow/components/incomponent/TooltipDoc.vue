<!--
 * @author cuichuanwa
 * @date 20-4-22 上午10:05
 * @description 参数项右侧提示
 -->
<template>
  <el-tooltip v-if="$attrs.doc" class="item" :content="$attrs.doc" effect="light" placement="top-start">
    <i class="el-icon-info"></i>
  </el-tooltip>
</template>

<script>
  export default {
    name: 'TooltipDoc'
  }
</script>

