<!-- 表格，需要显示tr，td等标签的style属性，合并单元格属性，表格内嵌表格，和其他组合富文本内容 -->
<template>
  <table :style="table_style" :border="table_border">
    <component v-for="(group, groupkey) in tgroupData" :key="groupkey" :is="group.type" :style="group.hasOwnProperty('attributes') ? group.attributes.style : ''">
      <div v-if="group.type==='CAPTION'">{{ group.text }}</div>
      <component v-for="(group_tr, group_trkey) in group.children" :key="group_trkey" :is="group_tr.type" :style="group_tr.hasOwnProperty('attributes') ? group_tr.attributes.style : ''">
        <component v-for="(group_tr_td, group_tr_tdgroup) in group_tr.children" :key="group_tr_tdgroup" :is="group_tr_td.type" :style="group_tr_td.hasOwnProperty('attributes') ? group_tr_td.attributes.style : ''" :colspan="group_tr_td.hasOwnProperty('attributes') && group_tr_td.attributes.hasOwnProperty('colspan') ? group_tr_td.attributes.colspan:'1'" :rowspan="group_tr_td.hasOwnProperty('attributes') && group_tr_td.attributes.hasOwnProperty('rowspan') ? group_tr_td.attributes.rowspan:'1'">
          <component v-for="(group_tr_td_item, group_tr_td_itemkey) in group_tr_td.children" :key="group_tr_td_itemkey" :is="group_tr_td_item.type" :style="group_tr_td.hasOwnProperty('attributes') ? group_tr_td.attributes.style : ''">
            <!-- 表格内嵌套表格情况 -->
            <ShowTable v-if="group_tr_td_item.type === 'TABLE'" :tgroup-data="group_tr_td_item.children" :table-attributes="group_tr_td_item.hasOwnProperty('attributes') ? group_tr_td_item.attributes : {}"/>
            <!-- 表格内容是多标签组合富文本 -->
            <comp-commonblock v-else :data-type="group_tr_td_item.type" :block-data="group_tr_td_item.children" :block-attributes="group_tr_td_item.hasOwnProperty('attributes') ? group_tr_td_item.attributes : {}" :fault-config-data="faultConfigData"/>{{ group_tr_td_item.text }}
          </component>
        </component>
      </component>
    </component>
  </table>
</template>
<script>
import $ from 'jquery'
import showCommonBlock from './showCommonBlock'

export default {
  name: 'ShowTable',
  components: {
    'comp-commonblock': showCommonBlock
  },
  props: {
    dataType: {
      type: String,
      default: null
    },
    tgroupData: {
      type: Array,
      default: null
    },
    tableAttributes: {
      type: Object,
      default: null
    },
    faultConfigData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      table_style: '',
      table_border: ''
    }
  },
  created() {
    // console.log('ShowTable', this.tgroupData, this.tableAttributes)
    this.getBlockStyle()
  },
  methods: {
    getBlockStyle() {
      if (!$.isEmptyObject(this.tableAttributes)) {
        if (this.tableAttributes.hasOwnProperty('style')) {
          this.table_style = this.tableAttributes['style']
        }
        if (this.tableAttributes.hasOwnProperty('border')) {
          this.table_border = this.tableAttributes['border']
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
