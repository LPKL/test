<template>
  <transition name="fade">
    <div v-if="visible" :class="wrapClass" :style="style">
      <i :class="iconClass" />
      <span class="content">{{ txtContent }}</span>
      <a v-if="doneRouter && state ==='done'" class="noti-done-link" @click="redirectTo">{{ doneRouter.linkText || '立即查看' }}</a>
      <a v-if="btn && btn.visible || state === 'fail'" class="btn" @click="handleClose">{{ btn.text || '确定' }}</a>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MutualNotifier',
  props: {
    content: { // 初始文本
      type: String,
      default: ''
    },
    btn: { // 确定按钮
      type: Object,
      default: () => { return { visible: true, text: '确定' } }
    },
    status: { // 状态
      type: String,
      default: 'running'
    },
    doneRouter: { // 成功跳转配置，e.g.{ linkText: '立即查看', path: '/dfilemanage', param: null }
      type: Object,
      default: null
    },
    // { type: 'example', operate: 'someAction'}
    mutex: { // 互斥体
      type: Object,
      default: null
    }
  },
  data() {
    return {
      visible: true,
      state: 'running',
      txtContent: ''
    }
  },
  computed: {
    style() {
      return {}
    },
    wrapClass() {
      return `mutual-${this.state} mutual-notification`
    },
    iconClass() {
      return this.state === 'running' ? 'noti-info el-icon-info'
        : (this.state === 'done' ? 'noti-done el-icon-success' : 'noti-fail el-icon-error')
    }
  },
  watch: {
    '$props.status': {
      handler: function(newer, older) {
        this.state = newer
        this.$emit('stateChange', this, newer)
      }
    },
    '$props.content': {
      handler: function(newer, older) {
        this.txtContent = `${newer}中...`
      },
      immediate: true
    }
  },
  methods: {
    handleClose(e) {
      e.preventDefault()
      this.$emit('close', this)
    },
    success(msg) {
      if (!msg) {
        msg = `${this.content}成功！`
      }
      this.updateStatus('done', msg)
    },
    error(err) {
      err = `${this.content}失败！[${err}]`
      this.updateStatus('fail', err)
    },
    updateStatus(newState, content) {
      this.state = newState
      this.txtContent = content
      this.$emit('stateChange', this, newState)
    },
    redirectTo() {
      // this.$router.push({ path: this.doneRouter.path })
      this.$emit('redirect', this, this.doneRouter)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.mutual-notification{
  position: fixed;
  z-index: 9999;
  display: flex;
  background-color: #ffffff;
  color: #333;
  border-radius: 6px;
  align-items: center;
  padding: 20px;
  min-width: 280px;
  box-shadow: 0px 2px 4px -1px rgba(61,101,201,0.2), 0px 4px 8px 0px rgba(61,101,201,0.8);
  flex-wrap: wrap;
  transition: all .3s;
  &.mutual-done{
    box-shadow: 0px 2px 4px -1px rgba(74, 175, 124,0.2), 0px 4px 8px 0px rgba(74, 175, 124,0.8);
    .btn{
      background: #4aaf7c;
      &:hover{
        background: #85ce61;
      }
    }
  }
  &.mutual-fail{
    box-shadow:0px 2px 4px -1px rgba(245,108,108,0.2), 0px 4px 8px 0px rgba(245,108,108,0.8);
    .btn{
      background:#f56c6c;
      &:hover{
        background: #f78989;
      }
    }
  }
  i {
    font-size: 28px;
    margin-right: 10px;
  }
  .noti-info{
    color: #3d65c9;
  }
  .noti-done{
    color:#4aaf7c;
  }
  .noti-fail{
    color:#f56c6c;
  }
  .content{
    padding: 0;
  }
  .btn{
    color: #ffffff;
    padding: 6px 24px;
    margin-left: 24px;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: #3d65c9;
    &:hover{
      background: #6484d4;
    }
  }
  .noti-done-link{
    cursor: pointer;
    color: #6484d4;
    font-size: 16px;
    margin: 0 12px;
  }
}

.fade-enter-active, .fade-leave-active{
  transition: opacity .5s
}
.fade-enter, .fade-leave-to{
  opacity: 0
}
</style>

