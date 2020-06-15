<template>
  <div>
    <el-container class="app_container">
      <el-header class="filter_header" style="text-align: left;margin-top:10px; font-size: 12px; display: inline-table;">
        <div class="filter-container">
          <el-input v-model="sFilterText" :placeholder="$t('strings.alg.search')" suffix-icon="el-icon-search" class="el-fault_device"/>
        </div>
      </el-header>
      <el-main class="main_container">
        <div class="custom-tree-container">
          <el-tree
            v-loading="isLoading"
            ref="tree"
            :data="oAlgTreeData"
            :props="oAlgTreeDefaultProps"
            :expand-on-click-node="false"
            :default-expanded-keys="defaultExpandKey"
            :filter-node-method="filterNode"
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
            node-key="unique_id"
            highlight-current
            draggable
            @node-drag-end="handleDragEnd"
            @node-drop="handleDrop">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span><i :class="(typeof data.type != 'undefined' && data.type == 'func') ? 'el-icon-document': 'el-icon-menu'"/>{{ node.label }}</span>
              <span>
                <el-button v-is-show="{name:'AlgorithmEdit'}" size="mini" type="primary" class="el-icon-edit" @click="jumpEditAlgPage(node, data)">{{ $t('buttons.edit') }}</el-button>
                <el-button v-is-show="{name:'AlgorithmView'}" v-if="(typeof data.type != 'undefined' && data.type == 'func')" size="mini" type="warning" class="el-icon-view new-btn-other" @click="jumpViewAlgPage(node, data)">{{ $t('buttons.detail') }}</el-button>
                <!-- 只有是目录下才能“增加”子节点，如果是算法等不能在其下增加子节点 -->
                <el-button v-show="!(typeof data.type != 'undefined' && data.type == 'func')" size="mini" type="info" class="el-icon-plus new-btn-other" @click="openCreateTypeSelectDialog(data)">{{ $t('buttons.create') }}</el-button>
                <el-button v-is-show="{name:'AlgorithmDelete'}" v-show="typeof data.children == 'undefined' || !data.children" size="mini" type="danger" class="el-icon-delete new-btn-other" @click="openDeleteDialog(node, data)">{{ $t('buttons.delete') }}</el-button>
              </span>
            </span>
          </el-tree>
        </div>
        <el-dialog :visible.sync="updateDialogFormVisible" :close-on-click-modal="false" :title="updateDialogType == 0 ? $t('buttons.create') : $t('buttons.edit')" :before-close="updateDialogFormClose" class="new-dialog">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px" style="width: 400px; margin-left:50px;" >
            <el-form-item v-if="updateDialogType == 0" :label="$t('labels.parent_name')" prop="parent_name">
              <el-input v-model="temp.parent_name" :disabled="true" class="new-input"/>
            </el-form-item>
            <el-form-item :label="$t('labels.alg.node_zname')" prop="node_zname" >
              <el-input v-model="temp.node_zname" class="new-input"/>
            </el-form-item>
            <el-form-item :label="$t('labels.alg.node_name')" prop="node_name">
              <el-input v-model="temp.node_name" class="new-input"/>
            </el-form-item>
            <el-form-item :label="$t('labels.alg.type')" prop="type">
              <el-input v-model="temp.type" :disabled="temp.config === 'public' ? false : true" class="new-input"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="updateDialogFormClose">{{ $t('buttons.cancel') }}</el-button>
            <el-button type="primary" @click="updateFolderData()">{{ $t('buttons.confirm') }}</el-button>
          </div>
        </el-dialog>
        <el-dialog :close-on-click-modal="false" :visible.sync="createTypeDialogVisible" :title="$t('strings.alg.dialog_title1')" class="new-dialog">
          <span>{{ $t('strings.alg.dialog_detail1') }} </span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="openCreateFolderDialog()">{{ $t('buttons.alg.folder') }}</el-button>
            <el-button @click="jumpCreateAlgPage()">{{ $t('buttons.alg.alg') }}</el-button>
          </span>
        </el-dialog>
        <!-- 拖拽改变结构，要弹出确认框 -->
        <el-dialog :close-on-click-modal="false" :visible.sync="draggDropDialogFormVisible" :title="$t('strings.alg.dialog_title2')" class="new-dialog">
          <span>"{{ drapTemp.current_name }}" {{ $t('strings.alg.dialog_detail2') }} "{{ drapTemp.parent_name }}"</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dropCancel()">{{ $t('buttons.cancel') }}</el-button>
            <el-button type="primary" @click="dropConfirm()">{{ $t('buttons.confirm') }}</el-button>
          </span>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { postAlgorithmTreeData, postAlgorithmData, postAlgorithmTreeFolderNodeData } from '@/api/algorithm'

export default {
  name: 'AlgorithmTree',
  data() {
    return {
      sFilterText: '',
      oAlgTreeData: null,
      // id: 1000,
      oAlgTreeDefaultProps: {
        children: 'children',
        label: 'node_zname'
        // id: 'unique_id'
      },
      updateDialogFormVisible: false,
      createTypeDialogVisible: false,
      updateDialogType: 0, // 0是创建，1是编辑,
      draggDropDialogFormVisible: false,
      temp: {
        id: undefined,
        node_zname: '',
        node_name: '',
        type: '',
        parent_id: 0,
        parent_name: '',
        data: null,
        config: '',
        unique_id: 0
      },
      drapTemp: {
        parent_id: 0,
        current_id: 0,
        parent_name: '',
        current_name: '',
        sibling_id: 0, // 在位置前的节点
        dropType: '',
        config: '',
        parent_unique_id: 0,
        current_unique_id: 0
      },
      rules: {
        node_zname: [
          { required: true, message: this.$t('rules.require_name'), trigger: 'blur' }
        ],
        node_name: [
          { required: true, message: this.$t('rules.require_name'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('rules.require_name'), trigger: 'blur' }
        ]
      },
      defaultExpandKey: [],
      isLoading: true,
      // public_schema: null,
      // private_schema: null,
      // custom_schema: null,
      // algListData: null,
      expandid: 0 // 使用tree中的node-key
    }
  },
  watch: {
    sFilterText(val) {
      this.$refs.tree.filter(val)
    },
    '$route'(to, from) {
      console.log('watch route', to.path, from.path)
      // 监听路由变化，当创建和编辑算法后进入了新界面，在新界面提交保存，并返回上一级，本界面监听到路由变化后，刷新数据,this.expandid是在进入新界面之前保存的父节点数据
      if (to.path === '/algmanagement/index') {
        this.getTree(this.expandid)
      }
    }
  },
  created() {
    this.getPageTableData()
    // 创建时使用跟随列表一起获得schema
    // if (this.$route.query.expand !== null && typeof this.$route.query.expand !== undefined) {
    //   this.expandid = this.$route.query.expand
    // }
    this.getTree(this.expandid)
  },
  methods: {
    getPageTableData: function() {
      // 若采用从后台动态获取schema，则启用以下代码。现阶段采用本地schema
      // getAlgorithmData({ 'config': 'public' }).then(res => {
      //   this.public_schema = res.data.schema
      // }).catch(error => {
      //   console.log('getAlgorithmData public error:', error)
      // })
      // getAlgorithmData({ 'config': 'private' }).then(res => {
      //   this.private_schema = res.data.schema
      // }).catch(error => {
      //   console.log('getAlgorithmData private error:', error)
      // })
      // getAlgorithmData({ 'config': 'custom' }).then(res => {
      //   this.custom_schema = res.data.schema
      // }).catch(error => {
      //   console.log('getAlgorithmData custom error:', error)
      // })
    },
    getTree(expand_id) {
      postAlgorithmTreeData().then(res => {
        this.oAlgTreeData = res.data
        if (expand_id !== 0) {
          // 更新数据后，展开上级
          this.defaultExpandKey = [expand_id]
        }
        this.isLoading = false
      }).catch(error => {
        console.log('postAlgorithmTreeData error:', error)
        this.isLoading = false
      })
    },
    filterNode(value, data) {
      // 只将有结果的返回显示
      if (!value) return true
      return data.node_zname.indexOf(value) !== -1
    },
    // 算法配置详情界面，界面内容与编辑界面相同，但所有输入框为只读状态
    jumpViewAlgPage(node, data) {
      this.expandid = node.parent.data.unique_id
      // this.$router.push({ path: '/algmanagement/view/' + data.id })
      this.$router.push({ path: '/algmanagement/view', query: { config: data.config, id: data.id }})
    },
    // 当选中项是目录时，弹出目录信息修改弹框，当选中项是算法时，进入算法配置编辑界面，所有输入框为可编辑状态，并显示提交按钮
    jumpEditAlgPage(node, data) {
      if (typeof data.type != 'undefined' && data.type === 'func') { // eslint-disable-line
        // 是算法，进入算法编辑界面
        this.expandid = node.parent.data.unique_id
        // this.$router.push({ path: '/algmanagement/edit/' + data.id })
        this.$router.push({ path: '/algmanagement/edit', query: { config: data.config, id: data.id }})
      } else {
        // 是目录，编辑内容是目录的名称等（弹框编辑）
        this.temp.id = data.id
        this.temp.node_name = data.node_name
        this.temp.node_zname = data.node_zname
        this.temp.type = data.type
        this.temp.data = data
        this.temp.parent_id = data.parent_id
        this.temp.config = data.config
        this.updateDialogType = 1
        this.updateDialogFormVisible = true
      }
    },
    // 创建类别选择弹框，选择算法 or 目录
    openCreateTypeSelectDialog(data) {
      this.temp.id = -1
      this.temp.node_name = ''
      this.temp.node_zname = ''
      // this.temp.type = typeplacehold
      this.temp.data = data
      this.temp.parent_id = data.id
      this.temp.parent_name = data.node_zname
      this.temp.config = data.config
      this.temp.unique_id = data.unique_id
      // this.createTypeDialogVisible = true
      // let typeplacehold = 'alg'
      if (data.config === 'private') {
        this.temp.type = 'pri_alg'
        this.createTypeDialogVisible = true
      } else if (data.config === 'custom') {
        this.temp.type = 'cus_alg'
        this.jumpCreateAlgPage() // 自定义模块下不可以创建目录
      } else {
        this.temp.type = 'alg'
        this.createTypeDialogVisible = true
      }
    },
    // 是算法，进入算法创建界面
    jumpCreateAlgPage() {
      this.createTypeDialogVisible = false
      // 创建完算法返回后，watch监听route，重新获取tree并展开this.temp.parent_id节点
      this.expandid = this.temp.unique_id
      // this.$router.push({ path: '/algmanagement/create', query: { config: this.temp.config, schema: this.schema, modelid: this.temp.parent_id }})
      this.$router.push({ path: '/algmanagement/create', query: { config: this.temp.config, modelid: this.temp.parent_id }})
    },
    // 是目录，创建内容是目录的名称等（复用弹框编辑）
    openCreateFolderDialog() {
      this.updateDialogType = 0
      this.updateDialogFormVisible = true
      this.createTypeDialogVisible = false
    },
    // 点击删除按钮，根据目录/算法分别提示
    openDeleteDialog(node, data) {
      const parentnode = node.parent.data.id
      if (typeof data.type != 'undefined' && data.type === 'func') { // eslint-disable-line
        // 是算法，删除算法请求
        // const alldatalist = this.algListData
        this.$confirm(this.$t('strings.alg.delete_alg'), this.$t('labels.reminder'), confirm).then(() => {
          postAlgorithmData({ 'op': 'D', 'id': data.id, 'config': data.config }).then(res => {
            // const temp = this.algListData.splice(alldatalist.findIndex(item => item.id === data.id), 1)
            // temp && this.$message({
            //   type: 'success',
            //   message: this.$t('messages.delete_success')
            // })
            this.$message.success(this.$t('messages.delete_success'))
            this.getTree(node.parent.data.unique_id)
            // 算法节点没有parent_id,通过node.parent获取父节点目录
          }).catch(error => {
            console.log('alg tree delete alg error:', error)
            this.$message.error(this.$t('messages.delete_failed'))
          })
        })
      } else {
        // 是目录，判断是否还有children，如果有，弹出提示不能删除，如果没有，post删除请求
        this.$confirm(this.$t('strings.alg.delete_directory'), this.$t('labels.reminder'), confirm).then(() => {
          postAlgorithmTreeFolderNodeData({ 'op': 'D', 'id': data.id, 'config': data.config }).then(() => {
            this.$message.success(this.$t('messages.delete_success'), parentnode)
            this.getTree(node.parent.data.unique_id)
          }).catch(error => {
            console.log('alg tree deleteData error:', error)
            this.$message.error(this.$t('messages.delete_failed'))
          })
        })
      }
    },
    // 对目录的创建 or 更新的后台交互
    updateFolderData() {
      this.$refs['dataForm'].validate(valid => {
        console.log('--------------更新目录')
        if (valid) {
          // const tempData = Object.assign({}, this.temp)
          const tempData = { ...this.temp }
          if (tempData.id === -1) {
            // 将结果上传到服务器，之后从服务器重新请求数据以更新
            postAlgorithmTreeFolderNodeData({ 'op': 'C', 'node_zname': tempData.node_zname, 'node_name': tempData.node_name, 'type': tempData.type, 'parent_id': tempData.parent_id, 'config': tempData.config }).then(() => {
              this.$message.success(this.$t('messages.create_success'))
              this.$refs['dataForm'].resetFields()
              this.getTree(tempData.data.unique_id)
            }).catch(error => {
              console.log('alg tree appendData error:', error)
              this.$message.error(this.$t('messages.create_failed'))
            })
          } else {
            postAlgorithmTreeFolderNodeData({ 'op': 'U', 'id': tempData.id, 'node_zname': tempData.node_zname, 'node_name': tempData.node_name, 'type': tempData.type, 'parent_id': tempData.parent_id, 'config': tempData.config }).then(() => {
              this.$message.success(this.$t('messages.update_success'))
              this.$refs['dataForm'].resetFields()
              this.getTree(tempData.unique_id)
            }).catch(error => {
              console.log('alg tree updateData error:', error)
              this.$message.error(this.$t('messages.update_failed'))
            })
          }
          this.updateDialogFormVisible = false
        }
      })
    },
    // reset form dataForm validate
    updateDialogFormClose() {
      this.$refs['dataForm'].clearValidate()
      this.updateDialogFormVisible = false
    },
    /*
      以下为el-tree组件de 拖拽节点操作实现
      针对拖拽到节点下成为子节点inner/拖拽到节点同级前before/拖拽到节点同级后after分别进行处理
      针对节点不可拖拽情况进行限定
    */
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType)
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      this.drapTemp.config = draggingNode.data.config // draggingNode和dropNode的config一致才能拖拽，所以此处可取draggingNode的config值
      this.drapTemp.current_id = draggingNode.data.id
      this.drapTemp.current_unique_id = draggingNode.data.unique_id
      this.drapTemp.current_name = draggingNode.data.node_zname

      if (dropType === 'inner') {
        this.drapTemp.dropType = 'Inner'
        this.drapTemp.parent_id = dropNode.data.id
        this.drapTemp.parent_unique_id = dropNode.data.unique_id
        this.drapTemp.parent_name = dropNode.data.node_zname
        this.drapTemp.sibling_id = 0 // 插入节点在目标目录下是第一个
      } else if (dropType === 'after') {
        this.drapTemp.dropType = 'After'
        this.drapTemp.sibling_id = dropNode.data.id
        if (typeof dropNode.parent.data.id === 'undefined') {
          this.drapTemp.parent_id = 0
          this.drapTemp.parent_unique_id = 0
          this.drapTemp.parent_name = this.$t('strings.alg.first_level')
        } else {
          this.drapTemp.parent_id = dropNode.parent.data.id
          this.drapTemp.parent_unique_id = dropNode.parent.data.unique_id
          this.drapTemp.parent_name = dropNode.parent.data.node_zname
        }
      } else if (dropType === 'before') {
        this.drapTemp.dropType = 'Before'
        this.drapTemp.sibling_id = dropNode.data.id
        if (typeof dropNode.parent.data.id === 'undefined') {
          this.drapTemp.parent_id = 0
          this.drapTemp.parent_unique_id = 0
          this.drapTemp.parent_name = this.$t('strings.alg.first_level')
        } else {
          this.drapTemp.parent_id = dropNode.parent.data.id
          this.drapTemp.parent_unique_id = dropNode.parent.data.unique_id
          this.drapTemp.parent_name = dropNode.parent.data.node_zname
        }
      }

      // console.log('tree drop: ', draggingNode.data, dropNode.data, dropType)
      this.draggDropDialogFormVisible = true
    },
    allowDrop(draggingNode, dropNode, type) {
      // console.log('allowDrop', draggingNode, dropNode, type)
      // 不同类别（公有、私有、自定义）不能跨类别拖拽
      if (draggingNode.data.config !== dropNode.data.config) {
        return false // eslint-disable-line
      }
      // 算法节点是目标节点时，不能插入其中
      if (typeof dropNode.data.type != 'undefined' && dropNode.data.type === 'func') { // eslint-disable-line
        return type != 'inner' // eslint-disable-line
      } else {
        return true
      }
    },
    allowDrag(draggingNode) {
      return true
    },
    dropConfirm() {
      this.draggDropDialogFormVisible = false

      postAlgorithmTreeFolderNodeData({ 'op': 'Reparent', 'id': this.drapTemp.current_id, 'parent_id': this.drapTemp.parent_id, 'subOp': this.drapTemp.dropType, 'sibling_id': this.drapTemp.sibling_id, 'config': this.drapTemp.config }).then(() => {
        this.$message.success(this.$t('messages.alg.drag_success'))
        this.resetTreeDropTemp(this.drapTemp.parent_unique_id)
      }).catch(error => {
        console.log('alg tree dragger error:', error)
        this.$message.error(this.$t('messages.alg.drag_failed'))
        this.resetTreeDropTemp(this.drapTemp.parent_unique_id)
      })
    },
    dropCancel() {
      this.draggDropDialogFormVisible = false
      this.resetTreeDropTemp(this.drapTemp.current_unique_id)
    },
    resetTreeDropTemp(expandNode) {
      this.getTree(expandNode)
      this.drapTemp.parent_id = 0
      this.drapTemp.parent_name = ''
      this.drapTemp.current_id = 0
      this.drapTemp.current_name = ''
      this.drapTemp.dropType = ''
      this.drapTemp.config = ''
      this.drapTemp.parent_unique_id = 0
      this.drapTemp.current_unique_id = 0
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    // padding-right: 8px;
  }

  /deep/ .el-tree {
    div{
      padding: 5px 10px;
    }
  }
  .is-drop-inner> .el-tree-node__content {
    background-color:#409EFF;
    color:#fff
  }
  .el-tree__drop-indicator {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #409EFF
  }
</style>
