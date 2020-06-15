<template>
  <el-row>
    <el-col :span="24">
      <el-card :body-style="{ padding: '0px' }">
        <div slot="header">
          <span>{{ $t('labels.flow.run_logs') }}</span>
          <el-button size="mini" @click="clearPrint()" circle>clear</el-button>
          <el-button style="float: right;" size="mini" :icon="buttonicon" @click="showhidedev()" circle></el-button>
        </div>
        <transition-group tag="div" name="list" class="work-footer-item" id="msg" style="display: block">
          <div v-for="(item, key) in messagews" :key="key" class="list-item">
            <p v-if="item.sqlmsg">{{item.sqlmsg}}</p>
            <p v-for="item in item.print">{{item}}</p>
          </div>
        </transition-group>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'PanelFooter',
  props:{
    messagews:{
      type:Array,
      default:null
    }
  },
  filters:{
    getNodeLabel(id){
      let node = document.getElementById(id)
      return node.innerText
    }
  },
  data(){
    return {
      isUp:false,//鼠标是否已经抬起
      isDown:false,　//鼠标是否已经按下,
      buttonicon: 'el-icon-arrow-down',
      buttontitle: this.$t('buttons.flow.up'),
      clientWidth: $(window).width()
    }
  },
  methods: {
    // 运行日志区域的展开和收起控制
    showhidedev() {
      const msgdiv = document.getElementById('msg')
      const work_panel = document.getElementById('work_panel').parentElement
      const { style } = msgdiv
      const wpStyle = work_panel.style
      wpStyle.height = 'calc(100% - 57px)'
      if (msgdiv) {
        if (style.display=='block') {
          $('#msg').slideUp()
          this.buttonicon = 'el-icon-arrow-up'
          this.buttontitle = this.$t('buttons.flow.expand')
        }else {
          $('#msg').slideDown()
          this.buttonicon = 'el-icon-arrow-down',
          this.buttontitle = this.$t('buttons.flow.up')
        }
      }
    },
    clearPrint(){
      this.$emit('call', 'clear')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    .work-footer{
      #nsresize{
        height: 3px;
        background-color: #dcdfe6;
        cursor: ns-resize;
      }
      &-item{
        height: 130px;overflow-y: auto;
      }
    }

    .list-enter-active {
      transition: all .3s ease;
    }
    .list-leave-active {
      transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .list-enter, .list-leave-to
      /* .slide-fade-leave-active for below version 2.1.8 */ {
      transform: translateX(10px);
      opacity: 0;
    }
</style>
