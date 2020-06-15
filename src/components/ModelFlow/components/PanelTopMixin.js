import { getOneModelProject, getAllProject, addDataProject, deleteManageProject, upDateModelProject } from '@/api/experiment'

import rules from '@/utils/rules'
export default {
  data() {
    return {
      prOptions: [], // 全部设备文件包括其下的项目
      projects: null, // 当前项目
      proj: [], // 当前选择的设备下所有流程
      addDProject: false,
      addData: {
        name: '',
        description: '',
        user_id: this.$store.getters.id
      },
      addPipline: { name: '', description: '' },
      formLabelWidth: '120px',
      idx: null,
      rules,
      status: false,
      adddialogShow: false,
      addPiplineShow: false,
      panel: null,
      curop: 'add',
      options: {
        delete: {
          confirm: () => { return this.$confirm(this.$t('strings.flow.delete_flow'), this.$t('labels.reminder'), confirm)},
          req: (name) => {
            deleteManageProject(this.$store.getters.curProId).then(res=>{
              this.getAll()
              this.$message.success(this.$t('messages.delete_success'))
            })
          }
        },
        update: {
          confirm: () => { return true },
          req: (name) =>{ this.resetProject(name) }
        }
      }
    }
  },

  created() {
    const tempid = this.$store.getters.curProId
    let proId = null
    // 获取所有设备和文件及其所有对应流程
    typeof tempid === 'string' ? proId = parseInt(tempid) : proId = tempid
    this.getAll(proId)
  },

  methods: {
    // 获取当前用户所有的项目
    getAll(proId) {
      getAllProject().then(res => {
        const proj = this.proj = res.data.data
        if(Array.isArray(proj) && proj.length){
          proId ? this.projects = proId  : this.projects = proj[0].id
        }else{
          this.projects = null
        }
        //初始化时默认显示第一个项目
      }).catch(e => {
        console.log(e)
        this.$message.error(this.$t('labels.newModel.getFaild'))
      })
    },
    // 添加-重置流程操作
    handelAddProject() {
      this.$refs['addForm'].validate(valid => {
        if (valid) {
          if(this.curop === 'add'){
            this.addProject()
          }else{
            this.resaveProject()
          }
        }
      })
    },

    async handleCommand(command){
      const isYes = await this.options[command]['confirm']()
      isYes && this.options[command]['req'](command)
    },
    /**
     * 重命名　获取项目信息
     * @param name
     */
    resetProject(name){
      this.adddialogShow = true
      this.curop = name
      getOneModelProject(this.$store.getters.curProId).then(res => {
        this.addData = res.data
      }).catch(e => {
        this.$message.error('error')
      })
    },
    /**
     * 重命名请求
     * @param name
     */
    resaveProject() {
      const { name, description } = this.addData
      const id = this.$store.getters.curProId
      upDateModelProject({name: name, description: description}, id).then(res => {
        this.$message.success(this.$t('messages.save_success'))
        this.getAll(id)
        this.adddialogShow = false
      }).catch(e => {
        // console.log(e)
        this.$message.error(e.message)
      })
    },
    /**
     * 添加项目请求
     * @param name
     */
    addProject() {
      const { name, description } = this.addData
      addDataProject({name: name, description: description}).then(res => {
        if (res.status === 201) {
          this.$message.success(this.$t('labels.newModel.success'))
          this.adddialogShow = false
          this.getAll(res.data.id)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch(e => {
        // console.log(e)
        this.$message.error(e.message)
      })
    },

    resetPanelForPipeline(panel){
      let json = JSON.stringify(panel)
      const aIds = Object.keys(panel.nodes)
      aIds.some(item => {
        const tail = parseInt(Math.random(1)*100000000)
        const m = new RegExp(item, 'g')
        json = json.replace(m, item+'_'+tail)
      })
      return JSON.parse(json)
    }
  }
}
