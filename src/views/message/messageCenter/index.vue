<template>
  <div v-loading="tableLoading" :element-loading-text="$t('strings.loading')" class="mes-container el-minwidth">
    <el-row>
      <el-col :span="14">
        <div class="el-dataList">
          <div class="fault_header">
            <span>{{ $t('strings.messageCenter.fault_notice') }}</span>
          </div>
          <div class="header-action">
            <div class="header-container">
              <el-button :disabled="!markData.notification_ids.length" :class="{ 'activeClass': markData.notification_ids.length }" class="mark_read" @click="markMulHandle">{{ $t('strings.messageCenter.mark_already_read') }}</el-button>
              <el-button :disabled="!markData.notification_ids.length" class="delete_btn" @click="handleDeletes">{{ $t('buttons.delete') }}</el-button>
              <el-button class="handleRead" @click="handleRead">{{ readStatus }}</el-button>
            </div>
          </div>
          <el-table
            ref="multipleTable"
            :data="tableData"
            :row-class-name="rowClass"
            tooltip-effect="dark"
            class="table_s"
            highlight-current-row
            style="width: 100%;height: 600px;"
            @row-click="seeDetail"
            @select-all="handleSelectAll"
            @select="handleSelectionChange">
            <el-table-column type="selection" width="55"/>
            <el-table-column :label="$t('labels.messageCenter.messageList')">
              <template slot-scope="scope">
                <div class="message-detail">
                  <span>{{ scope.row.title }}</span>
                  <span class="time">{{ scope.row.created_at }}</span>
                </div>
                <div class="fault_rule">
                  <span>{{ $t('strings.messageCenter.emergency_rule') }}</span>
                  <span>xxx</span>
                  <span style="margin-left: 5px; margin-right: 5px;">></span>
                  <span>vvv</span>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('labels.messageCenter.messageState')" align="center" width="100">
              <template slot-scope="scope">
                <div :class="{ 'markunread': scope.row.unread }">{{ scope.row.unread ? $t('labels.messageCenter.unread') : $t('labels.messageCenter.readed') }}</div>
              </template>
            </el-table-column> -->
            <el-table-column :label="$t('labels.actions')" align="left" width="100%">
              <template slot-scope="scope">
                <el-button type="text" class="delete_btn" @click="handleDetail(scope.row)">
                  <div :disabled="scope.row.extra.state!=='unprocessed'" :class="{ 'unprocessed': scope.row.extra.state !== 'processed', 'processed': scope.row.extra.state === 'processed' }" class="delete_box">
                    <!-- <div v-if="handleShow==='unprocessed'" :disabled="detailData.data.content.state!=='unprocessed'" class="delete_box"> -->
                    <!-- <svg-icon class="normal_s" icon-class="message_default_delete"/>
                    <svg-icon class="hover_s" icon-class="message_hover_delete"/> -->
                    {{ $t('strings.messageCenter.handle') }}
                  </div>
                </el-button>
                <!-- <span v-if="right_arrow === scope.$index" class="leftBtn"/> -->
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination_container">
            <el-pagination
              :current-page="listQuery.page"
              :page-size="listQuery.limit"
              :total="listQuery.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handleCurrentChange"/>
          </div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="el-fault">
          <div v-if="detailShow" class="card">
            <div class="title">
              <div class="title_trip">{{ detailData.title }}</div>
              <div class="time">{{ detailData.created_at }}</div>
            </div>
            <div class="faultmessage">
              <div class="content">
                <el-row class="row_class">
                  <div class="label_text">{{ $t('strings.messageCenter.fault_about') }} :</div>
                  <div class="content_text">{{ detailData.data.content.alert_rule.name }}</div>
                </el-row>
                <el-row class="row_class line_top">
                  <div class="label_text">{{ $t('strings.messageCenter.emergency_message') }} :</div>
                  <div class="content_text">
                    <span v-if="detailData.data.content.alert_rule.conditions.length">{{ detailData.data.content.alert_rule.conditions[0].field }}</span>
                    <span v-else>xxx</span>
                    <span v-if="detailData.data.content.alert_rule.conditions.length" style="margin-left: 5px; margin-right: 5px;">{{ detailData.data.content.alert_rule.conditions[0].operator }}</span>
                    <span v-else style="margin-left: 5px; margin-right: 5px;">xxx</span>
                    <span v-if="detailData.data.content.alert_rule.conditions.length">{{ detailData.data.content.alert_rule.conditions[0].value }}</span>
                    <span v-else>xxx</span>
                  </div>
                </el-row>
                <el-row v-if="detailData.data.content.state !== 'fault_free'" class="row_class line_top">
                  <div class="label_text relate">{{ $t('strings.messageCenter.emergency_message') }} :</div>
                  <div class="content_text">{{ detailData.data.content.alert_rule.fault_code.code }}</div>
                </el-row>
                <el-row v-if="detailData.data.content.state === 'processed'" class="row_class line_top">
                  <div class="label_text real_code">{{ $t('strings.messageCenter.actual_fault_code') }} :</div>
                  <div class="content_text">{{ detailData.data.content.actual_fault.code }}</div>
                </el-row>
                <el-row v-if="detailData.data.content.state !== 'fault_free'" class="row_class line_top">
                  <div class="label_text">{{ $t('strings.messageCenter.fault_reason') }} :</div>
                  <div class="content_text">{{ detailData.data.content.explanation }}</div>
                </el-row>
                <el-row v-if="detailData.data.content.state === 'fault_free'" class="row_class line_top">
                  <div class="label_text">{{ $t('strings.messageCenter.explain') }} :</div>
                  <div class="content_text">{{ detailData.data.content.explanation }}</div>
                </el-row>
              </div>
            </div>
            <div v-if="detailData.data.content.state === 'unprocessed' || detailData.data.content.state === 'processing'" class="faultdiagnosis">
              <div class="content">
                <el-row class="row_class">
                  <div class="label_text">{{ $t('strings.messageCenter.handle_opinion') }} :</div>
                  <div class="content_text">{{ detailData.data.content.alert_rule.fault_code.opinion }}</div>
                </el-row>
                <el-row class="row_class line_top">
                  <div class="label_text">{{ $t('strings.messageCenter.run_opinion') }} :</div>
                  <div class="content_text">
                    xxx
                  </div>
                </el-row>
              </div>
            </div>
          </div>
          <div v-else class="empty_box">
            <svg-icon class="empty_page" icon-class="empty_page">sasasa</svg-icon>
            <p class="trip">{{ $t('strings.messageCenter.click_for_detail') }}</p>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 详情的处理按钮 -->
    <el-dialog :title="$t('labels.faultmanage.fault_handle')" :append-to-body="true" :visible.sync="dialoghandleVisible" :close-on-click-modal="false" width="30%">
      <div class="handel_box">
        <el-form ref="handleForm" :model="handleForm" label-width="100px" label-position="left">
          <el-form-item :label="$t('labels.faultmanage.handler')" prop="handler">
            <el-input v-model="handleForm.handler" :disabled="true" width="30%"/>
          </el-form-item>
          <el-form-item :label="$t('labels.faultmanage.fault_status')" prop="state">
            <el-select v-model="handleForm.state" :placeholder="$t('labels.select')" @change="handleSelect">
              <el-option
                v-for="(item, index) in statusArr"
                :key="index"
                :label="item.value"
                :value="item.status"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="otherShow==='fault_free'" :label="$t('labels.faultmanage.explain')" prop="actual_fault_opinion">
            <el-input :autosize="{ minrows: 2, maxrows: 4 }" v-model="handleForm.explanation" type="textarea"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.releate_fault_code')" :disabled="true" prop="releate_code">
            <el-input v-model="handleForm.releate_code" :disabled="true"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.actual_fault_code')" prop="actual_fault_code_id">
            <el-select v-model="handleForm.actual_fault_code_id">
              <el-option
                v-for="(item, index) in alarmArr"
                :key="index"
                :label="item.name"
                :value="item.id"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.fault_reason')" prop="actual_fault_reason">
            <el-input :autosize="{ minrow: 2, maxrows: 4 }" v-model="handleForm.actual_fault_reason" type="textarea"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.handle_method')" prop="actual_fault_opinion">
            <el-input :autosize="{ minrows: 2, maxrows: 4 }" v-model="handleForm.actual_fault_opinion" type="textarea"/>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="margin-top: -10px">
        <el-button @click="dialoghandleVisible = false">{{ $t('labels.cancel') }}</el-button>
        <el-button type="primary" @click="handelUpdate">{{ $t('labels.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMessage, markSingle, markMultiple, deleteData, deleteDatas } from '@/api/message/messageCenter'
import { faultDataId } from '@/api/device/fault'
import { getFaultCodesData } from '@/api/device/alarm'
import { handelFaultData } from '@/api/device/fault'
export default {
  name: 'MessageCenter',
  data() {
    return {
      tableLoading: false,
      tableData: [],
      listQuery: {
        page: 1,
        limit: 8,
        total: 0
      },
      detailData: {
        title: '',
        created_at: '',
        data: []
      },
      detailShow: false,
      markData: {
        notification_ids: []
      },
      markAllStatus: false,
      readStatus: this.$t('strings.messageCenter.only_unread'),
      unreadQuery: {
        total: 0,
        page: 1
      },
      allQuery: {
        total: 0,
        page: 1
      },
      deleteStatus: false,
      // 处理弹窗的数据
      dialoghandleVisible: false,
      handleForm: {
        handler: '',
        state: '未处理',
        actual_fault_reason: '',
        actual_fault_opinion: '',
        actual_fault_code_id: '',
        releate_code: '',
        explanation: ''
      },
      statusArr: [
        { status: 'unprocessed', value: '未处理' },
        { status: 'processing', value: '处理中' },
        { status: 'processed', value: '已处理' },
        { status: 'fault_free', value: '无故障' }
      ],
      alarmArr: [],
      otherShow: false,
      handleShow: 'unprecessed',
      handleOptions: [
        { label: this.$t('strings.messageCenter.only_unread'), value: 'unread' },
        { label: this.$t('strings.messageCenter.read_all'), value: 'readall' }
      ],
      right_arrow: ''
    }
  },
  computed: {
    unreadCount() {
      return this.$store.getters.error_num
    }
  },
  created() {
    this.getMessageData()
  },
  methods: {
    rowClass(row, rowIndex) {
      if (!row.row.unread) {
        return 'unread_style'
      }
    },
    handleSelect(val) {
      if (val === 'processed') {
        this.otherShow = 'processed'
      } else if (val === 'fault_free') {
        this.otherShow = 'fault_free'
      } else {
        this.otherShow = ''
      }
    },
    // 选择对应的数据查看
    handleRead(val) {
      if (this.readStatus === this.$t('strings.messageCenter.only_unread')) {
        this.readStatus = this.$t('strings.messageCenter.read_all')
        this.getUnread(1)
      } else {
        this.readStatus = this.$t('strings.messageCenter.only_unread')
        this.getMessageData(1)
      }
    },
    // 获取数据
    getMessageData(val) {
      this.right_arrow = ''
      this.detailShow = false
      const page = val || 1
      this.tableLoading = true
      getMessage({ size: 8, page }).then(res => {
        this.tableLoading = false
        this.tableData = res.data.results
        this.allQuery.total = res.data.count
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.tableLoading = false
        this.$message.error(this.$t('errors.get_faild'))
      })
      getMessage({ size: 8, unread: true, page }).then(res => {
        this.$store.dispatch('setMessageNum', res.data.count)
      })
    },
    // 获取未读消息
    getUnread(val) {
      this.detailShow = false
      const page = val || 1
      this.tableLoading = true
      getMessage({ size: 8, unread: true, page }).then(res => {
        this.tableLoading = false
        this.$store.dispatch('setMessageNum', res.data.count)
        this.tableData = res.data.results
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.tableLoading = false
        this.$message.error(this.$t('errors.get_faild'))
      })
    },
    // 获取故障代码，处理时用
    getAlarmCodeData() {
      getFaultCodesData().then(res => {
        const data = res.data.data || []
        this.alarmArr = data.map(item => {
          const str = [item.code, ' ', item.name].join('')
          return {
            id: item.id,
            name: str
          }
        })
      }).catch(e => {
        console.log(e)
        this.$message.error(this.$t('labels.faultmanage.get_alarmCode_arror'))
      })
    },
    // 不为全选时
    handleSelectionChange(rows, row) {
      if (rows.length && rows.indexOf(row) !== -1) {
        this.markData.notification_ids.push(row.id)
      } else {
        this.markData.notification_ids = this.markData.notification_ids.filter(item => item !== row.id)
      }
    },
    markMulHandle() {
      this.tableLoading = true
      markMultiple(this.markData).then(res => {
        this.$message.success(this.$t('success.change_success'))
        this.markData.notification_ids = []
        this.getMessageData(this.listQuery.page)
      })
      // if (this.markAllStatus) {
      //   markAll().then(res => {
      //     debugger
      //   })
      // } else {
      //   markMultiple(this.markData).then(res => {
      //     debugger
      //     this.$message.success('修改成功')
      //     this.getMessageData(this.listQuery.page)
      //   })
      // }
    },
    // 全选本页
    handleSelectAll(val) {
      if (val.length) {
        val.forEach(item => {
          this.markData.notification_ids.push(item.id)
        })
      } else {
        this.markData.notification_ids = []
      }
    },
    // 查看某一条数据的详情
    seeDetail(val, col, event) {
      // if (this.deleteStatus) {
      //   this.deleteStatus = false
      //   return
      // }
      // this.right_arrow = event.currentTarget.rowIndex
      const oFaultData = val.extra
      this.handleShow = oFaultData.state
      // this.tableLoading = true
      this.detailData.title = val.title
      this.detailData.created_at = val.created_at
      faultDataId(oFaultData.fault_id).then(res => {
        this.tableLoading = false
        this.detailData.data = res.data
        this.detailShow = true
      }).catch(() => {
        this.tableLoading = false
        this.$message.error(this.$t('errors.get_faild'))
      })
      if (val.unread) {
        markSingle(val.id).then(res => {
          const id = val.id
          this.tableData = this.tableData.map(item => {
            if (id === item.id) {
              item.unread = false
            }
            return item
          })
        })
      }
    },
    // 分页操作
    handleCurrentChange(val) {
      if (this.readStatus === this.$t('strings.messageCenter.only_unread')) {
        this.allQuery.page = val
        this.listQuery.page = val
        this.getMessageData(val)
      } else {
        this.unreadQuery.page = val
        this.listQuery.page = val
        this.getUnread(val)
      }
    },
    // 删除一条数据的时候
    handleDelete(val, index) {
      this.deleteStatus = true
      this.$confirm(this.$t('confirm.message1'), this.$t('labels.reminder'), confirm).then(() => {
        this.tableLoading = true
        deleteData(val.id).then(res => {
          this.markData.notification_ids = []
          this.$message.success(this.$t('success.delete_success'))
          this.getMessageData()
        })
      }).catch(() => {
        this.$message({
          message: this.$t('messages.cancel_operate'),
          type: 'info',
          duration: 1000
        })
      })
    },
    // 批量删除的时候
    handleDeletes(val) {
      this.$confirm(this.$t('confirm.message2'), this.$t('labels.reminder'), confirm).then(() => {
        this.tableLoading = true
        deleteDatas(this.markData).then(res => {
          this.markData.notification_ids = []
          this.$message.success(this.$t('success.delete_success'))
          this.getMessageData()
        })
      }).catch(() => {
        this.$message({
          message: this.$t('messages.cancel_operate'),
          type: 'info',
          duration: 1000
        })
      })
    },
    handleDetail(val) {
      this.otherShow = false
      const oFaultData = val.extra
      this.handleShow = oFaultData.state
      this.tableLoading = true
      this.detailData.title = val.title
      this.detailData.created_at = val.created_at
      faultDataId(oFaultData.fault_id).then(res => {
        this.tableLoading = false
        this.detailData.data = res.data
        this.dialoghandleVisible = true
        this.clearForm()
        this.handelId = this.detailData.data.id
        this.handleForm.releate_code = this.detailData.data.content.alert_rule.fault_code.code
        this.handleForm.actual_code = this.detailData.data.content.alert_rule.fault_code.code
        this.handleForm.handler = this.$store.state.user.name
        this.getAlarmCodeData()
      }).catch(() => {
        this.tableLoading = false
        this.$message.error(this.$t('errors.get_faild'))
      })
    },
    // 清除操作
    clearForm() {
      this.$nextTick(() => {
        this.$refs['handleForm'].resetFields()
      })
    },
    // 处理故障消息
    handelUpdate(row) {
      this.$confirm(this.$t('confirm.message3'), this.$t('labels.reminder'), confirm).then(() => {
        this.tableLoading = true
        this.dialoghandleVisible = false
        this.handleForm.handler = this.$store.state.user.id
        handelFaultData(this.handelId, this.handleForm).then(res => {
          this.$message.success(this.$t('success.handle_success'))
          this.getMessageData()
        }).catch(() => {
          this.tableLoading = false
          this.$message.error(this.$t('success.handle_faild'))
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.markunread {
  color: #F56C6C;
}
.handel_box {
  padding:0 20% 0 5%;
  margin-top: 5%;
  .el-select {
    width: 100%!important;
  }
}
.el-minwidth {
  // min-width: 1020px;
  // height: 875px;
}
.mes-container {
  overflow: hidden;
  .el-dataList {
    height: 785px;
    border-radius: 16px;
    background-color: #fff;
    padding: 28px 24px 0 24px;
    box-sizing: border-box;
    .fault_header {
      padding: 0 20px 18px 20px;
      border-bottom: 1px solid #e6e6e6;
      span {
        font-size: 18px;
        color: #333;
      }
    }
    .header-action {
      height: 60px;
      padding: 15px 15px 0 15px;
      box-sizing: border-box;
      overflow: visible;
      .header-container {
        height: 100%;
        padding-left: 12px;
        // border-bottom: 1px solid #e6e6e6;
        // 标记已读
        .mark_read {
          width: 80px;
          height: 28px;
          padding: 0;
          margin-right: 16px;
          color: #666!important;
          border-radius: 10px;
          border-color: #b7b7b7;
          &:hover {
            background-color: #f3f6fc;
            color: #6484d4!important;
            border-color: #6484d4;
          }
          span {
            display: block;
            width: 80px;
            height: 28px;
            border-radius: 10px;
            border: 1px solid #ccc;
            line-height: 28px;
            text-align: center;
          }
        }
        .activeClass {
          color: #0f32b5!important;
          background-color: #f3f6fc;
          border-color: #0f32b5;
        }
        .delete_btn {
          width: 50px;
          height: 28px;
          padding: 0;
          color: #666!important;
          border-radius: 10px;
          border-color: #b7b7b7;
          &:hover {
            background-color: #f3f6fc;
            color: #6484d4!important;
            border-color: #6484d4;
          }
          &:active {
            color: #0f32b5!important;
            background-color: #f3f6fc;
            border-color: #0f32b5;
          }
        }
        .handleRead {
          width: 80px;
          height: 28px;
          float: right;
          padding: 0;
          color: #666!important;
          border-radius: 10px;
          border-color: #b7b7b7;
          &:hover {
            background-color: #f3f6fc;
            color: #6484d4!important;
            border-color: #6484d4;
          }
          &:active {
            color: #0f32b5!important;
            background-color: #f3f6fc;
            border-color: #0f32b5;
          }
        }
      }
    }
    .table_s {
      padding: 0 15px;
      &::before {
        display: none;
      }
      /deep/ .el-table__header-wrapper {
        // border-top: none;
        .el-table__header {
          .has-gutter {
            tr {
              th {
                .cell {
                  .el-checkbox {
                    // 不全选时
                    .is-indeterminate {
                      /deep/ .el-checkbox__inner {
                        background-color: #f3f6fc;
                        border-color: #0f32b5;
                        &::before {
                          background-color: #0f32b5;
                          top: 7px
                        }
                      }
                    }
                    // 全选时
                    .is-checked {
                      /deep/ .el-checkbox__inner {
                        background-color: #f3f6fc;
                        border-color: #0f32b5;
                        &::after {
                          height: 7px;
                          width: 3px;
                          transform: rotate(45deg) scaleY(1);
                          border-color: #0f32b5;
                        }
                      }
                    }
                    .el-checkbox__input {
                      /deep/ .el-checkbox__inner {
                        width: 18px;
                        height: 18px;
                        border-radius: 6px;
                        border-color: #b7b7b7;
                        &:hover {
                          background-color: #f3f6fc;
                          border-color: #6484d4;
                        }
                        &::after {
                          left: 6px;
                          top: 3px;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      /deep/ .el-table__body-wrapper {
        .el-table__body {
          .current-row > td {
            background-color: #e7ecf7!important;
          }
          .unread_style {
            td {
              .cell {
                .message-detail {
                  color: #b7b7b7;
                  font-size: 16px;
                  .time {
                    font-size: 12px;
                  }
                }
                .fault_rule {
                  font-size: 14px;
                  color: #b7b7b7;
                }
                .delete_btn {
                  .unprocessed {
                    font-size: 13px;
                    text-decoration:underline;
                    text-decoration-color: #6484d4;
                  }
                  .processed {
                    color: #b7b7b7;
                    font-size: 13px;
                    text-decoration:underline;
                    text-decoration-color: #b7b7b7;
                  }
                }
              }
            }
          }
          .el-table__row {
            td {
              &:hover {
                background-color: #f3f6fc;
              }
              .cell {
                .message-detail {
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
                .el-checkbox {
                  .is-checked {
                    /deep/ .el-checkbox__inner {
                      background-color: #f3f6fc;
                      border-color: #0f32b5;
                      &::after {
                        border-color: #0f32b5;
                      }
                    }
                  }
                  .el-checkbox__input {
                    .el-checkbox__inner {
                      width: 18px;
                      height: 18px;
                      border-radius: 6px;
                      border-color: #b7b7b7;
                      &:hover {
                        background-color: #f3f6fc;
                        border-color: #6484d4;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      .delete_btn {
        border: none;
        padding: 0;
        .delete_box {
          width: 18px;
          height: 18px;
          display: inline-block;
          text-decoration: underline;
          text-decoration-color: #6484d4;
          .hover_s {
            display: none;
          }
          &:hover {
            cursor: pointer;
            .normal_s {
              display: none;
            }
            .hover_s {
              display: inline-block;
            }
          }
        }
      }
      /deep/ .el-table__row {
        position: relative;
        &:hover {
          td {
            background-color: #f3f6fc;
          }
        }
        /deep/ .el-table-column--selection {
          .el-checkbox {
            .el-checkbox__inner {
              border-radius: 6px;
              &::after {
                left: 6px;
                top: 3px;
              }
            }
          }
        }
        /deep/ td {
          box-sizing: border-box;
          height: 60px!important;
        }
      }
    }
    .pagination_container {
      text-align: center;
      .el-pagination {
        display: inline-block;
        /deep/ .el-pagination__jump {
          margin-left: 0;
          /deep/ .el-input {
            /deep/ .el-input__inner {
              border-radius: 12px;
            }
          }
        }
      }
    }
  }
  .el-fault {
    height: 785px;
    margin-left: 16px;
    border-radius: 16px;
    background-color: #fff;
    padding: 26px 20px 0 20px;
    position: relative;
    overflow: auto;
    .empty_box {
      width: 384px;
      height: 384px;
      position: absolute;
      left: 50%;
      top: 10%;
      transform: translate(-50%);
      text-align: center;
      .empty_page {
        width: 384px;
        height: 384px;
      }
      .trip {
        display: inline-block;
        font-size: 16px;
        color: #Ccc;
      }
    }
    .card {
      width: 100%;
      height: 100%;
      .title {
        border-bottom: 1px solid #e6e6e6;
        padding: 0 10px;
        .title_trip {
          font-size: 18px;
          color: #333;
        }
        .time {
          color: #999;
          font-size: 12px;
          margin: 10px 0;
        }
      }
      .faultmessage, .faultdiagnosis  {
        .content {
          margin: 0 auto;
          padding: 10px 0 0 20px;
          .line_top {
            margin-top: 16px;
          }
          .row_class {
            display: flex;
            .label_text {
              width: 70px;
              font-size: 14px;
              color: #4d4d4d;
              font-weight: 600;
            }
            .content_text {
              font-size: 14px;
              color: #666;
              flex: 1;
              white-space: normal;
              margin-left: 10px;
            }
            .relate {
              width: 160px;
            }
            .real_code {
              width: 93px;
            }
          }
        }
      }
      .faultdiagnosis {
        border-top: 1px solid #e6e6e6;
        margin-top: 16px;
        .content {
          padding-top: 16px;
          padding-bottom: 10px;
        }
      }
    }
    // .footer-btn {
    //   float: right;
    //   margin-top: 30px;
    //   margin-bottom: 20px;
    // }
  }
}
</style>
