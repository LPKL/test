<!--
 * @author cuichuanwa
 * @date 19-11-20 上午9:46
 * @description 数据探查轴心轨迹和频谱图下方时间轴
 -->
<template>
  <div :style="'width:'+$attrs.width+'px;height:'+$attrs.height+'px;'" class="canvas">
    <canvas :id="canvasid" :width="$attrs.width" :height="$attrs.height"/>
    <div class="boldtime">
      <span>{{ times[0] }}</span>
      <span>{{ times[times.length-1] }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeSelect',
  props: {
    times: {
      type: Array,
      request: true,
      default: () => { return [] }
    },
    isload: {
      type: Boolean,
      default: false
    },
    canvasid: {
      type: Number,
      request: true,
      default: 10
    },
    onetime: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currtime: '',
      ish: false,
      panel: null
    }
  },
  watch: {
    currtime: async function(newer) {
      // 时间变化调用父组件请求
      this.ish = true
      await this.$emit('pagechange', newer)
      this.ish = false
    },
    '$props.onetime': function(newer) {
      // 防止重复渲染
      if (!this.ish) {
        this.$nextTick(() => {
          this.panel.getCurrentTimeWidth(newer, this.$props.times[newer])
        })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.panel = this.selectTimePanel()
      this.panel.init()
    })
  },
  methods: {
    selectTimePanel() {
      // 注意this指向
      const self = this
      const width = this.$attrs.width
      const height = this.$attrs.height
      const padding = 30
      const ctxHeight = height / 3
      const lineHeight = ctxHeight * 2
      const textHeight = ctxHeight - 2
      const time = this.$props.times
      const canvas = document.getElementById(this.$props.canvasid)
      const selectTimePanel = {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        iconPath: [0, 0, 0, 0],
        isInIcon: false, // 是否在icon内
        curiconx: null, // 在icon内 鼠标按下时x坐标
        isUp: true, // 鼠标抬起标志
        icon: null,
        speed: 8, // 移动速度
        curtime: '',
        init() {
          if (!this.canvas.getContext) return
          this.drawpanel()
          this.drawpath()
          this.drawtext(time[0], 0)
          this.drawImg(padding - 10)
          this.addListener(this.canvas)
        },
        // 绘制面板
        drawpanel() {
          this.ctx.fillStyle = '#ecf0fa'
          this.ctx.fillRect(padding, ctxHeight, width - padding * 2, ctxHeight)
        },
        // 绘制线段
        drawpath() {
          this.ctx.beginPath()
          this.ctx.moveTo(padding, ctxHeight)
          this.ctx.lineTo(padding, lineHeight)
          this.ctx.strokeStyle = '#3f66cb'
          this.ctx.lineWidth = 1
          this.ctx.moveTo(width - padding, ctxHeight)
          this.ctx.lineTo(width - padding, lineHeight)
          this.ctx.stroke()
          this.ctx.closePath()
        },
        // 绘制文字
        drawtext(text, left) {
          if (text) {
            this.curtime = text
          }
          this.ctx.fillStyle = '#000' // 文字填充颜色
          this.ctx.font = '12px Adobe Ming Std'
          this.ctx.textAlign = 'left'
          this.ctx.textBaseline = 'bottom'
          this.ctx.fillText(text, left - 25, textHeight)
        },
        // 绘制图标
        drawImg(left) {
          const img = new Image()
          img.onload = function() {
            this.ctx.drawImage(img, left, lineHeight, 20, 28)
          }.bind(this)
          img.src = window.location.origin + '/static/images/icon/hover.svg'
          this.iconPath = [left, lineHeight, left + 20, lineHeight + 28]
          this.icon = img
          this.drawLight(left)
        },
        // 绘制icon上方光标
        drawLight(left) {
          this.ctx.beginPath()
          this.ctx.moveTo(left + 10, ctxHeight)
          this.ctx.lineTo(left + 10, lineHeight)
          this.ctx.strokeStyle = '#d4475e'
          this.ctx.lineWidth = 2
          this.ctx.stroke()
          this.ctx.closePath()
        },
        // 获取下标
        getCurrentTimeIndex(left) {
          //  console.log(baif)
          // 1每份所占多少
          // 2当前所在位置/每份所占 取整之后就是所在
          const onebaif = Math.floor((width - padding * 2) / time.length)
          return Math.floor((left - 20) / onebaif)
        },
        // 获取时间下标宽度
        getCurrentTimeWidth(index, t) {
          const left = (index + 1) * ((width - padding * 2) / time.length) + padding
          // this.drawImg(left)
          this.resetDrawInit2(left, t)
        },
        resetDrawInit(left) {
          this.ctx.clearRect(0, 0, width, height)
          this.drawpanel()
          this.drawpath()
          const temp = time[this.getCurrentTimeIndex(left)]
          if (temp) {
            this.drawtext(temp, left - padding + 10)
            self.currtime = temp
          } else {
            this.drawtext(this.curtime, left - padding + 10)
            self.currtime = this.curtime
          }
          this.ctx.drawImage(this.icon, left, lineHeight, 20, 28)
          this.drawLight(left)
          this.getCurrentTimeIndex(left)
          this.iconPath = [left, lineHeight, left + 20, lineHeight + 28]
        },
        resetDrawInit2(left, t) {
          this.ctx.clearRect(0, 0, width, height)
          this.drawpanel()
          this.drawpath()
          const temp = t
          this.drawtext(temp, left - padding + 10)
          this.ctx.drawImage(this.icon, left, lineHeight, 20, 28)
          this.drawLight(left)
          this.getCurrentTimeIndex(left)
          this.iconPath = [left, lineHeight, left + 20, lineHeight + 28]
        },
        // 监听鼠标
        addListener(el) {
          const _this = this
          // 鼠标按下
          el.addEventListener('mousedown', function(event) {
            const x = event.offsetX
            // const y = event.offsetY
            _this.isUp = false
            if (_this.isInIcon) {
              _this.curiconx = x
            }
          }, false)
          // 鼠标移动
          el.addEventListener('mousemove', function(event) {
            const x = event.offsetX
            const y = event.offsetY
            if (((_this.iconPath[0] < x && x < _this.iconPath[2]) && (_this.iconPath[1] < y && y < _this.iconPath[3])) || !_this.isUp) {
              _this.isInIcon = true // 进入icon范围
              // 按下时记录x值 然后移动时 实时比对移动了多少 超出不进行计算
              // 移动了多少 重新绘制
              if (_this.curiconx) {
                const offsetx = x - _this.curiconx
                const left = _this.iconPath[0] + offsetx
                // todo 移动速度和边界检测 并判断数据是否已经加载完成
                if (left > _this.speed && left >= (padding - 10) && left <= (width - padding - 10) && !self.$props.isload) {
                  _this.resetDrawInit(left) // 重绘
                }
                _this.curiconx = x
              }
            } else {
              _this.curiconx = null
              _this.isInIcon = false // 离开icon范围
            }
            // todo 当鼠标在一个极短的时间内移动速度特别快时 并且超出了icon坐标但鼠标还未抬起 则icon继续跟随鼠标移动
            if (x <= 10 || x >= width - 10 || y <= 5 || y >= height - 1) {
              _this.isUp = true
              _this.isInIcon = false
              _this.curiconx = null
            }
          }, false)
          // 鼠标放开
          el.addEventListener('mouseup', function(event) {
            // const x = event.offsetX
            // const y = event.offsetY
            _this.isInIcon = false
            _this.isUp = true
            _this.curiconx = null
          }, false)
        }
      }
      return selectTimePanel
    }
  }
}
</script>

<style  rel="stylesheet/scss" lang="scss" scoped>
  canvas {
    /* border: 1px dashed red; */
    cursor: pointer;
    z-index: 10;
    position: absolute;
  }
  .canvas{
    position: relative;
  }
  .canvas .boldtime {
    position: absolute;
    bottom: 28px;
    width: 100%;
    z-index: 0;
  }
  .canvas span{
    width: 60px;
    font-size: 10px;
    word-break: break-all;
    text-align: center;
    user-select: none;
  }
  .canvas .boldtime > span:last-child{
    position:absolute;
    right: 0;
  }
  .canvas .boldtime > span:first-child{
    position:absolute;
    left: 0;
  }
</style>
