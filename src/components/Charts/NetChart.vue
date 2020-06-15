<!--
  神经网络可视化组件实现
  高宽固定
  组件还未完成
  -->
<template>
  <canvas id="netCanvas" width="800" height="600"/>
</template>

<script>
export default {
  name: 'NetChart',
  props: {
    netLayer: {
      type: Array,
      default: null
    },
    netText: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      networkLayer: [4, 6, 7, 8, 7, 6, 4],
      networkText: ['text1', 'text2', 'text2', 'text2', 'text2', 'text2', 'text2'],
      xlocal: [],
      maxY: 0,
      title: '神经网络可视化组件实现',
      bias: false
    }
  },
  mounted() {
    this.draw()
  },
  methods: {
    draw() {
      const canvas = document.getElementById('netCanvas')
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.width * 0.6 // 图宽度
      const height = canvas.height * 0.9 // 图高度
      canvas.style.backgroundColor = 'rgba(255, 255, 255, 1.0)'
      ctx.font = '15px Arial'
      const networkLayer = this.networkLayer
      // const bias = false

      const maxNeuronNumInLayer = Math.max.apply(Math, networkLayer)
      const neuronSize = width / maxNeuronNumInLayer
      const radius = this.getRadiusSize(neuronSize)

      const intervalVertical = (width - maxNeuronNumInLayer * radius * 2) / maxNeuronNumInLayer
      const interval = height / (networkLayer.length - 1) - radius

      let x = radius + 100
      let y = 0
      const temp = []
      const neuronLocationPerLayer = []
      for (let i = 0, len = networkLayer.length; i < len; i++) {
        const thisLayerNeuronLocation = []
        const number = networkLayer[i]
        y = (width - number * neuronSize) / 2 + radius + intervalVertical
        for (let i = 0; i < number; ++i) {
          this.drawCircle(ctx, y, x, radius, 'white')
          thisLayerNeuronLocation.push([y, x])
          y += (radius * 2 + intervalVertical)
        }
        this.xlocal.push(x)
        temp.push(y)
        neuronLocationPerLayer.push(thisLayerNeuronLocation)
        x += interval
      }
      for (let i = 0; i < networkLayer.length - 1; i++) {
        const firstLayer = neuronLocationPerLayer[i]
        const secondLayer = neuronLocationPerLayer[i + 1]
        for (let j = 0, len = firstLayer.length; j < len; j++) {
          const firstX = firstLayer[j][0]
          const firstY = firstLayer[j][1]
          for (let k = 0, klen = secondLayer.length; k < klen; k++) {
            var secondX = secondLayer[k][0]
            var secondY = secondLayer[k][1]
            // 画线
            this.drawLineArrow(ctx, firstX, firstY + radius, secondX, secondY - radius)
          }
        }
      }
      this.maxY = Math.max(...temp) // 找到最大值
      this.setText(ctx) // 设置文字
    },
    // 神经元样式
    drawCircle(context, centerX, centerY, radius, color, txt) {
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
      context.fillStyle = color // 填充颜色
      context.fill()
      context.lineWidth = radius / 20 // 边框宽度
      context.strokeStyle = '#409EFF'// 边框颜色
      context.stroke()
    },
    // 神经元（半径）随层数的增加而改变
    getRadiusSize(neuronSize) {
      const n = this.networkLayer.length / 5
      return neuronSize / (2.5 * (n < 1 ? 1 : n))
    },
    // 连线样式
    drawLineArrow(ctx, x1, y1, x2, y2) {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = '#409EFF'
      ctx.stroke()
    },
    // 插入文字
    setText(ctx) {
      ctx.font = '18px serif'
      ctx.fillStyle = '#555'
      ctx.fillText(this.title, 160, 60)
      for (let i = 0, len = this.networkText.length; i < len; i++) {
        ctx.fillText(this.networkText[i], this.maxY, this.xlocal[i])
      }
    }
  }
}
</script>

<style scoped>

</style>
