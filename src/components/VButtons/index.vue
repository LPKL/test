<!--竖向按钮组-->
<template>
  <div class="vertical-button-group">
    <div v-for="(item, index) of buttons" :key="item.key" :type="item.type" class="btn-vertical" @click="itemclicked(item,index)" >{{ item.label }}</div>
  </div>
</template>

<script>
/**
 *  cfgBtns：按钮配置项，itemClick 点击事件
 *  cfgBtns:[{ type: primary , key:'0', label: 'button label'}]
*/
export default {
  name: 'VButtons',
  props: {
    cfgBtns: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      buttons: []
    }
  },
  watch: {
    '$props.cfgBtns': {
      handler: function(newer, older) {
        this.buttons = newer
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    itemclicked(item, idx) {
      const activeItem = this.buttons.find(c => c.type === 'primary')
      const activeIndex = this.buttons.indexOf(activeItem)

      if (activeItem && activeIndex >= 0) {
        // 如果点击的是activeItem，直接返回
        if (activeItem.key === item.key) { return false }
        activeItem.type = 'normal'
        this.$set(this.buttons, activeIndex, activeItem)
      }

      item.type = 'primary'
      this.$set(this.buttons, idx, item)
      this.$emit('itemClick', item.key)
    }
  }
}
</script>

<style lang="scss" scoped>
.vertical-button-group{
  .btn-vertical{
    width: 22px;
    margin-top: 2px;
    line-height: 16px;
    font-size: 12px;
    color: #ffffff;
    padding: 1em 0;
    word-wrap: break-word;
    text-align: center;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    &[type="normal"]{
      background: #ECF5FF;
      color:#66b1ff;
      border-color: #66b1ff;
      &:hover{
        background: #66b1ff;
        color: #fff;
      }
    }
    &[type="primary"]{
      background-color: #3d65c9;
      border-color: #3d65c9;
      color: #fff;
      &:hover{
        background: #66b1ff;
      }
    }
  }
}
</style>
