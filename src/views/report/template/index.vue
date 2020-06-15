<template>
  <div class="app_container">
    <el-header class="filter_header" style="text-align: left;margin-top:10px; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input v-model="tmpName" :placeholder="$t('labels.template.name')" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter"/>
        <div class="header-btn_creat">
          <el-button class="el-add_alarm" icon="el-icon-plus" @click="jumpCreateTemplatePage()">{{ $t('buttons.template.create') }}</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="main_container">
      <el-tabs v-model="templateTypeTab" @tab-click="templateTypeTabChange">
        <el-tab-pane :label="$t('labels.template.shareTemplate')" name="enterprise">
          <div style="height: 630px;">
            <el-table
              v-loading.body="shareTableLoading"
              :data="templateShareData"
              fit
              highlight-current-row
              style="width: 100%;height:615px;overflow-y: auto; margin-top: 1px;">
              <el-table-column :label="$t('labels.numb')" fixed="left" align="center" width="80%" type ="index"/>
              <el-table-column :label="$t('labels.template.name')" show-overflow-tooltip fixed="left">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.desc')" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="!scope.row.description">--</span>
                  <span>{{ scope.row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.update_time')" show-overflow-tooltip min-width="180px" >
                <template slot-scope="scope">
                  <span>{{ scope.row.updated_at }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.creator')" show-overflow-tooltip min-width="160px" >
                <template slot-scope="scope">
                  <span>{{ scope.row.creator.username }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.actions')" align="center">
                <template slot-scope="scope">
                  <div style="height: 36px">
                    <el-button size="small" class="new-btn-other" @click="openPreviewTemplateDialog(scope.row)">{{ $t('buttons.preview') }}</el-button>
                    <el-button v-show="scope.row.creator.username === currentUser" size="small" class="new-btn-other" @click="jumpUpdateTemplatePage(scope.row)">{{ $t('buttons.edit') }}</el-button>
                    <!-- 超级管理员和作者可以删除/编辑 -->
                    <el-button v-show="scope.row.creator.username === currentUser" size="small" class="new-btn-other delete" @click="openDeleteTemplateDialog(scope.row)">{{ $t('buttons.delete') }}</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('labels.template.personalTemplate')" name="personal">
          <div style="height: 630px;">
            <el-table
              v-loading.body="personalTableLoading"
              :data="templatePersonalData"
              fit
              highlight-current-row
              style="width: 100%;height:615px;overflow-y: auto;margin-top: 1px;">
              <el-table-column :label="$t('labels.numb')" fixed="left" width="80%" align="center" type="index"/>
              <el-table-column :label="$t('labels.template.name')" show-overflow-tooltip fixed="left">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.desc')" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="!scope.row.description">--</span>
                  <span>{{ scope.row.description }}</span>
                  <!-- <el-popover v-else placement="top" width="200" trigger="hover">
                    <p>{{ scope.row.description }}</p>
                    <div slot="reference" class="description">
                      {{ scope.row.description }}
                    </div>
                  </el-popover> -->
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.update_time')" show-overflow-tooltip min-width="180px">
                <template slot-scope="scope">
                  <span>{{ scope.row.updated_at }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.creator')" show-overflow-tooltip min-width="160px">
                <template slot-scope="scope">
                  <span>{{ scope.row.creator.username }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('labels.actions')" align="center">
                <template slot-scope="scope">
                  <div style="height: 36px;">
                    <el-button size="small" class="new-btn-other" @click="openPreviewTemplateDialog(scope.row)">{{ $t('buttons.preview') }}</el-button>
                    <el-button size="small" class="new-btn-other" @click="jumpUpdateTemplatePage(scope.row)">{{ $t('buttons.edit') }}</el-button>
                    <el-button size="small" class="new-btn-other delete" @click="openDeleteTemplateDialog(scope.row)">{{ $t('buttons.delete') }}</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <el-dialog :visible.sync="dialogPreviewVisible" :title="$t('buttons.preview')" :before-close="closePreviewTemplateDialog" :close-on-click-modal="false" class="new-dialog">
      <template-view :templatedata="previewJson"/>
    </el-dialog>
  </div>
</template>

<script>
import { getTemplates, deleteTemplate } from '@/api/report/template'
import templateView from './view'
export default {
  name: 'Template',
  components: {
    // Tmp
    'template-view': templateView
  },
  data() {
    return {
      tmpName: '',
      templateTypeTab: 'enterprise',
      shareTableLoading: false,
      personalTableLoading: false,
      templateShareData: [],
      templatePersonalData: [],
      listQuery: {
        page: 1,
        limit: 10,
        total: 1
      },
      templateForm: {
        name: '',
        description: '',
        share: 0
      },
      dialogPreviewVisible: false,
      previewJson: '',
      currentUser: this.$store.state.user.name
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData(val) {
      this.shareTableLoading = true
      getTemplates({ 'page': 1, 'type': 'enterprise' }).then(res => {
        const data = res.data.data
        this.templateShareData = data
        this.listQuery.total = res.data.count
        this.shareTableLoading = false
      }).catch(error => {
        console.log('getTemplate enterprise', error)
        this.shareTableLoading = false
      })
    },
    getPageTable(cpage, type) {
      if (type === 'enterprise') {
        getTemplates({
          'fuzzy_name': this.tmpName,
          'type': 'enterprise',
          'page': cpage }).then(res => {
          const data = res.data.data
          this.templateShareData = data
          this.listQuery.total = res.data.count
          this.shareTableLoading = false
        }).catch(error => {
          console.log('getTemplate enterprise', error)
          this.shareTableLoading = false
        })
      } else if (type === 'personal') {
        getTemplates({
          'name': this.tmpName,
          'type': 'personal',
          'auth_user': this.$store.state.user.id,
          'page': cpage }).then(res => {
          const data = res.data.data
          this.templatePersonalData = data
          this.listQuery.total = res.data.count
          this.personalTableLoading = false
        }).catch(error => {
          console.log('getTemplate personal', error)
          this.personalTableLoading = false
        })
      }
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getPageTable(this.listQuery.page, this.templateTypeTab)
    },
    templateTypeTabChange(tab, event) {
      this.listQuery.page = 1
      this.templateTypeTab = tab.name
      this.getPageTable(this.listQuery.page, this.templateTypeTab)
    },
    openPreviewTemplateDialog(row) {
      this.previewJson = JSON.parse(row.content_json)
      this.dialogPreviewVisible = true
    },
    closePreviewTemplateDialog() {
      this.previewJson = {}
      this.$emit('templatedata', this.previewJson = {})
      this.dialogPreviewVisible = false
    },
    handleFilter() {
      // 搜索
      this.listQuery.page = 1
      this.getPageTable(this.listQuery.page, this.templateTypeTab)
    },
    jumpCreateTemplatePage() {
      this.$router.push({ name: 'TemplateEditor' })
    },
    jumpUpdateTemplatePage(row) {
      // const tempData = Object.assign({}, this.alarmRuleForm)
      // this.$router.push({ path: '/templateConfig/edit' + row.id })
      this.$router.push({ name: 'TemplateEditor', params: { template: row }})
    },
    openDeleteTemplateDialog(row) {
      this.$confirm(this.$t('strings.template.delete_confirm'), this.$t('labels.reminder'), {
        confirmButtonText: this.$t('buttons.confirm'),
        cancelButtonText: this.$t('buttons.cancel'),
        type: 'warning'
      }).then(() => {
        deleteTemplate(row.id).then(res => {
          this.$message.success(this.$t('messages.delete_success'))
          this.getPageTable(1, this.templateTypeTab) // 删除操作后，暂且返回第一页数据
        }).catch(e => {
          this.$message.error(e.message)
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    }
  }
}

</script>

