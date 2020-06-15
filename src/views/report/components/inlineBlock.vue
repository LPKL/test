<template>
  <span>
    <template v-for="(item, item_key) in obj">
      <img v-if="item.type === 'IMG'" :key="item_key" :src="item.attributes.src" :width="item.attributes.width" :height="item.attributes.height" crossOrigin="anonymous">
      <component v-else :key="item_key" :is="item.type !== undefined ? item.type : 'span'" :style="getStyle(item)">{{ getValiable(item) }}
        <ShowInlineBlock v-if="item.children && item.type !== 'MARK' && item.type !== 'TIME' " :obj="item.children" :obj-style="item.style !== undefined ? item.style : objStyle"/>
      </component>
    </template>
  </span>
</template>
<script>
import { showEditorVariableValueByKey } from '@/views/report/components/editorCommonMethod.js'
import { showDateTimeByCustomFormat } from '@/utils/index'

export default {
  name: 'ShowInlineBlock',
  props: {
    obj: {
      type: Array,
      default: null
    },
    objStyle: {
      type: String,
      default: ''
    },
    faultConfigData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      obj_arr: []
    }
  },
  created() {
    // console.log('ShowInlineBlock', this.objStyle)
  },
  methods: {
    getType(obj) {
      // console.log('objobj', obj.type)
      return obj.type
    },
    getStyle(obj) {
      // 由于在html2Canvas插件中，对于css划线text-decoration需要作用在文本外层，若作用在多层外将导致导出后无效果，因此在此处进行处理。
      var blockStyle = []
      var blockStyleString = ''
      if (obj['text']) {
        if (this.objStyle) {
          for (var each_p_style of this.objStyle.split(',')) {
            if (each_p_style.indexOf('text-decoration') !== -1) {
              blockStyle.push(each_p_style)
            }
          }
        }
        if (obj.attributes && obj.attributes.hasOwnProperty('style')) {
          for (var each_style of obj.attributes.style.split(',')) {
            // if (each_style.indexOf('text-decoration') !== -1) {
            blockStyle.push(each_style)
            // }
          }
        }
        blockStyleString = blockStyle.join(',')
      } else {
        if (obj.attributes && obj.attributes.hasOwnProperty('style')) {
          blockStyleString = obj.attributes.style
        }
      }
      return blockStyleString
    },
    getValiable(obj) {
      var show_text = ''
      // debugger
      if (obj['type'] === 'TIME') {
        // console.log('time')
        const timeFormat = obj['attributes']['data-format']
        if (obj['attributes']['data-type'] === 'faultTime') {
          var faultTime = ''
          if (this.faultConfigData.hasOwnProperty('error_time')) {
            faultTime = this.faultConfigData['error_time']
          }
          if (faultTime !== '') {
            show_text = showDateTimeByCustomFormat(timeFormat, new Date(faultTime))
          } else {
            show_text = showDateTimeByCustomFormat(timeFormat)
          }
        } else if (obj['attributes']['data-type'] === 'currentTime') {
          show_text = showDateTimeByCustomFormat(obj['attributes']['data-format'])
        }
      } else if (obj['type'] === 'MARK') {
        // console.log('mark', obj)
        var mark_type = obj['attributes']['data-type']
        show_text = showEditorVariableValueByKey(mark_type, this.faultConfigData)
      } else {
        show_text = obj['text']
      }
      return show_text
    }
  }
}
</script>

<style scoped>

</style>
