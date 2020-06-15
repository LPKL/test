<template>
  <el-select
    v-model="selectValue"
    :popper-class="showFilters?'rich-el-options rich-options-filters':'rich-el-options'"
    :placeholder="innerPlaceholder"
    :filterable="filterable"
    :clearable="clearable"
    class="new-input"
    value-key="__combind_key__"
    @change="doSelect"
  >
    <div v-if="showFilters" class="rich-options-header">
      <el-checkbox-group v-model="checkList" @change="doFilter">
        <el-checkbox v-for="ck in filterBy.value" :key="ck.value" :label="ck.value">
          {{ ck.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <el-option
      v-for="op in filteredOptions"
      :key="_optionKey(op)"
      :label="op[optionKey.label]"
      :value="_optionValue(op)"
      :disabled="op.disabled"
    >
      <span class="option-label">{{ op[optionKey.label] }}</span>
      <span v-if="filterBy.key" class="option-label-type" style="float: right;">{{ _groupName(op[filterBy.key]) }}</span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'SelectRich',
  props: {
    optionKey: {
      type: Object,
      default: () => { return { value: 'value', label: 'label' } }
    },
    combindValue: {
      type: Array,
      default: () => { return [] } // 组合键 ['id','type']
    },
    value: {
      type: [Object, String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => { return [] }
    },
    filterable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    // key : 过滤分组依据字段名，value：过滤分组[{label:value:},{label:value:}]: single：是否单选(TODO)
    filterBy: {
      type: Object,
      default: () => { return { key: 'group', value: [], single: false } }
    },
    placeholder: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      filteredOptions: [], // 过滤选项
      rawOptions: [], // 初始选项
      checkList: [], // 过滤项
      innerPlaceholder: '',
      innerEmptyText: ''
    }
  },
  computed: {
    selectValue: {
      get() {
        return typeof this.value === 'object' ? { ...this.value } : this.value
      },
      set(val) {
        this.$emit('input', typeof val === 'object' ? { ...val } : val)
      }
    },
    showFilters() {
      return this.filterBy.value && this.filterBy.value.length > 0
    }
  },
  watch: {
    '$props.options': {
      handler: function(newer, older) {
        this.init(newer)
      },
      deep: true
    }
  },
  mounted() {
    this.innerPlaceholder = this.placeholder ? this.placeholder : this.$t('strings.select')
    this.innerEmptyText = this.emptyText ? this.emptyText : this.$t('labels.not_available')
    this.init(this.options)
  },
  methods: {
    init(options) {
      this.rawOptions = [...options]
      this.filteredOptions = [...options]
      this.checkList = this.filterBy.value.map(c => c.value)
      this.resetOptions()
    },
    doSelect() {
      // this.$emit('change', this.selectValue)
      // 清除未选复选框对应的类别项
      this.resetOptions()
    },
    doFilter() {
      if (this.checkList.length === 0) {
        if (this.selectValue) {
          // 如果有选项值
          const selectedItem = this.rawOptions.find(c => this.isOpitonEqual(c))
          if (selectedItem) {
            this.filteredOptions = [{ ...selectedItem }]
            return
          }
        }
      }
      this.resetOptions()
      if (this.filteredOptions.length === 0) {
        // 增加一个占位提示项(否则将应用empty Slot，导致filter复选组消失)
        const emptyInfo = {}
        emptyInfo[this.optionKey.label] = this.innerEmptyText
        emptyInfo[this.optionKey.value] = '-1'
        emptyInfo.disabled = true
        this.filteredOptions = [emptyInfo]
      }
    },
    resetOptions() {
      if (!this.showFilters) return
      this.filteredOptions = this.rawOptions.filter(f => {
        return this.checkList.indexOf(f[this.filterBy.key]) >= 0 || this.isOpitonEqual(f)
      })
    },
    isOpitonEqual(option) {
      if (this.combindValue.length > 0 && typeof this.selectValue === 'object') {
        return (!this.combindValue.some(k => option[k] !== this.selectValue[k]))
      } else {
        return option[this.optionKey.value] === this.selectValue
      }
    },
    _groupName(groupValue) {
      if (this.filterBy.value.length === 0) return groupValue
      const mappedItem = this.filterBy.value.find(c => c.value === groupValue)
      if (mappedItem) {
        return mappedItem.label
      }
      return groupValue
    },
    _optionValue(option) {
      if (this.combindValue.length > 0) {
        // return this.combindValue.reduce((v, k) => {
        //   v[k] = option[k]
        //   return v
        // }, {})
        return { ...option, __combind_key__: this._optionKey(option) }
      } else {
        return option[this.optionKey.value]
      }
    },
    _optionKey(option) {
      if (this.combindValue.length > 0) {
        return this.combindValue.reduce((v, k) => {
          return v === '' ? option[k] : `${v}_${option[k]}`
        }, '')
      } else {
        return option[this.optionKey.value]
      }
    }
  }
}
</script>
