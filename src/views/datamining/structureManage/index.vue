<template>
  <div v-loading="tableLoading" :element-loading-text="$t('strings.loading')" class="app_container">
    <div class="filter_header">
      <div class="filter-container">
        <el-input
          v-model.trim="schemeName"
          :placeholder="$t('rules.require_username')"
          style="width: 200px;"
          suffix-icon="el-icon-search"
          class="el-fault_device"
          clearable
          @change="handleSearch(schemeName)"/>
      </div>
    </div>
    <el-main class="el-main_container">
      <div style="height: 630px">
        <el-table
          :data="tableData"
          :highlight-current-row="false"
          fit
          style="width: 100%;height:615px;overflow-y: auto;">
          <el-table-column :label="$t('labels.id')" prop="userid" width="80%" >
            <template slot-scope="scope">
              <span>{{ (tablePage.current - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name" >
            <template slot-scope="scope">
              <span v-text="scope.row.name"/>
            </template>
          </el-table-column>
          <el-table-column label="描述" prop="description" >
            <template slot-scope="scope">
              <span v-text="scope.row.description"/>
            </template>
          </el-table-column>
          <el-table-column label="使用数据" prop="useNum" class="el-useNum">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.using.count !== 0"
                placement="top"
                width="400"
                trigger="click">
                <div class="popover_content">
                  <div class="title" style="padding-left: 10px;border-bottom: 1px solid #ccc;margin-bottom: 10px;">使用数据</div>
                  <div v-for="(item, index) in scope.row.using.names" :key="index">
                    <span style="margin-left: 10px;">{{ item.name }}</span>
                    <span style="float: right;margin-right: 10px;">{{ item.type }}</span>
                  </div>
                </div>
                <el-button slot="reference" type="text">{{ scope.row.using.count }}</el-button>
              </el-popover>
              <el-button v-else disabled type="text" class="usenum">0</el-button>
            </template>
          </el-table-column>
          <el-table-column label="创建者" prop="username" width="300%" >
            <template slot-scope="scope">
              <span v-text="scope.row.creator.username"/>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="created_at" >
            <template slot-scope="scope">
              <span v-text="scope.row.created_at"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" width="300%">
            <template slot-scope="scope">
              <el-button class="message" @click="getSchemaDetail(scope.row)">表信息</el-button>
              <el-button class="edit" @click="editSchema(scope.row)">编辑</el-button>
              <el-button class="delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="el-pagination-container">
        <el-pagination
          :current-page="tablePage.current"
          :page-size="10"
          :total="tablePage.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <!-- 查看表信息弹窗 -->
    <el-dialog
      :visible.sync="dialogSchemaMessage"
      :close-on-click-modal="false"
      title="查看表信息"
      width="408px"
      class="el-schema-message">
      <el-table
        v-loading.body="tableLoading"
        :data="schemaDetail"
        :highlight-current-row="false"
        fit
        style="width: 100%;height:615px;overflow-y: auto;">
        <el-table-column label="名称" prop="name" >
          <template slot-scope="scope">
            <span v-text="scope.row.name"/>
          </template>
        </el-table-column>
        <el-table-column label="字段类型" prop="type" >
          <template slot-scope="scope">
            <span v-text="scope.row.type"/>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="updateDialogFormVisible"
      :title="$t('labels.edit')"
      width="408px"
      class="new-dialog">
      <el-form ref="dataForm" :rules="rules" :model="editForm" label-position="center" label-width="60px">
        <el-form-item :label="$t('labels.modelmanage.model_name')" prop="name">
          <el-input v-model="editForm.name" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.modelmanage.model_desc')" prop="description">
          <el-input v-model="editForm.description" class="new-input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateDialogFormVisible = false" >{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="updateData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 删除弹窗 -->
    <el-dialog
      :visible.sync="dialogDelete"
      :close-on-click-modal="false"
      title="提示"
      width="408px"
      class="el-batch-delete">
      <span>确定删除该表结构吗?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDelete = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="delete" @click="deleteSchemaFunc">删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllSchema, deleteschema, editSchemaData } from '@/api/datamining/schema'
export default {
  name: 'Structure',
  data() {
    return {
      schemeName: '',
      tableLoading: false,
      tableData: [],
      tablePage: {
        current: 1,
        total: null
      },
      dialogDelete: false,
      deleteId: null,
      editForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, trigger: 'blur', message: '请输入' }]
      },
      updateDialogFormVisible: false,
      editId: null,
      schemaDetail: [],
      dialogSchemaMessage: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表结构
    getTableData(p) {
      const page = p || 1
      this.tableLoading = true
      getAllSchema({ page }).then(res => {
        this.tableLoading = false
        this.tablePage.total = res.data.count
        this.tableData = res.data.results
      }).catch(res => {
        this.tableLoading = false
        this.$message.error('获取失败')
      })
    },
    // 搜索表结构
    handleSearch(name, p) {
      if (!name) {
        this.getTableData()
        return
      }
      const page = p || 1
      this.tableLoading = true
      getAllSchema({ name: name, page }).then(res => {
        this.tableLoading = false
        this.tablePage.total = res.data.count
        this.tableData = res.data.results
      })
    },
    // 编辑表结构
    editSchema(row) {
      this.updateDialogFormVisible = true
      this.editId = row.id
      this.editForm.name = row.name
      this.editForm.description = row.description
    },
    updateData() {
      this.tableLoading = true
      editSchemaData(this.editId, this.editForm).then(res => {
        this.updateDialogFormVisible = true
        this.getAllSchema(this.tablePage.current)
      })
    },
    // 处理删除
    handleDelete(row) {
      if (row.using.count) {
        this.$message.error('该表结构已被使用，不可删除!')
        return
      }
      this.dialogDelete = true
      this.deleteId = row.id
      this.tableLoading = true
    },
    deleteSchemaFunc() {
      deleteschema(this.deleteId).then(res => {
        this.dialogDelete = false
        this.tableLoading = false
        this.$message.success('删除成功!')
        this.getTableData(this.tablePage.current)
      }).catch(e => {
        this.dialogDelete = false
        this.tableLoading = false
      })
    },
    // 分页的操作
    handleCurrentChange(page) {
      this.getTableData(page)
    },
    // 查看schema详情
    getSchemaDetail(row) {
      this.schemaDetail = row.schema
      this.dialogSchemaMessage = true
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.app_container {
  .el-main_container {
    border-radius: 16px;
    margin-top: 16px;
    background-color: #fff;
    /deep/ .el-table {
      &::before {
        display: none;
      }
      .el-table__header-wrapper {
        border-top: none;
        .el-table__header {
          .has-gutter {
            th {
              .cell {
                font-size: 14px;
                color: #808080;
                // font-family: sy_regular;
              }
            }
          }
        }
      }
      .el-table__body-wrapper {
        .el-table__body {
          .el-table__row {
            .cell {
              font-size: 14px;
              color: #4d4d4d;
              span {
                .el-popover__reference {
                  color: #2b5bd6;
                  &:hover,&:active {
                    color: #123ecc;
                  }
                }
              }
              .edit,.delete {
                width: 64px;
                height: 32px;
                border-radius: 16px;
                padding: 0;
              }
              .message {
                width: 70px;
                height: 32px;
                border-radius: 16px;
                padding: 0;
              }
              .delete {
                border: 1px solid #d82145;
                background-color: #fff;
                &:hover {
                  border-color: #e53c65;
                  background-color: #f9f2f4;
                  color: #e53c65;
                }
                &:active {
                  border-color: #c60928;
                  background-color: #f9f2f4;
                  color: #c60928;
                }
              }
              .message,.edit {
                border: 1px solid #2b5bd6;
                background-color: #fff;
                &:hover {
                  border-color: #4773e2;
                  background-color: #f4f5fb;
                  color: #4773e2;
                }
                &:active {
                  border-color: #123ecc;
                  background-color: #f4f5fb;
                  color: #123ecc;
                }
              }
            }
          }
        }
      }
    }
    .el-pagination-container {
      margin-top: 10px;
    }
  }
  .el-batch-delete {
    /deep/ .el-dialog {
      margin-top: 25vh;
      border-radius: 16px;
      .el-dialog__header {
        .el-dialog__title {
          margin-left: 15px;
          // font-family: sy_regular;
        }
        &::after {
          content: '';
          display: block;
          width: 100%;
          height: 0;
          margin-top: 10px;
          border-bottom: 1px solid #ccc;
        }
      }
      .el-dialog__body {
        padding: 10px 0;
        padding-left: 65px;
        font-size: 16px;
        // font-family: sy_regular;
      }
      .el-dialog__footer {
        .dialog-footer {
          .el-button {
            // font-family: sy_regular;
          }
          .delete {
            background-color: #e53c65;
            color: #fff;
          }
        }
      }
    }
  }
  .new-dialog {
    /deep/ .el-dialog {
      .el-dialog__header {
        .el-dialog__title {
          margin-left: 15px;
          // font-family: sy_regular;
        }
        &::after {
          content: '';
          display: block;
          width: 100%;
          height: 0;
          margin-top: 10px;
          border-bottom: 1px solid #ccc;
        }
      }
    }
  }
  .el-schema-message {
    /deep/ .el-dialog {
      border-radius: 16px;
      .el-dialog__header {
        .el-dialog__title {
          margin-left: 15px;
          // font-family: sy_regular;
        }
        &::after {
          content: '';
          display: block;
          width: 100%;
          height: 0;
          margin-top: 10px;
          border-bottom: 1px solid #ccc;
        }
      }
      .el-dialog__body {
        padding-top: 0;
        .el-table {
          .el-table__header-wrapper {
            border-top: none;
          }
        }
      }
    }
  }
}
</style>
