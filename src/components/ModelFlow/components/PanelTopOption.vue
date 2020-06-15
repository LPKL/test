<template>
  <el-container >
    <div width="100%">
      <el-select v-is-show="{name:'nselectprocess'}" v-model="projects" :placeholder="$t('strings.flow.select_project')" class="new-input">
        <el-option
          v-for="(item,index) in proj"
          :key="index"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <span v-is-show="{name:'naddflow'}" :title="$t('buttons.add')" @click="showDialogFunc">
        <svg-icon icon-class="flow_add_active" class="svg-add"  />
      </span>

      <div class="op-right" >
        <!-- 1.6暂时隐藏未完成的功能：发布预测实验 -->
        <el-button :type="$attrs.isClick ? 'primary' : ''" style="margin-right: 20px;" size="mini" :disabled="$attrs.isClick ? false : true" @click="postProdExp">{{ $t('buttons.flow.post_prodiction_exp') }}</el-button>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <svg-icon icon-class="flow_set_active" class="svg-set" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command='update'>{{ $t('strings.rename') }}</el-dropdown-item>
            <el-dropdown-item command='delete'>{{ $t('labels.delete') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <router-link to="/manageCenter/dflowmanage" :title="$t('buttons.dflowmanage.allflows')">
          <svg-icon icon-class="flow_next_active" class="svg-next" />
        </router-link>
      </div>
    </div>

    <el-dialog :title="curop === 'add' ? $t('strings.flow.add_flow') : $t('strings.rename')"
      :visible.sync="adddialogShow"
      :close-on-click-modal="false"
      class="new-dialog"
      width="30%"
      :before-close="closeCheck">
      <el-form :model="addData" ref="addForm" :rules="rules" label-width="80px">
        <el-form-item :label="$t('labels.flow.process_name')"  prop="name">
          <el-input v-model.trim="addData.name" width="80%" class="new-input" autofocus ></el-input>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.explain')" prop="description">
          <el-input v-model.trim="addData.description" type="textarea" :rows="2" width="80%" class="new-input" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCheck">{{$t('buttons.cancel')}}</el-button>
        <el-button type="primary" @click="handelAddProject">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('buttons.flow.post_prodiction_exp')"
     :visible.sync="addPiplineShow"
     :close-on-click-modal="false"
     class="new-dialog"
     width="30%"
     :before-close="closeCheck">
      <el-form :model="addPipline" ref="addForm" :rules="rules" label-width="80px">
        <el-form-item :label="$t('strings.dataAbout.name')"  prop="name">
          <el-input v-model.trim="addPipline.name" width="80%" class="new-input" autofocus ></el-input>
        </el-form-item>
        <el-form-item :label="$t('strings.dataAbout.desc')" prop="description">
          <el-input v-model.trim="addPipline.description" type="textarea" :rows="2" width="80%" class="new-input" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCheck">{{$t('buttons.cancel')}}</el-button>
        <el-button type="primary" @click="handelAddPipline">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import PanelTopMixin from './PanelTopMixin'
import rules from '@/utils/rules'
import { createPipeline } from '@/api/experiment/pipelines'

export default {
  name: 'PanelTopOption',
  mixins: [ PanelTopMixin ] ,
  data() {
    return {
      rules: {
        name: rules.project_zname
      }
    }
  },
  watch:{
    idx(){
      // 改变设备和文件时　改变一些状态
      this.proj = this.prOptions[this.idx].children
      this.jzs = this.prOptions[this.idx].id
      if(this.status){
        this.$store.dispatch('setJzid', this.jzs)
        this.projects = this.$store.getters.curProId*1
        this.$store.dispatch('setProid', this.projects)
        this.status = false
        return
      }
      if(this.proj.length){
        this.$store.dispatch('setJzid', this.jzs)
        this.projects = this.proj[0].id
        this.$store.dispatch('setProid', this.projects)
      }else{
        this.projects = null
        this.$store.dispatch('setProid', null)
      }

    },
    projects(msg){
      this.$store.dispatch('setProid', msg)
    }
  },
  methods: {
    showDialogFunc() {
      this.adddialogShow = true
      this.curop = 'add'
      this.$nextTick(() => {
        this.$refs['addForm'].resetFields()
      })
    },
    closeCheck(){
      if (this.adddialogShow) {
        this.$refs['addForm'].resetFields()
        this.adddialogShow = false
      } else {
        this.$refs['addForm'].resetFields()
        this.addPiplineShow = false
      }
    },
    async postProdExp(){
      this.panel = null
      const { mflow: { piplineDraw }} = this.$store.state
      if(!piplineDraw) {
        this.$message.warning(this.$t('buttons.flow.sava_pipline_err1'))
        return false
      }
      // if(this.$attrs.runId){
      //   this.$message.warning(this.$t('strings.flow.piperuning'))
      //   return false
      // }
      const { nodes } = piplineDraw
      if(Object.values(nodes).length < 2){
        this.$message.warning(this.$t('buttons.flow.sava_pipline_err2'))
        return false
      }
      const isRuned = await this.isAllNodeRuned(nodes)
      if(isRuned){
        this.panel = piplineDraw
        this.addPiplineShow = true
        console.log('可以发布预测实验', piplineDraw)
      }else{
        this.$message.warning(this.$t('messages.flow.postexperiment_err'))
      }
    },
    isAllNodeRuned(n){
      const nodes = Object.values(n)
      return nodes.every(item => {
        if(item.status === '2'){
          return true
        }else{
          return false
        }
      })
    },
    async handelAddPipline() {
      try {
        if(this.panel){
          const res = await createPipeline({ experiment_id:this.$store.getters.curProId, panel: this.resetPanelForPipeline(this.panel), ...this.addPipline })
          this.addPiplineShow = false
          this.$emit('updateTree')
          this.$message.success('保存成功!')
          this.$refs['addForm'].resetFields()
        }
      } catch (e) {
        console.log(e)
        this.addPiplineShow = false
        this.$message.error(e.message)
      }
    },
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  $iconColor: #419cfa;
  .el-container{
    background-color: #fff;
    position: relative;
    &>div{
      &:first-child{
        .el-select{
          margin-right: 10px;
        }
        line-height: 60px;
      }
      i{
        color: $iconColor;
        font-weight: bold;
        cursor: pointer;
        font-size: 18px;
        &:hover{
          color: rgba($iconColor,0.8);
        }
        &.el-icon-l{
          cursor: default;
          transform: rotate(90deg);
          opacity: 0;
          &:hover{
            color: $iconColor;
          }
        }
      }
    }
    .op-right{
      position: absolute;
      right: 0;
      line-height: 60px;
      top: 0;
    }
    .svg-add,.svg-set,.svg-next{
      cursor: pointer;
      font-size: 22px;
      position:relative;
      top: 6px;
    }

  }

</style>
