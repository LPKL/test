<template>
  <div class="app-container">
    <el-row>
      <!--群组信息-->
      <span class="page-title">{{ $t('strings.perm.edit_group_perm') }}<el-tag type="info">{{ rolename }}</el-tag></span>
      <router-link to="/system/role_manage" style="float:right">
        <el-button type="text" icon="el-icon-back" >{{ $t('strings.perm.back_group') }}</el-button>
      </router-link>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <el-row :gutter="20">
      <!--菜单权限树-->
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <div class="title-box" style="padding-top: 10px; padding-bottom: 13px;">
              <span><el-tag type="success" >{{ $t('strings.perm.menu') }}</el-tag>&nbsp;{{ $t('strings.perm.perm_origin') }}</span>
            </div>
            <span class="tips-text">{{ $t('strings.perm.set_group_perm') }}</span>
          </div>
          <el-input :placeholder="filterPlaceholderText" v-model="filterMenuPermText" class="mgb-15"/>
          <el-tree
            ref="menuPermTreeRef"
            :filter-node-method="filterNode1"
            :data="menuPermissionTree"
            :props="treeProps"
            :expand-on-click-node="false"
            :check-strictly="true"
            show-checkbox
            node-key="pval"
            default-expand-all
            @check-change="handleUpdateMenuPermForRole">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>
                <span class="mgl-10 tips-text">{{ data.pval }}</span>
                <el-tag class="mgl-10" type="success" size="mini">{{ $t('route.'+data.pname) }}</el-tag>
                <!-- <el-tag class="mgl-10" type="success" size="mini">菜单</el-tag> -->
              </span>
            </span>
          </el-tree>
        </el-card>
      </el-col>

      <!--按钮权限树-->
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <div class="title-box" style="padding-top: 10px; padding-bottom: 13px;">
              <span><el-tag type="warning" >{{ $t('strings.perm.button') }}</el-tag>&nbsp;{{ $t('strings.perm.perm_origin') }}</span>
            </div>
            <span class="tips-text">{{ $t('strings.perm.set_group_perm') }}</span>
          </div>
          <el-input :placeholder="filterPlaceholderText" v-model="filterButtonPermText" class="mgb-15"/>
          <el-tree
            ref="buttonPermTreeRef"
            :filter-node-method="filterNode2"
            :data="buttonPermissionTree"
            :props="treeProps"
            :expand-on-click-node="false"
            :check-strictly="true"
            show-checkbox
            node-key="pname"
            default-expand-all
            @check-change="handleUpdateBtnPermForRole">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>
                <span class="mgl-10">{{ data.pname }}</span>
                <!--<span class="mgl-10 tips-text">{{ data.pval }}</span>-->
                <el-tag class="mgl-10" type="success" size="mini">{{ data.pzname?data.pzname:'按钮' }}</el-tag>
              </span>
            </span>
          </el-tree>
        </el-card>
      </el-col>

      <!--接口权限树-->
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <div class="title-box" style="padding-top: 10px; padding-bottom: 13px;">
              <span><el-tag>{{ $t('strings.perm.interface') }}</el-tag>&nbsp;{{ $t('strings.perm.perm_origin') }}</span>
            </div>
            <span class="tips-text">{{ $t('strings.perm.set_group_perm') }}</span>
          </div>
          <el-input :placeholder="filterPlaceholderText" v-model="filterApiPermText" class="mgb-15"/>
          <el-tree
            ref="apiPermTreeRef"
            :filter-node-method="filterNode3"
            :data="apiPermissionTree"
            :props="treeProps"
            :expand-on-click-node="false"
            show-checkbox
            node-key="id"
            default-expand-all
            @check-change="handleUpdateApiPermForRole">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>
                <span class="mgl-10" >{{ data.attributes.url_value }}</span>
                <!--<span class="mgl-10 tips-text">{{ data.pval }}</span>-->
                <el-tag class="mgl-10" type="success" size="mini">{{ data.attributes.url_zname }}</el-tag>
              </span>
            </span>
          </el-tree>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import tree from '../tree'
// import { parseTime, resetTemp } from '@/utils'
import { listApiPermMetadata } from '@/api/system/perm'
import { findRolePerms, deletePermApi, getAllPerms, updateRolePerms } from '@/api/system/role'
import { permType } from '@/utils/constants'
// import { asyncRouterMap } from '@/router' // 路由表，定义了菜单和按钮的元数据，可以用来生成权限控制的菜单按钮树
import debounce from 'lodash/debounce'

export default {
  name: 'AssignPerm',
  data() {
    return {
      rolename: '',
      permType,

      // 当前授权的群组
      roleId: null,
      role: {},
      id: 0,
      // 节点过滤
      filterPlaceholderText: this.$t('strings.perm.perm_placeholder'),
      filterMenuPermText: '',
      filterButtonPermText: '',
      filterApiPermText: '',

      roleMenuPermUpdateSum: 0,
      roleApiPermUpdateSum: 0,
      roleBtnPermUpdateSum: 0,

      // 群组的权限值
      roleMenuPvals: [],
      roleApiPvals: [],
      roleBtnPvals: [],

      menuPermissionTree: [], // 菜单权限树
      buttonPermissionTree: [], // 按钮权限树
      apiPermissionTree: [], // 菜单权限树
      // 挂载到按钮权限树的按钮权限数据。由于按钮权限在菜单权限下，key是菜单权限值，value是按钮权限
      btnPermMap: {},

      treeProps: {
        label: 'pname',
        children: 'children'
      },
      dialogFormVisible: false,
      formLabelWidth: '120px',
      form: {
        parent: '',
        pname: '',
        pval: '',
        ptype: 0
      },
      data: []
    }
  },

  computed: {
    btnCheckboxMap() {
      const map = {}
      this.roleBtnPvals.forEach(pval => {
        map[pval] = true
      })
      return map
    }
  },

  watch: {
    'filterMenuPermText': debounce(function(val) {
      this.$refs.menuPermTreeRef.filter(val)
    }, 600),
    'filterButtonPermText': debounce(function(val) {
      this.$refs.buttonPermTreeRef.filter(val)
    }, 600),
    'filterApiPermText': debounce(function(val) {
      this.$refs.apiPermTreeRef.filter(val)
    }, 600)
  },

  created() {
    this.initData()
    if (this.$route.query.perm_zname !== null) {
      this.rolename = this.$route.params.rolename
    }
  },
  methods: {
    // 获取后台权限数据
    initData() {
      // 获取路由中的群组id
      this.roleId = this.$route.params.roleId
      // 显示菜单权限树
      // this.initMenus()
      this.menuPermissionTree = tree.generateMenuPermissionTree()
      // this.buttonPermissionTree = JSON.parse(JSON.stringify(this.menuPermissionTree))
      // 按钮权限树
      this.buttonPermissionTree = this.$store.getters.btndata
      // console.log(JSON.stringify(this.buttonPermissionTree))
      // 显示接口权限树
      this.loadApiButtonPermissionTree()
      // 加载群组的权限
      // this.loadMenus()
    },

    //
    /**
     * 加载群组的权限并回显
     */
    loadRolePerms() {
      if (!this.roleId) {
        this.$message.error(this.$t('messages.perm.not_found_groupid'))
        return
      }
      findRolePerms(this.roleId).then(res => {
        if (res.data.menuPvals.length > 0) {
          this.roleMenuPvals = res.data.menuPvals
          this.$refs.menuPermTreeRef.setCheckedKeys(res.data.menuPvals)
        }
        if (res.data.apiPvals.length > 0) {
          this.roleApiPvals = res.data.menuPvals
          this.$refs.apiPermTreeRef.setCheckedKeys(res.data.apiPvals)
        }
        // 用于回显群组的按钮权限
        this.roleBtnPvals = res.data.btnPvals
        // 显示当前编辑的群组
        this.role = res.data.role
      })
    },

    /**
     * 过滤节点
     */
    // 菜单
    filterNode1(value, data, node) {
      if (!value) return true
      return (typeof data.pname !== 'undefined' && this.$t('route.' + data.pname).indexOf(value) !== -1) || (typeof data.pval !== 'undefined' && data.pval.indexOf(value) !== -1)
    },
    // 按钮
    filterNode2(value, data) {
      if (!value) return true
      return (typeof data.pname !== 'undefined' && data.pname.indexOf(value) !== -1) || (typeof data.pzname !== 'undefined' && data.pzname.indexOf(value) !== -1)
    },
    // 接口
    filterNode3(value, data) {
      if (!value) return true
      return (typeof data.attributes.url_value !== 'undefined' && data.attributes.url_value.indexOf(value) !== -1) || (typeof data.attributes.url_zname !== 'undefined' && data.attributes.url_zname.indexOf(value) !== -1)
    },
    // ///////////////////////// 接口权限树

    /**
     * 从服务器端加载接口权限树 menu 树
     */
    loadApiButtonPermissionTree() {
      listApiPermMetadata().then(res => {
        this.apiPermissionTree = res.data.data
      }).then(() => {
        getAllPerms(this.$route.params.roleId).then(res => {
          const oldUrls = res.data.data.relationships.auth_url.data
          const oldMenus = res.data.data.attributes.menu_str
          const oldBtns = res.data.data.attributes.button_str
          const m = oldUrls.map((item) => {
            return { id: item.id }
          })
          if (oldMenus) {
            const menu = oldMenus.split(',').map((item) => {
              return { pval: item }
            })
            // 设置默认选中的菜单
            this.$refs.menuPermTreeRef.setCheckedNodes(menu)
          }
          if (oldBtns) {
            const btn = oldBtns.split(',').map((item) => {
              return { pname: item }
            })
            // 设置默认选中的菜单
            this.$refs.buttonPermTreeRef.setCheckedNodes(btn, false, true)
          }
          // 设置默认选中的url
          this.$refs.apiPermTreeRef.setCheckedNodes(m)
        }).catch(error => {
          console.log(error)
        })
      })
    },
    // ///////////////////////// 按钮权限树
    /**
     * 按钮权限树树的默认展示
     */
    // loadButtonPermissionTree() {
    //   this.roleBtnPermUpdateSum++
    //   // 因为初始化勾选群组的权限会触发一次，但这次的权限数据跟后台是一样的，所以不需要触发更新群组的权限
    //   if (this.roleBtnPermUpdateSum === 1) return
    //
    // },
    /**
     * 更新群组的按钮权限
     * @param checked
     */
    // handleUpdateBtnPermForRole(checked, pval) {
    //   const data = {
    //     rid: this.roleId,
    //     pval: pval,
    //     ptype: permType.BUTTON
    //   }
    //   if (checked) {
    //     addRolePerm(data).then(() => {
    //       this.roleBtnPvals.unshift(pval)
    //       this.$message.success('添加按钮权限成功')
    //     })
    //   } else {
    //     deleteRolePerm(data).then(() => {
    //       const index = this.roleBtnPvals.findIndex(btnPval => btnPval === pval)
    //       this.roleBtnPvals.splice(index, 1)
    //       this.$message.success('删除按钮权限成功')
    //     })
    //   }
    // },

    /**
     * 更新群组的菜单权限
     */
    handleUpdateMenuPermForRole: debounce(function(nodes, status) {
      this.roleMenuPermUpdateSum++
      // 因为初始化勾选群组的权限会触发一次，但这次的权限数据跟后台是一样的，所以不需要触发更新群组的权限
      // if (this.roleMenuPvals.length > 0 && this.roleMenuPermUpdateSum === 1) return
      if (this.roleMenuPermUpdateSum === 1) return
      const checkedNodes = this.$refs.menuPermTreeRef.getCheckedNodes()
      // const halfCheckedNodes = this.$refs.menuPermTreeRef.getHalfCheckedNodes()
      let menu_str = ''
      checkedNodes.map(item => {
        menu_str += item.pval + ','
      })
      getAllPerms(this.$route.params.roleId, { menu_str: menu_str }).then(res => {
        this.$message({
          message: this.$t('messages.perm.update_menu_perm_success'),
          type: 'success',
          duration: 1000
        })
      }).catch(error => {
        console.log(error)
      })
    }, 500),

    /**
     * 更新群组的接口权限
     */
    handleUpdateApiPermForRole: debounce(function(node, status) {
      this.roleApiPermUpdateSum++
      // 因为初始化勾选群组的权限会触发一次，但这次的权限数据跟后台是一样的，所以不需要触发更新群组的权限
      if (this.roleApiPermUpdateSum === 1) return
      // 获取到当前点击的那个元素
      if (status) {
        // 发送请求更新群组的权限
        const data = {
          url: node.id
        }
        updateRolePerms(this.roleId, data).then(res => {
          this.$message.success(this.$t('messages.group.update_perm_success'))
        })
      } else {
        const data = {
          url: node.id
        }
        deletePermApi(this.roleId, data).then(res => {
          this.$message.success(this.$t('messages.group.update_perm_success'))
        })
      }
    }, 500),
    /**
     * 更新按钮权限
     * */
    handleUpdateBtnPermForRole: debounce(function(node, status) {
      this.roleBtnPermUpdateSum++
      // 因为初始化勾选群组的权限会触发一次，但这次的权限数据跟后台是一样的，所以不需要触发更新群组的权限
      if (this.roleBtnPermUpdateSum === 1) return
      // 获取到当前点击的那个元素
      const checkedNodes = this.$refs.buttonPermTreeRef.getCheckedNodes(false, true)
      let button_str = ''
      checkedNodes.forEach(item => {
        button_str += item.pname + ','
      })
      // this.$store.dispatch('ChangeButtonPerms', button_str)
      getAllPerms(this.$route.params.roleId, { button_str: button_str }).then(res => {
        this.$message({
          message: this.$t('messages.perm.update_menu_perm_success'),
          type: 'success',
          duration: 1000
        })
      }).catch(error => {
        console.log(error)
      })
    }, 500)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 100%;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .card-title {
    line-height: 50px;
    height: 50px;
  }

  .tips-text {
    font-size: 14px;
    color: #909399;
  }

  .title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-size: 22px;
    }
  }

  .update-btn {
    margin-left: 20px;
  }

  .delete-btn {
    margin-left: 20px;
    color: #F56C6C;
  }

  .mgl-10 {
    margin-left: 10px;
  }

  .mgb-15 {
    margin-bottom: 15px;
  }

  .page-title{
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }

</style>
