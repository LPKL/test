<template>
  <div v-loading="listLoading" :element-loading-text="$t('strings.loading')" class="app_container">
    <div class="el-sideleft_menu">
      <div class="sideleft_menu_title">{{ $t('strings.metadataManage.metadatamanage') }}</div>
      <el-input v-model="metadataStr" :placeholder="$t('strings.metadataManage.metadataName')" suffix-icon="el-icon-search" class="el-search_metadata" @change="handleFilter"/>
      <el-menu
        :default-active="default_active"
        class="el-sidebar-left-menu"
        background-color="#fff"
        text-color="#4d4d4d"
        active-text-color="#123ecc">
        <el-menu-item-group>
          <el-menu-item v-for="(item, index) in metadataList" :key="index" :index="`${item.id}`">
            <template>
              <!-- 加id判断 -->
              <span v-if="!isChangeInputShow || currentIdClick !== item.id" class="usermessage" @click.stop="menuClick(item, true)" @mouseenter="changeIconSHow(item)" @mouseleave="changeIconHide(item)">
                <span class="name">{{ item.name }}</span>
                <span v-if="isChangeMetadata && currentIdHover === item.id" class="iconStyle" @click.stop="handleDelete(item.id)">
                  <svg-icon v-if="!isShowActiveDeleteIcon" icon-class="metadatadelete_h"/>
                  <svg-icon v-if="isShowActiveDeleteIcon" icon-class="metadatadelete_c"/>
                </span>
                <span v-if="isChangeMetadata && currentIdHover === item.id" class="iconStyle" @click.stop="showEditInput(item)">
                  <svg-icon v-if="!isShowActiveEditIcon" icon-class="metadataedit_h"/>
                  <svg-icon v-if="isShowActiveEditIcon" icon-class="metadataedit_c"/>
                </span>
              </span>
              <span v-if="currentIdClick === item.id" class="metadataName" @click.stop="3">
                <el-input ref="input1" v-model="metadataName"/>
                <el-button type="text" class="save" @click.stop="changeMetadataFunc(item.id, { name: metadataName })">{{ $t('buttons.save') }}</el-button>
                <el-button type="text" class="cancel" @click.stop="cancelEditFunc">{{ $t('buttons.cancel') }}</el-button>
              </span>
            </template>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div v-if="isAddInputShow" class="add_metaData_area">
        <el-input ref="input" v-model="metadataName"/>
        <el-button type="text" class="save" @click.stop="addMetadataFunc(metadataName)">{{ $t('buttons.save') }}</el-button>
        <el-button type="text" class="cancel" @click.stop="addCancel">{{ $t('buttons.cancel') }}</el-button>
      </div>
      <el-button :disabled="isAddInputShow" class="add_metadata" type="text" @click.stop="showAddInput">
        <svg-icon icon-class="metadataadd_d"/>
        {{ $t('strings.metadataManage.add_metadata') }}
      </el-button>
    </div>
    <div class="content">
      <MetadataContent
        ref="fieldData"
        :metadata-data="metadataData"
        :current-metadata="currentMetadata"
        :all-metadata="metadataList"
        :total="total"
        @fresh = "freshPage"
        @handleFilter = "handleUsed"
        @loadingChange="loadingFunc"
        @changeMetadata = "changeMetadataFunc"
        @pageChange = "handlePageChange"/>
    </div>
  </div>
</template>

<script>
import MetadataContent from './components/metadataContent'
import { getMetadata, addMetadata, editMetadata, deleteMetadata, searchFieldsName, searchMetadata, getMetadataFields } from '@/api/datamining/metadata'
// import { filter } from 'glob/node_modules/@types/minimatch'

export default {
  name: 'Metadata',
  components: {
    MetadataContent
  },
  data() {
    return {
      listLoading: false,
      total: 0,
      metadataList: [],
      metadataStr: '',
      metadataData: [],
      currentMetadata: {},
      isAddInputShow: false,
      metadataName: '',
      // 修改元数据的操作
      isChangeMetadata: false,
      currentIdHover: null,
      currentIdClick: null,
      isChangeInputShow: false,
      // 编辑和删除字段
      isShowActiveEditIcon: false,
      isShowActiveDeleteIcon: false,
      default_active: null
    }
  },
  created() {
    this.getMetadataAll()
  },
  mounted() {
    // 将输入框隐藏
    document.getElementsByClassName('app_container')[0].addEventListener('click', (e) => {
      if (e.target.nodeName === 'INPUT') return
      this.cancelEditFunc()
    })
  },
  methods: {
    // 刷新页面
    freshPage(val) {
      this.menuClick(val)
    },
    loadingFunc(val) {
      this.listLoading = val
    },
    // 获取元数据
    getMetadataAll() {
      this.listLoading = true
      getMetadata().then(res => {
        this.metadataList = res.data.results.reverse()
        if (!this.metadataList.length) {
          this.currentMetadata = {
            created_at: '',
            updated_at: '',
            description: ''
          }
          return
        }
        this.currentMetadata = (JSON.stringify(this.$store.state.metadata.currentMetadata) !== '{}' && this.$route.query.id) ? this.$store.state.metadata.currentMetadata : this.metadataList[0]
        if (this.$route.query.id) {
          this.menuClick(this.currentMetadata)
        } else {
          this.menuClick(this.metadataList[0])
        }
      })
    },
    showAddInput() {
      this.isAddInputShow = true
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    // 已使用未使用的筛选
    handleUsed(filterData) {
      if (filterData.state === 2) {
        if (filterData.q) {
          this.$refs['fieldData'].handleSearch('', 1)
        } else {
          this.menuClick(this.currentMetadata)
        }
        return
      }
      this.listLoading = true
      let temp = { used: filterData.state, page: filterData.page }
      if (filterData.q) {
        temp = { used: filterData.state, page: filterData.page, q: filterData.q }
      }
      searchFieldsName(this.currentMetadata.id, temp).then(res => {
        this.metadataData = res.data.results
        this.total = res.data.count
        this.listLoading = false
      })
    },
    // 获取一条元数据对应的字段
    menuClick(val, state) {
      if (this.$store.state.metadata.metadataId === val.id && state) return
      this.listLoading = true
      this.$store.dispatch('RECORD_CURRENT_ID', val.id)
      this.$store.dispatch('RECORD_CURRENT_METADATA', val)
      getMetadataFields(val.id).then(res => {
        this.default_active = String(val.id)
        const temp = res.data.results
        this.currentMetadata = val
        this.metadataData = temp
        this.total = res.data.count
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 搜索元数据
    handleFilter() {
      this.listLoading = true
      if (!this.metadataStr) {
        this.getMetadataAll()
        return
      }
      searchMetadata({ q: this.metadataStr }).then(res => {
        this.metadataList = res.data.results.reverse()
        this.currentMetadata = (JSON.stringify(this.$store.state.metadata.currentMetadata) !== '{}' && this.$route.query.id) ? this.$store.state.metadata.currentMetadata : this.metadataList[0]
        if (this.$route.query.id) {
          this.menuClick(this.currentMetadata)
        } else {
          this.default_active = String(this.metadataList[0].id)
          this.menuClick(this.metadataList[0])
        }
      }).catch(e => {
        this.listLoading = false
        this.$message.error('该元数据不存在!')
      })
    },
    // 配合子组件分页的操作
    handlePageChange(val) {
      this.listLoading = true
      getMetadataFields(val.currentMetadata.id, { page: val.page }).then(res => {
        const temp = res.data.results
        this.currentMetadata = val.currentMetadata
        this.metadataData = temp
        this.total = res.data.count
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 添加元数据
    addMetadataFunc(name) {
      if (!name) return
      this.listLoading = true
      addMetadata({ name }).then(res => {
        this.isAddInputShow = false
        this.metadataName = ''
        this.metadataList.push(res.data)
        this.listLoading = false
      }).catch(e => {
        this.$message.error(e.message)
        this.listLoading = false
      })
    },
    // 添加元数据取消的操作
    addCancel() {
      this.metadataName = ''
      this.isAddInputShow = false
    },
    // 鼠标以上元数据名称时的操作
    changeIconSHow(val) {
      this.isChangeMetadata = true
      this.currentIdHover = val.id
    },
    // 鼠标移开元数据名称的操作
    changeIconHide() {
      this.isChangeMetadata = false
      this.currentIdHover = null
    },
    // 点击编辑按钮，编辑元数据的名称
    showEditInput(val) {
      this.isChangeInputShow = true
      this.isChangeMetadata = false
      this.metadataName = val.name
      this.currentIdClick = val.id
      this.isShowActiveEditIcon = true
    },
    // 修改元数据的保存
    changeMetadataFunc(id, val) {
      this.isShowActiveEditIcon = false
      this.isShowActiveDeleteIcon = false
      this.listLoading = true
      editMetadata(id, val).then(res => {
        this.currentIdClick = null
        this.isChangeInputShow = false
        this.metadataName = ''
        const temp = res.data
        for (let index = 0; index < this.metadataList.length; index++) {
          if (this.metadataList[index].id === temp.id) {
            this.metadataList[index].name = temp.name
            this.metadataList[index].description = temp.description
            this.listLoading = false
            return
          }
        }
      })
    },
    // 编辑元数据的取消
    cancelEditFunc() {
      this.isShowActiveEditIcon = false
      this.isShowActiveDeleteIcon = false
      this.currentIdClick = null
      this.isChangeInputShow = false
      this.metadataName = ''
      this.isAddInputShow = false
    },
    // 删除一条元数据
    handleDelete(id) {
      this.listLoading = true
      this.isShowActiveDeleteIcon = true
      deleteMetadata(id).then(res => {
        this.metadataList = this.metadataList.filter(item => item.id !== id)
        this.listLoading = false
      }).catch(e => {
        this.listLoading = false
        this.$message.error(e.message)
      })
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .metadataName,.add_metaData_area {
    display: inline-block;
    margin-left: -12px;
    /deep/ .el-input {
      width: auto;
      display: inline-block;
      .el-input__inner {
        width: 170px;
        height: 36px;
        margin-top: -10px;
        border-radius: 4px;
        border: none;
      }
    }
    .el-button {
      font-size: 12px;
      color: #2b5bd6;
      // font-family: sy_medium;
      transform: translateY(-5px);
      &:hover {
        color: #4773e2;
        text-decoration: underline;
        text-decoration-color: #4773e2;
      }
      &:active {
        color: #123ecc;
        text-decoration: underline;
        text-decoration-color: #123ecc;
      }
    }
    .cancel {
      margin-left: 0;
    }
  }
  .app_container {
    display: flex;
    padding: 16px;
    .el-sideleft_menu {
      width: 260px;
      height:984px;
      background-color: #fff;
      border-radius: 16px;
      margin-right: 16px;
      padding-top: 24px;
      .sideleft_menu_title {
        padding-left: 24px;
        margin-bottom: 24px;
        font-size: 18px;
        color: #4d4d4d;
      }
      .el-search_metadata {
        width: 210px;
        margin-left: 24px;
        margin-right: 24px;
        /deep/ .el-input__inner {
          width: 210px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e6e6e6;
          color: ccc;
          // font-family: sy_light;
          font-weight: lighter;
          &:focus {
            color: #666;
          }
          &:hover,
          &:active {
            border-color: #b7b7b7;
          }
        }
        /deep/ .el-input__suffix {
          right: 5px;
          .el-input__suffix-inner {
            .el-input__icon {
              &::before {
                font-size: 15px;
              }
            }
          }
        }
      }
      .el-sidebar-left-menu {
        margin-top: 16px;
        border-right: none;
        max-height: 400px;
        /deep/ .el-menu-item-group {
          .el-menu-item-group__title {
            display: none;
          }
          ul {
            .is-active {
              border-right-color:#123ecc!important;
              background-color: rgba(18, 62, 204, 0.05)!important;
              // rgba(18, 62, 204)
            }
            .el-menu-item {
              height: 40px;
              line-height: 40px;
              font-size: 15px;
              padding-left: 36px!important;
              border-right: 4px solid transparent;
              vertical-align: none;
              .usermessage {
                display: inline-block;
                width: 100%;
                .name {
                  margin-top: -10px;
                }
                span {
                  display: inline-block;
                }
                .iconStyle {
                  float: right;
                  .svg-icon {
                    width: 24px;
                    height: 24px;
                    margin-top: -5px;
                  }
                }
              }
              &:hover {
                background-color: rgba(18, 62, 204, 0.05)!important;
              }
            }
          }
        }
      }
      .add_metaData_area {
        height: 40px;
        width: 100%;
        padding-left: 12px;
        background-color: rgba(18, 62, 204, 0.05);
        margin-left: 0;
        margin-top: 10px;
        /deep/ .el-input {
          .el-input__inner {
            margin-top: 2px;
          }
        }
        .el-button {
          transform: translateY(0);
          margin-left: 0;
        }
      }
      .add_metadata {
        display: inline-block;
        width: 100%;
        height: 40px;
        position: relative;
        text-align: center;
        font-size: 15px;
        color: #2b5bd6;
        padding: 0;
        margin-top: 10px;
        &:hover,&:active {
          color: #123ecc;
        }
        /deep/ span {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 210px;
          height: 40px;
          line-height: 40px;
          border-radius: 20px;
          border: 1px solid transparent;
          &:hover {
            background-color: rgba(18, 62, 204, 0.05);
          }
          .svg-icon {
            width: 24px;
            height: 24px;
            margin-top: -4px;
            vertical-align: middle;
          }
        }
      }
    }
    .content {
      flex: 1;
    }
  }
</style>
