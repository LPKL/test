<!-- 数据实验显示数据集节点信息 -->
<template>
  <el-form>
    <el-table
      :data="tabledata"
      @row-click="clickTableRow"
      ref="refDataTable"
      center = "all"
      class="scoped_expand_class"
      :cell-style="{'font-size':'12px','padding':'0px 4px 4px','position': 'relative'}"
      :header-cell-style="{'font-size':'12px','padding':'2px 0','position': 'relative'}" >
      <el-table-column :label= "$t('strings.flow.field')" prop="name" show-overflow-tooltip>
      	<template slot-scope="scope">
          {{ scope.row.zname?scope.row.zname:scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column width="40">
        <template slot-scope="scope">
          <svg-icon style="vertical-align:top;" v-if="scope.row.type!='num' && scope.row.value && scope.row.value.length!=0" icon-class="bookmark" />
          <svg-icon style="vertical-align:top;" v-if="scope.row.type=='num' && (scope.row.value[0]!='' || scope.row.value[1]!='')" icon-class="bookmark" />
        </template>
      </el-table-column>
      <el-table-column type="expand" width="1">
        <template slot-scope="scope">
          <el-form-item :prop="'tabledata.' + scope.$index + '.name'" class="scoped_class">
            <el-select v-model="scope.row.type" :placeholder="$t('strings.select_type')" @change="selectInputType($event, scope.$index)" size="mini" class="expand_select">
              <el-option v-for="item in dataTypes" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
            <el-input v-if="scope.row.type == 'string'" v-model="scope.row.value" prefix-icon="el-icon-search" size="mini" :maxlength="30" :placeholder="$t('strings.fuzzy_search')">
              <!-- <el-select v-model="input_type" slot="prepend" placeholder="a">
                <el-option label="模糊" value="1"/>
                <el-option label="精确" value="2"/>
              </el-select> -->
            </el-input>
            <!-- <el-input-number v-if="scope.row.type == 'inputnum'" v-model="scope.row.value" :min="1" :max="10" size="mini" /> -->
            <div v-if="scope.row.type == 'num'">
              <el-input v-model="scope.row.value[0]" class="inputnum" size="mini" clearable/> -
              <el-input v-model="scope.row.value[1]" class="inputnum" size="mini" clearable/>
            </div>
            <el-date-picker v-if="scope.row.type == 'datetime'" v-model="scope.row.value" type="datetimerange" unlink-panels range-separator="-" :start-placeholder="$t('strings.start_time')" :end-placeholder="$t('strings.end_time')" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" size="mini" />
            <el-select v-if="scope.row.type == 'enum'" v-model="scope.row.value" multiple filterable remote reserve-keyword default-first-option allow-create :placeholder="$t('strings.custom')" :remote-method="remoteMethod" :loading="loading" size="mini" class="expand_select">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
      </template>
    </el-table-column>
  </el-table>
  <el-button type="primary" size="mini" @click="fetchData()" class="screening_button">{{ $t('buttons.screening') }}</el-button>
</el-form>
</template>
<script>
export default {
  props:{
    data: {
      type: Array,
      default:null
    },
    nodename: {
      type: String,
      default:''
    },
    sqlargs: {
      type: Array,
      default:null
    }
  },
  data () {
    return {
      loading: false,
      dataTypes: [
        { value: 'string', label: '输入' },
        { value: 'datetime', label: '时间' },
        { value: 'enum', label: '枚举' },
        { value: 'num', label: '数字范围' }
      ],
      options: [],
      list: [],
      tabledata: []
    }
  },
  watch:{
    listenDatasAndArgsChange: function(val){
      this.showDataTable()
    },
    listenstage: function(ov,nv){
      if(this.$store.getters.curNodeDataItemEnum){
        // this.options = []
        // this.$store.getters.curNodeDataItemEnum.map(item => {
        //   this.options.push({ value: item, label: item })
        // })
        this.list = this.$store.getters.curNodeDataItemEnum.map(item => {
          return { value: item.toString(), label: item.toString() };
        });
      }
    }
  },
  computed: {
    listenDatasAndArgsChange() {
      // 监听多个值
      const {data,sqlargs} = this
      return {data,sqlargs}
    },
    // 监听枚举列表变化，有变化说明已获取新的枚举列表
    listenstage() {
      return this.$store.getters.curNodeDataItemEnum
    }
  },
  created(){
    this.showDataTable()
  },
  methods: {
    showDataTable() {
      this.tabledata = []
      const data = this.data
      if(!data) return
      const sqlargs = this.sqlargs
      for (let ti = 0,len = data.length; ti < len; ti++) {
        let tabledataobject = {}
        let objecthasvalue = false
        const tidata = data[ti]
        const { name, zname, dtype } = tidata
        if (sqlargs && sqlargs.length != 0){
          for (let si = 0, sl = sqlargs.length; si < sl; si++) {
            const oSql = sqlargs[si]
            const oSname = oSql.name
            const { value, type } = oSql
            if (oSname == name) {
              let objectvalue = value
              if (type == 'enum') {
                objectvalue = value.split(',')
              }
              tabledataobject = { name: name, zname: zname, type: type, value: objectvalue }
              objecthasvalue = true
            }
          }
        }
        if (objecthasvalue == false) {
          if (dtype) {
            if (dtype === 'timestamp') {
              tabledataobject = { name: name, zname: zname, type: 'datetime', value: [] }
            }else if (dtype.indexOf("int") != -1 || dtype.indexOf("double") != -1) {
              tabledataobject = { name: name, zname: zname, type: 'num', value: ["",""] }
            } else {
              // TODO: 获取的dtype其他类型处理
              tabledataobject = { name: name, zname: zname, type: 'string', value: '' }
            }
          } else {
            tabledataobject = { name: name, zname: zname, type: 'string', value: '' }
          }
        }
        this.tabledata.push(tabledataobject)
      }
    },
    clickTableRow(row, index, e){
      this.$refs.refDataTable.toggleRowExpansion(row)
    },
    selectInputType (prov, index) {
      // 切换类型时，已填写的值内容清空
      const { type, name } = this.tabledata[index]
      if (type == 'num') {
        this.tabledata[index].value = ["",""]
      }else if(type == 'datetime'){
        this.tabledata[index].value = []
      }else if(type == 'enum'){
      	// 请求选中字段的枚举列表
        this.tabledata[index].value = []
        this.$emit("resetSqlArgs", { args: name , sqlstring: '' });
      }else {
        this.tabledata[index].value=""
      }
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.options = this.list.filter(item => {
            return item.label.toLowerCase()
              .indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        this.options = [];
      }
    },
    fetchData () {
      let mysql_object = [] // 对象形式存储筛选条件
      let mysql_string = 'select * from ' + this.nodename // table名称未知，标签名称未知，也需要一个在原始数据中增加字段
      let all_filter = [] // sql语句形式的筛选条件
      let sqlwhere = false

      const tabledata = this.tabledata
      for (let num = 0, len = tabledata.length; num < len; num++) {
        const  oTable = tabledata[num]
        const { value, name, zname, type } = oTable
        if (value && value.length != 0) {
          var each_select_ietm = ''
          var each_select_ietm_object = {}
          if (type == 'string') {
            each_select_ietm = zname + " like '%"  + value +"%'"
            each_select_ietm_object = {"name": name, "type":"string", "value": value}
          }else if (type == 'num' && (value[0]!="" || value[1]!="")) {
            each_select_ietm = zname + " between "  + value[0] + " and " + value[1]
            each_select_ietm_object = {"name":name, "type":"num", "value": [value[0], value[1]]}
          }else if (type == 'datetime') {
            each_select_ietm = zname + " between "  + value[0] + " and " + value[1]
            each_select_ietm_object = {"name":name, "type":"datetime", "value": [value[0], value[1]]}
          }else if (type == 'enum') {
            var all_selected = []
            for (let x = 0, length = value.length; x < length; x++) {
              all_selected.push(value[x])
            }
            each_select_ietm = zname + " in (" + all_selected.join(',') + ")"
            each_select_ietm_object = {"name": name, "type":"enum", "value": all_selected.join(',')}
          }
          if (JSON.stringify(each_select_ietm_object) !== "{}") {
            sqlwhere = true
            all_filter.push(each_select_ietm)
            mysql_object.push(each_select_ietm_object)
          }
        }
      }
      if (sqlwhere == false) {
        mysql_string = mysql_string
      }else {
        mysql_string = mysql_string + ' where ' + all_filter.join(' and ')
      }
      this.$emit("resetSqlArgs", { args: mysql_object, sqlstring: mysql_string });
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>


  .screening_button {
    margin-top: 10px;
    // float: right;
    width: 100%;
  }
  .scoped_expand_class {
    width: 100%;
    max-height: 400px;
    overflow: auto;
    .el-table__expanded-cell[class*=cell] {
      padding: 10px 10px;
    }
  }
  .scoped_class .inputnum {
    width: 46%;
  }
  .expand_select {
    width: 100%;
  }
  .scoped_class.el-select--mini .el-input__inner {
    width: 100%;
  }
  .scoped_class.el-input--mini .el-input__inner {
    width: 100%;
  }
  .scoped_class .el-range-editor--mini.el-input__inner {
    width: 100%;
  }
  .scoped_class.el-form-item {
    margin-bottom: 5px;
  }
</style>

