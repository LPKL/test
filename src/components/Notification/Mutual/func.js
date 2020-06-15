import Notification from './mutualNotifier'

export default {
  extends: Notification,
  data() {
    return {
      verticalOffset: 0, // 距离窗体上边缘距离
      autoClose: false, // 自动关闭, false 或 3000ms
      autoCloseOnSuccess: false // 成功后自动关闭， false 或 3000ms
    }
  },
  computed: {
    style() {
      return {
        position: 'fixed',
        right: '20px',
        top: `${this.verticalOffset}px`
      }
    }
  },
  mounted() {
    this.createTimer()
  },
  beforeDestory() {
    this.clearTimer()
  },
  methods: {
    createTimer() {
      if (this.autoClose) {
        this.timer = setTimeout(() => {
          this.visible = false
        }, this.autoClose)
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
    }
  }
}
