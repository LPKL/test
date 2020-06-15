import { debounce } from '@/utils'

export default {
  mounted() {
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      } else if (this.charts && Array.isArray(this.charts) && this.charts.length > 0) {
        this.charts.forEach(c => {
          c.resize()
        })
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.__resizeHandler)
  }
}
