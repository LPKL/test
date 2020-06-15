<template>
  <div class="content_container toHideInput">
    <div class="el-content_title">
      <div class="el-title">{{ $t('strings.metadataManage.baseInformation') }}</div>
      <div class="el-metadata_desc">
        <span class="el-metadataabout">
          <label>{{ $t('strings.metadataManage.filedNum') }}:</label>
          <span>{{ total }}</span>
        </span>
        <span class="el-metadataabout">
          <label>{{ $t('strings.metadataManage.addTime') }}:</label>
          <span>{{ currentMetadata.created_at }}</span>
        </span>
        <span class="el-metadataabout">
          <label>{{ $t('strings.metadataManage.lastUpdate') }}:</label>
          <span>{{ currentMetadata.updated_at }}</span>
        </span>
        <div v-if="descInputShow" class="el-metadataabout el-descriptionStr">
          <div class="el-descInput">
            <label>{{ $t('strings.metadataManage.description') }}:</label>
            <el-input v-model="descriptionStr" placeholder="描述信息"/>
            <el-button class="save" type="primary" @click.stop="hideDescInput">{{ $t('buttons.save') }}</el-button>
            <el-button class="cancel" type="primary" @click.stop="handleCancelEdit">{{ $t('buttons.cancel') }}</el-button>
          </div>
        </div>
        <div v-else class="el-metadataabout el-descriptionStr">
          <label>{{ $t('strings.metadataManage.description') }}:</label>
          <span class="el-metadataDesc">{{ descriptionStr }}</span>
          <span class="el-descIcon" @click.stop="changeDesc">
            <svg-icon icon-class="metadatadesc"/>
          </span>
        </div>
      </div>
    </div>
    <div class="el-content_table">
      <div class="el-header">
        <div class="el-metaInformation">
          <span>字段信息</span>
          <!-- <el-button type="text" @click="fieldsFresh">{{ $t('buttons.refresh') }}</el-button> -->
        </div>
        <div class="el-metadataSearch">
          <div class="el-searchInput">
            <el-input v-model="metadataStr" :placeholder="$t('strings.metadataManage.field_display')" suffix-icon="el-icon-search" class="el-search_metadata" @change="handleSearch('', 1)"/>
            <el-select v-model="isUse" :placeholder="$t('strings.metadataManage.isUse')" class="isUse" @change="handleFilter">
              <el-option
                v-for="(item, index) in isUseArr"
                :key="index"
                :label="item.key"
                :value="item.value"/>
            </el-select>
            <UploadFile :id="currentMetadata.id"/>
            <el-button :disabled="checkBoxStatus" :class="{ 'activeAction': !checkBoxStatus }" class="delete" @click="batchDeleteDialogFormShow = true">{{ $t('strings.metadataManage.batch_delete') }}</el-button>
            <el-button :disabled="checkBoxStatus" :class="{ 'activeDelete': !checkBoxStatus }" class="copy" @click="batchDialogFormShow = true">{{ $t('strings.metadataManage.batch_operation') }}</el-button>
          </div>
        </div>
      </div>
      <div class="el-container">
        <el-table
          ref="multipleTable"
          :data="tableData"
          fit
          tooltip-effect="dark"
          style="width: 100%;height:600px;overflow: auto;"
          @select="selectCheckBox"
          @select-all="selectCheckBox">
          <el-table-column type="selection" width="55"/>
          <el-table-column label="字段名" prop="name" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="cellInputShow === 'name' && cellInputShowId === scope.row.id">
                <el-input v-model="scope.row.name" :disabled="!!scope.row.datasets.count" @blur="editField(scope.row)"/>
              </span>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="display_name" label="显示名" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="cellInputShow === 'display_name' && cellInputShowId === scope.row.id">
                <el-input v-model="scope.row.display_name" @blur="editField(scope.row)"/>
              </span>
              <span v-else>{{ scope.row.display_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="数据类型">
            <template slot-scope="scope">
              <span v-if="cellInputShow === 'type' && cellInputShowId === scope.row.id">
                <el-select v-model="scope.row.type" :disabled="!!scope.row.datasets.count" @change="editField(scope.row)">
                  <el-option
                    v-for="(item, index) in typeSelect"
                    :key="index"
                    :label="item.name"
                    :value="item.type"/>
                </el-select>
              </span>
              <span v-else>{{ scope.row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="precision" label="小数位">
            <template slot-scope="scope">
              <span v-if="cellInputShow === 'precision' && scope.row.type==='double' && cellInputShowId === scope.row.id">
                <el-input v-model="scope.row.other.precision" @blur="editField(scope.row)" />
              </span>
              <span v-else>{{ scope.row.other.precision }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="useNum" label="使用数据">
            <template slot-scope="scope">
              <el-popover
                v-if="scope.row.datasets.count !== 0"
                placement="top"
                width="400"
                trigger="click">
                <div class="popover_content">
                  <div class="title">使用数据</div>
                  <div v-for="(item, index) in scope.row.datasets.dataset" :key="index">
                    <span>{{ item.name }}</span>
                  </div>
                </div>
                <el-button slot="reference" type="text">{{ scope.row.datasets.count }}</el-button>
              </el-popover>
              <el-button v-else disabled type="text">0</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="otherAttributes" label="其他属性">
            <template slot-scope="scope">
              <el-popover
                v-if="handleOtherData(scope.row.other).length"
                placement="top"
                width="400"
                trigger="click">
                <div class="popover_content">
                  <div class="title">其他属性</div>
                  <!-- <div v-for="(item, index) in [...scope.row.other.standard_value, ...scope.row.other.allowable_value, ...scope.row.other.others]" :key="index"> -->
                  <div v-for="(item, index) in handleOtherData(scope.row.other)" :key="index">
                    <label>{{ otherAttrsMap[item.name] ? otherAttrsMap[item.name] : item.name }}</label>
                    <span>{{ item.value }}</span>
                  </div>
                </div>
                <el-button slot="reference" type="text">查看</el-button>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" min-width="200">
            <template slot-scope="scope">
              <el-button class="edit" @click.stop="editMetadata(scope.row)">{{ $t('buttons.edit') }}</el-button>
              <el-button class="delete" @click="handleDeleteFields(scope.row)">{{ $t('buttons.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="pagination-container">
      <el-pagination
        :current-page="listQuery.page"
        :page-size="listQuery.limit"
        :total="listQuery.total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"/>
    </div>
    <!-- 批量复制/移动 -->
    <el-dialog
      :visible.sync="batchDialogFormShow"
      :close-on-click-modal="false"
      :title="$t('strings.metadataManage.batch_operation')"
      :show-close="false"
      width="408px"
      class="el-batch-operation">
      <el-form ref="groupForm" status-icon label-width="100px" class="ruleForm" style="margin-left:30px;">
        <el-form-item :label="$t('strings.metadataManage.chooseMetadata')" prop="name">
          <el-select v-model="aimsId" :placeholder="$t('strings.select')">
            <el-option
              v-for="(item, index) in allMetadata"
              :key="index"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchDialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="handleMultipleCopy">{{ $t('buttons.copy') }}</el-button>
        <el-button type="primary" @click="handleMultipleMove">{{ $t('buttons.move') }}</el-button>
      </div>
    </el-dialog>
    <!-- 批量删除 -->
    <el-dialog
      :visible.sync="batchDeleteDialogFormShow"
      :close-on-click-modal="false"
      title="批量删除"
      width="408px"
      class="el-batch-delete">
      <span>确定删除已选字段吗?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchDeleteDialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="delete" @click="handleMultiple">删除</el-button>
      </div>
    </el-dialog>
    <!-- 单个删除 -->
    <el-dialog
      :visible.sync="singleDeleteDialogFormShow"
      :close-on-click-modal="false"
      title="提示"
      width="408px"
      class="el-batch-delete">
      <span>确定删除该字段吗?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="singleDeleteDialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="delete" @click="handleSingle">删除</el-button>
      </div>
    </el-dialog>
    <!-- 编辑字段信息 -->
    <EditMetadataField
      :dialog-visible="tableVisible"
      :field-data="currentEditField"
      :current-metadata="currentMetadata.id"
      @visibleChange = "closeEditDialog"
      @handleFresh = "fieldsFresh"
      @resetFieldData = "clearBefore"/>
  </div>
</template>

<script>
import UploadFile from './uploadFile'
import EditMetadataField from './editmetadatafiled'
import { deleteSingleFileds, searchFieldsName, multipleDelete, multipleMove, addFieldsData, editFields } from '@/api/datamining/metadata'
import debounce from 'lodash/debounce'
import { setTimeout } from 'timers'
// import { types } from '@babel/core'
export default {
  name: 'MetadataContent',
  components: {
    UploadFile,
    EditMetadataField
  },
  props: {
    metadataData: {
      type: Array,
      default: () => []
    },
    currentMetadata: {
      type: Object,
      default: () => {}
    },
    allMetadata: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tableData: [],
      metadataStr: '',
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        pageLength: 0
      },
      descriptionStr: '',
      aimsId: null,
      isUse: 2,
      isUseArr: [
        { key: '全部', value: 2 },
        { key: '已使用', value: 1 },
        { key: '未使用', value: 0 }
      ],
      cellInputShow: '',
      cellInputShowId: null,
      descInputShow: false,
      typeSelect: [
        { name: 'double', type: 'double' },
        // { name: 'enumeration', type: 'enumeration' },
        { name: 'bigint', type: 'bigint' },
        { name: 'string', type: 'string' },
        { name: 'boolean', type: 'boolean' },
        { name: 'date', type: 'date' },
        { name: 'timestamp', type: 'timestamp' }
      ],
      checkBoxStatus: true,
      // 批量操作
      batchDialogFormShow: false,
      batchDeleteDialogFormShow: false,
      // 编辑字段弹窗
      tableVisible: false,
      currentEditField: {},
      mutipleDeleteArr: [],
      mutipleMoveArr: [],
      recordCurrentRow: {},
      otherAttrsMap: {
        format: '时间格式',
        precision: '小数位',
        // enumeration_value: '枚举值',
        unit: '单位'
      },
      singleDeleteDialogFormShow: false,
      singleDeleteObj: {},
      batchDeleteArr: []
    }
  },
  watch: {
    metadataData: function(newer, old) {
      this.checkBoxStatus = true
      this.tableData = newer.map(item => {
        if (typeof item.other === 'string') {
          item.other = JSON.parse(item.other)
        }
        return item
      })
      this.listQuery.pageLength = newer.length
    },
    currentMetadata: function(newer, old) {
      this.descriptionStr = newer.description
    },
    total: function(newer, old) {
      this.listQuery.total = newer
    }
  },
  mounted() {
    // 将输入框隐藏
    // document.getElementsByClassName('app_container')[0].addEventListener('click', (e) => {
    //   if (e.target.nodeName === 'INPUT') return
    //   this.cellInputShow = ''
    //   this.cellInputShowId = ''
    // })
  },
  methods: {
    // 触发页面的更新
    fieldsFresh: debounce(function() {
      // this.$emit('fresh', this.currentMetadata)
      this.handleCurrentChange(this.listQuery.page)
    }),
    // // 描述输入框显示的问题
    showEditInput: debounce(function() {
      this.descInputShow = true
    }, 500),
    hideEditInput: debounce(function() {
      setTimeout(() => {
        this.descInputShow = false
      }, 200)
    }, 500),
    // 双击可输入表格时出现输入框
    // tabClick(row, column, cell, event) {
    //   this.recordCurrentRow = JSON.parse(JSON.stringify(row))
    //   this.cellInputShowId = row.id
    //   switch (column.property) {
    //     case 'name':
    //       this.cellInputShow = 'name'
    //       break
    //     case 'display_name':
    //       this.cellInputShow = 'display_name'
    //       break
    //     case 'type':
    //       this.cellInputShow = 'type'
    //       break
    //     case 'precision':
    //       this.cellInputShow = 'precision'
    //       break
    //     default: return
    //   }
    // },
    // 点击表格其它地方，让输入框消失
    changeInputStatus() {
      this.cellInputShow = ''
      this.cellInputShowId = null
    },
    // 输入框的提交
    editField(val) {
      const jsonOlder = JSON.stringify(this.recordCurrentRow)
      const jsonNew = JSON.stringify(val)
      this.cellInputShowId = null
      this.cellInputShow = ''
      // 因为数据内key的位置不会发生变化,可用
      if (jsonOlder === jsonNew) return
      editFields(this.currentMetadata.id, val.id, val).then(res => {
        this.$message.success('修改成功!')
      })
    },
    // 修改描述
    changeDesc() {
      this.descInputShow = true
    },
    // 隐藏描述框
    hideDescInput() {
      this.descInputShow = false
      // this.$emit('loadingChange', true)
      this.$emit('changeMetadata', this.currentMetadata.id, { description: this.descriptionStr })
    },
    // 编辑描述取消
    handleCancelEdit() {
      if (this.descriptionStr !== this.currentMetadata.description) {
        this.descriptionStr = this.currentMetadata.description
      }
      this.descInputShow = false
    },
    // 已使用未使用的筛选
    handleFilter(val, p) {
      this.listQuery.page = 1
      const page = p || 1
      let temp = { state: val, page: page }
      if (this.metadataStr) {
        temp = { state: val, q: this.metadataStr, page }
      }
      this.$emit('handleFilter', temp)
    },
    // 点击复选框时的操作
    selectCheckBox(selection, row) {
      this.mutipleDeleteArr = []
      this.mutipleMoveArr = []
      this.batchDeleteArr = []
      this.batchDeleteArr = selection
      this.checkBoxStatus = false
      if (!selection.length) {
        this.checkBoxStatus = true
        return
      }
      this.mutipleMoveArr = selection
      let temp = []
      temp = []
      selection.forEach(item => {
        temp.push(item.id)
      })
      // 将other转成json！！！！
      this.mutipleDeleteArr = temp
    },
    // 编辑元数据
    editMetadata(val) {
      this.currentEditField = val
      this.tableVisible = true
    },
    clearBefore(val) {
      this.currentEditField.type = val.type
      this.currentEditField.other = {
        is_enum: false,
        format: '',
        precision: '',
        unit: '',
        standard_value: [],
        allowable_value: [],
        customizes: [],
        range: ''
      }
    },
    closeEditDialog(val) {
      this.tableVisible = val
    },
    // 元数据的删除
    handleDeleteFields(val) {
      if (val.datasets.count) {
        this.$message.error('字段被引用无法删除!')
        return
      }
      this.singleDeleteDialogFormShow = true
      this.singleDeleteObj = val
    },
    handleSingle() {
      this.singleDeleteDialogFormShow = false
      deleteSingleFileds(this.currentMetadata.id, this.singleDeleteObj.id).then(res => {
        this.singleDeleteObj = {}
        // this.$emit('fresh', this.currentMetadata)
        this.handleCurrentChange(this.listQuery.page)
      })
    },
    // 字段的搜索
    handleSearch(str, p) {
      this.listQuery.page = p
      if (!this.metadataStr) {
        this.fieldsFresh()
        return
      }
      const page = p || 1
      const used = (this.isUse === 1 || this.isUse === 0) ? this.isUse : 2
      let temp = { q: this.metadataStr, page }
      if (used !== 2) {
        temp = { q: this.metadataStr, page: page, used }
      }
      searchFieldsName(this.currentMetadata.id, temp).then(res => {
        this.tableData = res.data.results.map(item => {
          if (typeof item.other === 'string') {
            item.other = JSON.parse(item.other)
          }
          return item
        })
        this.listQuery.total = res.data.count
      })
    },
    // 批量删除
    handleMultiple() {
      const flag = this.batchDeleteArr.some(item => item.datasets.count)
      if (flag) {
        this.batchDeleteDialogFormShow = false
        this.$message.error('存在被使用字段,不可删除!')
        return
      }
      multipleDelete(this.currentMetadata.id, { field_ids: this.mutipleDeleteArr }).then(res => {
        this.batchDeleteDialogFormShow = false
        this.checkBoxStatus = true
        this.fieldsFresh()
      })
    },
    // 批量复制
    handleMultipleCopy() {
      this.mutipleMoveArr = this.mutipleMoveArr.map(item => {
        item.other = JSON.stringify(item.other)
        return item
      })
      addFieldsData(this.aimsId, this.mutipleMoveArr).then(res => {
        this.aimsId = ''
        this.batchDialogFormShow = false
        this.checkBoxStatus = true
        this.fieldsFresh()
      }).catch(e => {
        if (e.status === 400) {
          this.$message.error('元数据包含的字段名称必须唯一!')
        }
      })
    },
    // 批量移动
    handleMultipleMove() {
      multipleMove(this.currentMetadata.id, { to_metadata_id: this.aimsId, field_ids: this.mutipleDeleteArr }).then(res => {
        this.aimsId = ''
        this.batchDialogFormShow = false
        this.checkBoxStatus = true
        this.fieldsFresh()
      }).catch(e => {
        if (e.status === 400) {
          this.$message.error('元数据包含的字段名称必须唯一!')
        }
      })
    },
    handleOtherData(val) {
      // 对other数据进行处理
      const temp = []
      for (const key in val) {
        if (val[key] instanceof Array && val[key].length) {
          temp.push(...val[key])
        } else if (!(val[key] instanceof Array) && val[key]) {
          if (key !== 'is_enum' && key !== 'range') {
            temp.push({
              name: key,
              value: val[key]
            })
          } else if (key === 'range') {
            temp.push({
              name: '枚举值',
              value: val[key]
            })
          }
        }
      }
      return temp
    },
    // 分页的操作
    handleCurrentChange(page) {
      this.$emit('loadingChange', true)
      this.listQuery.page = page
      if ((this.isUse === 1 || this.isUse === 0) && !this.metadataStr) {
        // 此处为是否使用的分页操作
        this.$emit('handleFilter', { state: this.isUse, page })
      } else if (this.metadataStr) {
        this.handleSearch('', page)
      } else {
        this.$emit('pageChange', { currentMetadata: this.currentMetadata, page: page })
      }
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .content_container {
    .el-content_title {
      background-color: #fff;
      border-radius: 16px;
      padding-left: 24px;
      border: 1px solid transparent;
      .el-title {
        margin-top: 20px;
        font-size: 18px;
        color: #4d4d4d;
      }
      .el-metadata_desc {
        margin-top: 8px;
        .el-metadataabout {
          display: inline-block;
          height: 36px;
          line-height: 36px;
          margin-right: 40px;
          label {
            font-size: 16px;
            color: #999;
            font-weight: 400;
          }
          span {
            font-size: 16px;
            color: #333;
            margin-left: 8px;
          }
        }
        .el-descriptionStr {
          height: 36px;
          display: inline-block;
          margin-bottom: 20px;
          .el-descIcon {
            display: inline-block;
            width: 104px;
            height: 32px;
            svg {
              vertical-align: middle;
            }
          }
          .el-metadataDesc {
            display: inline-block;
            max-width: 200px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            vertical-align: bottom;
          }
        }
        .el-descInput {
          display: flex;
          height: 36px;
          label {
            display: inline-block;
            width: 40px;
            margin-right: 8px;
          }
          .el-button {
            width: 40px;
            height: 24px;
            border-radius: 4px;
            padding: 0;
            margin-top: 8px;
            span {
              display: inline-block;
              font-size: 12px;
            }
          }
          .save {
            color: #fff;
            background-color: #2b5bd6;
            &:hover {
              background-color: #4773e2
            }
            &:active {
              background-color: #123ecc;
            }
          }
          .cancel {
            background-color: #fff;
            color: #808080;
            margin-left: 8px;
            &:hover,&:active {
              color: #2b5bd6;
              text-decoration: underline;
              text-decoration-color: #123ecc;
            }
          }
          .el-input {
            flex: 1;
            margin-right: 8px;
            /deep/ .el-input__inner {
              height: 36px;
            }
          }
        }
      }
    }
    .el-content_table {
      background-color: #fff;
      height: 756px;
      margin-top: 16px;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      padding: 16px 0 0 24px;
      .el-header {
        padding: 0;
        .el-metaInformation {
          span {
            font-size: 18px;
            color: #444;
          }
        }
        .el-metadataSearch {
            .el-searchInput {
              .el-search_metadata {
                margin-top: 18px!important;
                width: 192px;
                margin: 0 16px 0 0;
                /deep/ .el-input__inner {
                  width: 192px;
                  height: 36px;
                  border-radius: 12px;
                  border: 1px solid #e6e6e6;
                  font-family: sy_light;
                  &:hover {
                    border-color: #ccc;
                  }
                }
                // /deep/ .el-input__suffix {
                //   right: 15px;
                // }
              }
              /deep/ .el-select {
                margin-top: 18px;
                width: 112px;
                margin-right: 8px;
                .el-input {
                  .el-input__inner {
                    width: 112px;
                    height: 36px;
                    border-radius: 12px;
                    border: 1px solid #e6e6e6;
                    font-family: sy_light;
                  }
                  .el-input__suffix {
                    .el-input__suffix-inner {
                    .el-select__caret  {
                        display: none;
                      }
                      &::after {
                        content: '';
                        width: 0px;
                        height: 0px;
                        border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-top: 8px solid #606266;
                        position: relative;
                        top: 23px;
                      }
                    }
                  }
                }
              }
              .el-button {
                width: 96px;
                height: 40px;
                float: right;
                margin-top: 18px;
                border-radius: 8px;
                color: #ccc;
                border: 1px solid #ccc;
                background-color: #fff;
                margin-right: 16px;
              }
              .activeDelete{
                border: 1px solid #2b5bd6;
                background-color: #fff;
                color: #4d4d4d;
                &:hover {
                  border-color: #4773e2;
                  background-color: #f4f5fb;
                  color: #2b5bd6;
                }
                &:active {
                  border-color: #123ecc;
                  background-color: #f4f5fb;
                  color: #123ecc;
                }
              }
              .activeAction{
                border: 1px solid #d82145;
                background-color: #fff;
                color: #4d4d4d;
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
            }
          }
        .container {}
      }
      .el-container {
        margin-top: 16px;
        /deep/ .el-table {
          &::before {
            display: none;
          }
          .el-table__header-wrapper {
            .el-table__header {
              .has-gutter {
                th {
                  .cell {
                    font-size: 14px;
                    color: #808080;
                    .el-checkbox {
                      .el-checkbox__inner {
                        display: inline-block;
                        width: 18px;
                        height: 18px;
                        border-radius: 6px;
                        &::before {
                          top: 7px;
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
          /deep/ .el-table__body-wrapper {
            .el-table__body {
              .el-table__row {
                td {
                  height: 56px;
                }
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
                  .el-checkbox {
                    .el-checkbox__inner {
                      display: inline-block;
                      width: 18px;
                      height: 18px;
                      border-radius: 6px;
                      &::before {
                        top: 7px;
                      }
                      &::after {
                        left: 6px;
                        top: 3px;
                      }
                    }
                  }
                  .edit,.delete {
                    width: 64px;
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
                  .edit {
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
      }
    }
    /deep/ .pagination-container {
      padding-bottom: 20px;
      margin-top: 0;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      background-color: #fff;
      .el-pagination {
        margin-left: 30px;
        font-family: sy_regular;
        .el-pagination__jump {
          .el-input {
            .el-input__inner {
              border-radius: 12px;
            }
          }
        }
      }
    }
  }
  .el-batch-operation {
    /deep/ .el-dialog {
      border-radius: 16px;
      .el-dialog__header {
        .el-dialog__title {
          margin-left: 10px;
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
        padding: 0;
        padding-top: 20px;
        /deep/ .el-form {
          margin-left: 15px!important;
          margin-bottom: 60px;
          .el-form-item {
            .el-form-item__label {
              font-size: 14px;
              font-weight: 400;
              font-family: sy_regular;
            }
          }
        }
      }
    }
  }
  .el-batch-delete {
    /deep/ .el-dialog {
      margin-top: 25vh;
      border-radius: 16px;
      .el-dialog__header {
        .el-dialog__title {
          margin-left: 15px;
          font-family: sy_regular;
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
        font-family: sy_regular;
      }
      .el-dialog__footer {
        .dialog-footer {
          .el-button {
            font-family: sy_regular;
          }
          .delete {
            background-color: #e53c65;
            color: #fff;
          }
        }
      }
    }
  }
</style>
