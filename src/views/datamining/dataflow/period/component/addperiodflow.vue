<template>
  <div :class="{ 'periodFlow': !periodFlowLength }" class="main_containers">
    <!-- <el-row> -->
    <div v-if="existFlowData.length" class="el-exist">
      <h3>{{ $t('strings.dataAbout.already_add') }}</h3>
      <div class="el-periodFlow">
        <el-table
          :data="existFlowData"
          :highlight-current-row="false"
          fit>
          <el-table-column :label="$t('labels.period.task_name')" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.model_name')" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.models.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.operate_cycle')" align="center">
            <template slot-scope="scope">
              <span>{{ workPeriod[scope.row.periodic_type] }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center">
            <template slot-scope="scope">
              <div class="delete_btn" @mousemove="showSvg(scope.$index)" @mouseout="hideSvg(scope.$index)" @click="deletePeriodFlowData(scope.row, scope.$index)" >
                <span>
                  <svg-icon icon-class="delete_d" class="defaultS" />
                  <svg-icon icon-class="delete_h" class="hoverS" />
                  <svg-icon icon-class="delete_c" class="clickS" />
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="el-addFlow">
      <h3>{{ $t('strings.dataAbout.add_period_task') }}</h3>
      <div class="form_container">
        <el-form ref="periodPutForm" :model="periodForm" :rules="rules" label-position="right" label-width="110px">
          <el-form-item :label="$t('labels.period.task_name')" prop="name">
            <el-input v-model="periodForm.name" class="new-input"/>
          </el-form-item>
          <el-form-item
            :label="$t('labels.period.select_model')"
            :prop="periodForm.model ? 'model' : (periodForm.pipline ? 'pipeline' : '')">
            <SelectRich
              v-model="currentModelValue"
              :options="allModel"
              :option-key="{ value: 'id', label: 'name' }"
              :combind-value="['id','type']"
              :filter-by="filterBy"
              :filterable="true"
              :clearable="true" />
          </el-form-item>
          <el-form-item :label="$t('labels.period.time_capture')" prop="time_field">
            <el-select v-model="periodForm.time_field" :placeholder="$t('labels.choose')" class="new-input">
              <el-option
                v-for="(item, index) in schema_Data"
                :key="index"
                :label="item.name"
                :value="item.name"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('labels.period.data_capture_region')" prop="is_total">
            <el-radio-group v-model="periodForm.is_total">
              <el-radio :label="true">{{ $t('labels.period.is_total_capture') }}</el-radio>
              <el-radio :label="false">{{ $t('labels.period.is_increasement_capture') }}</el-radio>
            </el-radio-group>
            <el-tooltip class="intro" effect="dark" placement="top">
              <div slot="content">
                {{ lineOne }}
                <br>
                {{ lineTwo }}
              </div>
              <svg-icon icon-class="question" class="question"/>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('labels.period.operate_cycle')" prop="periodic_type" class="action_period">
            <el-select
              v-model="periodForm.periodic_type"
              :placeholder="$t('labels.choose')"
              class="new-input select_width"
              @change="handleChange">
              <el-option
                v-for="(item, index) in periodSelect"
                :key="index"
                :label="item.name"
                :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="periodForm.periodic_type === 'day'" :label="$t('labels.period.execute_time')" prop="run_at" class="day_work_period">
            <el-time-picker
              v-model="periodForm.run_at"
              :placeholder="$t('labels.period.operate_cycle')"
              arrow-control
              format="HH:mm"/>
          </el-form-item>
          <div v-if="periodForm.periodic_type === 'week'" class="week_box" style="overflow:hidden">
            <el-form-item :label="$t('labels.period.operate_cycle')" prop="day_of_week" class="week_day_of_week" style="float: left;margin-right:10px;">
              <el-select v-if="periodForm.is_total" v-model="periodForm.day_of_week" :key="11" multiple placeholder="请选择" class="new-input select_width">
                <el-option
                  v-for="(item, index) in weekSelect"
                  :key="index"
                  :label="item.name"
                  :value="item.value"/>
              </el-select>
              <el-select v-else v-model="periodForm.day_of_week" :key="12" :placeholder="$t('labels.choose')" class="new-input select_width">
                <el-option
                  v-for="(item, index) in weekSelect"
                  :key="index"
                  :label="item.name"
                  :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item class="week_run_at" prop="run_at" style="float:left">
              <el-time-picker
                v-model="periodForm.run_at"
                :placeholder="$t('labels.period.operate_cycle')"
                arrow-control
                format="HH:mm"/>
            </el-form-item>
          </div>
          <div v-if="periodForm.periodic_type === 'month'" class="month_box" style="overflow:hidden">
            <el-form-item :label="$t('labels.period.execute_time')" prop="day_of_month" style="float: left;margin-right:10px;" class="week_day_of_week">
              <el-select v-if="periodForm.is_total" v-model="periodForm.day_of_month" :key="13" :placeholder="$t('labels.choose')" multiple class="new-input select_width">
                <el-option
                  v-for="(item, index) in dateSelect"
                  :key="index"
                  :label="item.date"
                  :value="item.value"/>
              </el-select>
              <el-select v-else v-model="periodForm.day_of_month" :key="14" :placeholder="$t('labels.choose')" class="new-input select_width">
                <el-option
                  v-for="(item, index) in dateSelect"
                  :key="index"
                  :label="item.date"
                  :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item class="week_run_at" prop="run_at" style="float: left">
              <el-time-picker
                v-model="periodForm.run_at"
                :placeholder="$t('labels.period.operate_cycle')"
                arrow-control
                format="HH:mm"/>
            </el-form-item>
          </div>
          <el-form-item :label="$t('labels.period.start_time')" class="start_period_time">
            <el-date-picker
              v-model="periodForm.started_at"
              :placeholder="$t('labels.period.choose_data')"
              arrow-control/>
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button class="el-cancel" @click="closeDialog">{{ $t('buttons.cancel') }}</el-button>
          <el-button class="el-submit" @click="addPeriodFlowData">{{ $t('buttons.confirm') }}</el-button>
          <el-button type="primary" class="el-keepSubmit" @click="keepAddPeriodFlowData">{{ $t('strings.dataAbout.keep_add') }}</el-button>
        </div>
      </div>
    </div>
    <!-- </el-row> -->
  </div>
</template>

<script>
import { addPeriodFlow, getPeriodDataFlow } from '@/api/datamining/period/periodDataUrl'
import { deletePeriodFlow } from '@/api/datamining/period/periodListUrl'
import { getOneSchema } from '@/api/datamining/historydata'
import SelectRich from '@/components/SelectRich'
export default {
  name: 'AddPeriodFlow',
  components: {
    SelectRich
  },
  props: {
    allModel: {
      type: Array,
      default: () => []
    },
    addId: {
      type: Number,
      default: null
    },
    count: {
      type: Number,
      default: null
    },
    currentPeriod: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      periodForm: {
        name: '',
        is_total: true,
        model: '',
        pipeline: '',
        type: '', // 后期要动态获取类型
        time_field: '',
        periodic_type: 'day',
        run_at: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '02', '00'),
        day_of_week: null,
        day_of_month: null,
        // start_at: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), new Date().getHours(), new Date().getMinutes())
        started_at: new Date()
      },
      filterBy: { key: 'type', value: [{ label: '单独模型', value: 'model' }, { label: '组合模型', value: 'pipeline' }], single: false },
      firstMonth: '首月',
      modelSelect: [],
      periodSelect: [
        { name: this.$t('strings.flowAbout.everyday'), value: 'day' },
        { name: this.$t('strings.flowAbout.everyweek'), value: 'week' },
        { name: this.$t('strings.flowAbout.everymonth'), value: 'month' }
      ],
      weekSelect: [
        { name: this.$t('strings.dataAbout.Monday'), value: 1 },
        { name: this.$t('strings.dataAbout.Tuesday'), value: 2 },
        { name: this.$t('strings.dataAbout.Wednesday'), value: 3 },
        { name: this.$t('strings.dataAbout.Thursday'), value: 4 },
        { name: this.$t('strings.dataAbout.Friday'), value: 5 },
        { name: this.$t('strings.dataAbout.Saturday'), value: 6 },
        { name: this.$t('strings.dataAbout.Sunday'), value: 0 }
      ],
      existFlowData: [],
      dateSelect: [
        { date: '最后一天', value: '-1' },
        { date: '1号', value: 1 },
        { date: '2号', value: 2 },
        { date: '3号', value: 3 },
        { date: '4号', value: 4 },
        { date: '5号', value: 5 },
        { date: '6号', value: 6 },
        { date: '7号', value: 7 },
        { date: '8号', value: 8 },
        { date: '9号', value: 9 },
        { date: '10号', value: 10 },
        { date: '11号', value: 11 },
        { date: '12号', value: 12 },
        { date: '13号', value: 13 },
        { date: '14号', value: 14 },
        { date: '15号', value: 15 },
        { date: '16号', value: 16 },
        { date: '17号', value: 17 },
        { date: '18号', value: 18 },
        { date: '19号', value: 19 },
        { date: '20号', value: 20 },
        { date: '21号', value: 21 },
        { date: '22号', value: 22 },
        { date: '23号', value: 23 },
        { date: '24号', value: 24 },
        { date: '25号', value: 25 },
        { date: '26号', value: 26 },
        { date: '27号', value: 27 },
        { date: '28号', value: 28 },
        { date: '29号', value: 29 },
        { date: '30号', value: 30 },
        { date: '31号', value: 31 }
      ],
      rules: {
        name: [{ required: true, trigger: 'change', message: this.$t('labels.input') }],
        model: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        pipeline: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        periodic_type: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        run_at: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        day_of_week: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        day_of_month: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        started_at: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }],
        time_field: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }]
      },
      workPeriod: {
        day: this.$t('strings.flowAbout.everyday'),
        week: this.$t('strings.flowAbout.everyweek'),
        month: this.$t('strings.flowAbout.everymonth'),
        year: this.$t('strings.flowAbout.everyquarter')
      },
      periodFlowLength: 0,
      schema_Data: [],
      lineOne: this.$t('strings.dataAbout.capture_lineone'),
      lineTwo: this.$t('strings.dataAbout.capture_linetwo'),
      modelRule: '',
      currentModelValue: {}
    }
  },
  watch: {
    count() {
      this.getCurrentDataFlow(this.addId)
      this.getSchemaData()
    },
    currentModelValue(newer, old) {
      // 当下拉选择模型时
      if (newer.type === 'model') {
        this.periodForm.type = 'model'
        this.periodForm.model = newer.id
      } else {
        this.periodForm.type = 'pipeline'
        this.periodForm.pipeline = newer.id
      }
    }
  },
  created() {
    this.getCurrentDataFlow(this.addId)
    this.getSchemaData()
  },
  methods: {
    closeDialog() {
      this.$emit('dialogOperation', false)
    },
    // 保存返回的添加周期流
    addPeriodFlowData() {
      this.$refs['periodPutForm'].validate(valid => {
        if (!valid) return
        this.$emit('loading', true)
        const addForm = JSON.parse(JSON.stringify(this.periodForm))
        addForm.started_at = `${this.handleTimeStyle(addForm.started_at).slice(0, 10)} 00:00`
        addForm.run_at = this.handleTimeStyle(addForm.run_at).slice(10)
        if (!addForm.is_total) {
          addForm.day_of_week = [addForm.day_of_week]
          addForm.day_of_month = [addForm.day_of_month]
        }
        addForm.day_of_week = addForm.day_of_week ? addForm.day_of_week.join(',') : addForm.day_of_week
        addForm.day_of_month = addForm.day_of_month ? addForm.day_of_month.join(',') : addForm.day_of_month
        addPeriodFlow(this.addId, addForm).then(res => {
          this.$emit('fresh')
          this.$refs['periodPutForm'].resetFields()
          this.currentModelValue = {}
          this.$emit('dialogOperation', false)
          this.$emit('changeState', true)
        }).catch((e) => {
          this.$message.error(e.message)
          this.$emit('loading', false)
        })
      })
    },
    // 保存继续的添加周期流
    keepAddPeriodFlowData() {
      this.$refs['periodPutForm'].validate(valid => {
        if (!valid) return
        this.$emit('loading', true)
        const addForm = JSON.parse(JSON.stringify(this.periodForm))
        addForm.started_at = `${this.handleTimeStyle(addForm.started_at).slice(0, 10)} 00:00`
        addForm.run_at = this.handleTimeStyle(addForm.run_at).slice(11)
        if (!addForm.is_total) {
          addForm.day_of_week = [addForm.day_of_week]
          addForm.day_of_month = [addForm.day_of_month]
        }
        addForm.day_of_week = addForm.day_of_week ? addForm.day_of_week.join(',') : addForm.day_of_week
        addForm.day_of_month = addForm.day_of_month ? addForm.day_of_month.join(',') : addForm.day_of_month
        addPeriodFlow(this.addId, addForm).then(res => {
          this.$emit('loading', false)
          this.$refs['periodPutForm'].resetFields()
          this.currentModelValue = {}
          this.$emit('changeState', true)
          this.getCurrentDataFlow()
        }).catch((e) => {
          // this.$message.error(this.$t('strings.dataAbout.same_periodflow_error'))
          this.$message.error(e.message)
          this.$emit('loading', false)
        })
      })
    },
    // 处理时间
    handleTimeStyle(val) {
      const tempTime = new Date(val)
      const year = tempTime.getFullYear()
      const month = tempTime.getMonth()
      const day = tempTime.getDate()
      const hour = tempTime.getHours()
      const minutes = tempTime.getMinutes()
      const monthStr = (month + 1) > 10 ? `${month + 1} ` : `0${month + 1}`
      const dayStr = day >= 10 ? `${day} ` : `0${day}`
      const hourStr = hour >= 10 ? `${hour}` : `0${hour}`
      const minutesStr = minutes >= 10 ? `${minutes}` : `0${minutes}`
      return `${year}-${monthStr}-${dayStr}${hourStr}:${minutesStr}`
    },
    // 获取当前周期数据存在的周期流
    getCurrentDataFlow() {
      this.$emit('loading', true)
      getPeriodDataFlow(this.addId).then(res => {
        this.existFlowData = res.data.results
        this.periodFlowLength = this.existFlowData.length
        this.$emit('periodLengthChange', this.existFlowData.length)
        this.$emit('loading', false)
      })
    },
    // 删除一个实时流
    deletePeriodFlowData(row, index) {
      // 为了操作svg图
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'none'
      hoverEl.style.display = 'none'
      clickEl.style.display = 'inline-block'
      deletePeriodFlow(row.datasource.id, row.id).then(res => {
        this.getCurrentDataFlow()
      })
    },
    // 获取schema作为时间字段
    getSchemaData() {
      getOneSchema(this.currentPeriod, 'is_time=true').then(res => {
        this.schema_Data = res.data.schema
      })
    },
    // 左侧删除按钮得操作
    showSvg(index) {
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'none'
      hoverEl.style.display = 'inline-block'
      clickEl.style.display = 'none'
    },
    hideSvg(index) {
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'inline-block'
      hoverEl.style.display = 'none'
      clickEl.style.display = 'none'
    },
    // 执行周期切换的时候的操作
    handleChange(val) {
      if (val === 'month') {
        this.periodForm.day_of_week = ''
      } else if (val === 'week') {
        this.periodForm.day_of_month = ''
      } else {
        this.periodForm.day_of_week = ''
        this.periodForm.day_of_month = ''
      }
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.main_containers {
  padding: 0!important;
  overflow: hidden;
  .el-exist {
    float: left;
    padding: 10px 16px 20px 0;
    min-width: 300px;
    border-right: 2px solid #ccc;
    h3 {
      padding-left: 8px;
      margin-bottom: 0;
      padding-bottom: 12px;
    }
    .el-periodFlow {
      height: 469px;
      overflow: auto;
      .el-table {
        // body部分
        /deep/ .el-table__body-wrapper  {
          .el-table__body {
            .el-table__row {
              td {
                .cell {
                  .delete_btn {
                    display: inline-block;
                    margin-top: 5px;
                    text-align: center;
                    cursor: pointer;
                    .hoverS {
                      display: none;
                    }
                    .clickS {
                      display: none;
                    }
                  }
                  .realproject {
                    color: #0f32b5;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .el-addFlow {
    float: left;
    padding: 10px 0 20px 16px;
    width: 520px;
    h3 {
      padding-left: 16px;
      margin-bottom: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #e6e6e6;
    }
    .form_container {
      padding-top: 24px;
      .select_width {
        width: 90px!important;
      }
      .dialog-footer {
        float: right;
        padding-right: 30px;
        .el-cancel {
          color: #4d4d4d;
          font-size: 15px;
          // font-family: sy_regular;
          background-color: #e6e6e6;
          &:hover {
            background-color: #efefef;
          }
          &:active {
            background-color: #ccc;
          }
        }
        .el-submit {
          margin-left: 10px;
          color: #4d4d4d;
          font-size: 15px;
          // font-family: sy_regular;
          background-color: #e6e6e6;
          border: 1px solid #e6e6e6;
          &:hover {
            color: #6484d4;
            background-color: #f3f6fc;
            border: 1px solid #6484d4;
          }
          &:active {
            color: #0f32b5;
            background-color: #f3f6fc;
            border: 1px solid #6484d4;
          }
        }
        .el-keepSubmit {
          font-size: 15px;
        }
      }
      /deep/ .el-form {
        .action_period,.week_day_of_week {
          .el-form-item__content {
            .el-select {
              .el-input {
                .el-input__inner {
                  width: 140px;
                }
                .el-input__suffix {
                  .el-input__suffix-inner {
                    .el-select__caret {
                      &::before {
                        position: relative;
                        top: -10px;
                        content: '';
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-bottom: 6px solid #4d4d4d;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        .action_period,.week_day_of_week {
          .el-form-item__content {
            .el-select {
              .el-input {
                .el-input__inner {
                  width: 90px;
                }
              }
            }
          }
        }
        .week_day_of_week {
          width: 248px;
          .el-form-item__content {
            .el-select {
              .el-select__tags {
                width: 150px!important;
                max-width: 150px!important;
              }
              .el-input {
                .el-input__inner {
                  width: 150px;
                }
                .el-input__suffix {
                  right: -55px;
                }
              }
            }
          }
        }
        .week_run_at {
          .el-form-item__content {
            margin-left: 10px!important;
            .el-date-editor {
              .el-input__inner {
                width: 120px;
              }
              .el-input__suffix {
                right: 100px;
              }
            }
          }
        }
        .el-form-item {
          /deep/ .el-form-item__content {
            .question {
              width: 32px;
              height: 32px;
              vertical-align: top;
              padding-top: 4px;
            }
            .el-select {
              .el-input {
                .el-input__suffix {
                  .el-input__suffix-inner {
                    .el-select__caret {
                      &::before {
                        position: relative;
                        top: -10px;
                        content: '';
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-bottom: 6px solid #4d4d4d;
                      }
                    }
                  }
                }
              }
            }
            .new-input {
              .el-input__inner {
                width: 256px;
              }
            }
            .el-date-editor {
              .el-input__inner {
                border-radius: 10px!important;
                width: 120px;
              }
              .el-input__suffix {
                right: 100px;
              }
            }
          }
        }
        .start_period_time {
          .el-form-item__content {
            .el-date-editor {
              .el-input__inner {
                width: 155px;
              }
              .el-input__suffix {
                right: 65px;
              }
            }
          }
        }
      }
    }
  }
}
.periodFlow {
  // padding: 0!important;
  .addFlow {
    width: 100%;
  }
}
</style>
