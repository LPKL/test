<!--
 * @author cuichuanwa
 * @date 19-11-12 上午9:46
 * @description ParamGroups ParamCascade ParamItem组件公共部分
 -->
<script>
  import _ from 'lodash'
  import {
    getTreeNodeIdParams,
  } from '@/api/experiment'
  export default {
    name: 'CommonParam',
    data(){
      return{
        paramForm: { args: [] },
        radio: { index: 2, value: "行合并" },//单选
        radio_item: null,
        dialogTran: false,// 字段选择
        dialogCondition: false,// 筛选条件
        dialogThreshold: false, //编辑阈值
        dialogOutSet: false, //字段信息
        nodestr: null, // 上一接点数据
        transferData: [{key:null,label:null}],
        tdata: [],
        tdataIndex: [],
        tcNumber: null,//填充值
        columnsIndex: null,
        dialogloading: false,
        conditionSels: [{"relation":'',"field":'',"operation":'',"value":''}],
        conditionThreshold: [{"col":'',"g":'',"h":'',"c":''}],
        conditionOutset: [{"field":'',"decimal":'',"unit":''}],
        condition: {//过滤条件
          "大于":">",
          "小于":"<",
          "等于":"==",
          "大于等于":">=",
          "小于等于":"<=",
          "不等于":"!=",
          "包含":"like",
          "不包含":"not like",
          "正则匹配":"rlike"
          // "模糊匹配":"likein"
        },
        dialogAreaRule: false,
        AreaRuleValue: '',
        addAreaRule: () => {},
      }
    },
    watch:{
      'data':{
        handler:function(newer,older){
          this.paramForm = this.$props.data
        },
        deep: true
      },
      'tcNumber':{
        handler: function(newer, older) {
          if(typeof newer === 'number'){
            this.paramForm.args[this.radio_item].arg_value = 'add_'+newer
          }
        },
        deep: true
      }
    },
    methods: {
      /**
       * 单引号替换成双引号
       * todo 在实时页面和数据探查不需要传入index参数
       */
      strToArr(str, index) {
        try {
          if (_.isEmpty(str)) {
            //在实时页面和数据探查provData传入的是单个数据集 所以不需要传入index参数 直接返回provData
            if(index || index === 0 || index === '0'){
              return this.getProvColumns(index)
            }else{
              return this.$props.data.provData
            }
          } else if (typeof str === "string") {
            return JSON.parse(str.replace(/\'/g, '"'))
          } else {
            return str
          }
        } catch (e) {
          console.log(e)
          this.$message.error(this.$t('messages.flow.options_error1'))
        }
      },
      // radioClick(item){
      //   if(item !== this.checkbox.index){
      //     let temp = this.checkbox.value.slice(-1)
      //     this.checkbox.value = temp
      //     this.checkbox.index = item
      //   }
      //   this.paramForm.args[item].arg_value = this.checkbox.value
      // },
      /**
       * 单选 点击操作
       * @param item
       */
      radio2Click(item) {
        this.radio.index = item
        const value = this.radio.value
        if(value === 'add_number'){
          this.$refs.tcNum[0].$el.style.display ='inline-block'
        }else{
          this.tcNumber = null
          this.$refs.tcNum ? this.$refs.tcNum[0].$el.style.display ='none':''
        }
        this.radio_item = item
        this.paramForm.args[item].arg_value = this.radio.value
      },

      /**
       * 设置穿梭框中选项
       * @param index
       * @returns {boolean}
       */
      handleOpen(index){
        this.columnsIndex = index
        const arg = this.paramForm['args'][this.columnsIndex], { arg_value, arg_range } = arg
        if(arg_range && arg_range!=='[]'){
          this.nodestr = eval(arg_range)
        }else{
          const provids = this.$props.data.provids
          const temp = this.getProvColumns(index)
          if(!_.isArray(temp)){
            this.$message.error(this.$t('messages.flow.options_error2'))
            return false
          }
          let provData = null
          !temp && this.$message.warning(this.$t('messages.flow.options_error3'))
          if(_.isArray(temp[0])){ //判断是否是二维数组
            // provData  = temp[arg['arg_index'].slice(-1)-1]
            provData  = temp[0]
          }else{
            provData = temp
          }
          if(provids.length < 1){
            this.$message(this.$t('messages.flow.options_error4'))
            return false
          }
          this.nodestr = provData
          if(!this.nodestr){
            this.dialogTran = false
            this.$message(this.$t('messages.flow.options_error5'))
            return false
          }
        }

        this.dialogTran = true
        this.tdata = arg_value ? arg_value.filter(item => this.nodestr.indexOf(item) > -1) : []
        this.transferData = this.nodestr
      },
      handleClose(){
        this.dialogTran = false
      },
      dialogYesVisible(){
        this.paramForm.args[this.columnsIndex].arg_value = this.tdata
        // console.log(this.tdata, this.$props.data.provType, this.tdataIndex)
        if(!this.$attrs.ispipeline){
          this.paramForm.args[this.columnsIndex]['select_count'] = this.tdata.length // 记录选择个数 只在columns组件中记录
          this.paramForm.args[this.columnsIndex]['select_type'] = this.tdataIndex // 记录选择类型 只在columns组件中记录
          // todo 将来还要增加其选择的类型 在pipeline编辑保存时验证使用
        }
        this.tdataIndex = null
        this.dialogTran = false
      },
      // 打开条件筛选框
      async openCondition(index, m='conditionSels', dialog, q){
        this[dialog] = true
        if(q){
          const { query } = this.$props.data
          const dx = this.paramForm.args[index].arg_index
          this.dialogloading = true
          try {
            switch (dialog) {
              case 'dialogOutSet':
                const { data: { datas: { output_columns } }} = await getTreeNodeIdParams(...query)
                const { newcols, newcolstype } = output_columns[dx ? dx : 0]
                console.log(newcols, newcolstype, 'newcols:', this.getFilterNewcols(newcols, newcolstype))
                this.nodestr = this.getFilterNewcols(newcols, newcolstype)
                this.dialogloading = false
                break;
              default:
                this.nodestr = []
                this.dialogloading = false
                break;
            }
          } catch (e) {
            console.log(e)
            this.dialogloading = false
            this.nodestr = []
          }
        } else {
          this.nodestr = this.getProvColumns(index)
        }
        this.columnsIndex = index
        const temp = this.paramForm.args[index].arg_value
        if(temp instanceof Array && temp.length > 0){
          this[m] = temp
        } else {
          const { column_props: { keys }} = this.$refs, tp = {}
          for (let i = 0, len = keys.length; i < len; i++) {
            tp[keys[i]] = ''
          }
          this[m] = [tp]
        }
      },

      // // 打开编辑阈值
      // openThreshold(index){
      //   this.dialogThreshold = true
      //   this.nodestr = this.getProvColumns(index)
      //   this.columnsIndex = index
      //   const temp = this.paramForm.args[index].arg_value
      //   if(temp instanceof Array && temp.length > 0){
      //     this.conditionThreshold = temp
      //   }
      // },
      // 获取接点数据
      getNodeData(){
        return provData
      },
      // 确认设置筛选到总参数
      dialogConditionYes(val){
        this.paramForm.args[this.columnsIndex].arg_value = val
      },
      // input 输入框输入限制
      inputChange(item, index){
        const tp = item.arg_range
        //过滤空值
        if(!tp || !item.arg_value){
          return false
        }
        const temp = tp==='number' ? parseFloat(item.arg_value) : item.arg_value
        if(this.toType(temp) !== tp || _.isNaN(temp)){
          this.$message.error(this.$t('messages.flow.options_error6'))
          this.paramForm.args[index].arg_value = ''
        }
        // todo 将来可以使用此方法字符串转成number
        // item.arg_value = stringParseNumber(item.arg_value)
      },
      // 判断数据类型
      toType(obj) {
        return toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
      },
      //多输入框删除
      delInputlist(index,m){
        // const len = this.paramForm.args[index].arg_value.length
        // len > 1 && this.paramForm.args[index].arg_value.splice(m, 1);
        this.paramForm.args[index].arg_value.splice(m, 1);
      },
      //多输入框添加
      addInputlist(index,m){
        const val = _.isEmpty(this.paramForm.args[index].arg_value)
        if(val){
          this.paramForm.args[index].arg_value=[""]
        }else{
          this.paramForm.args[index].arg_value.splice(m+1, 0, "")
        };
      },
      /*** 让参数中的某些项不显示 或者显示
       * arr从0开始
       * isShow　是否显示参数
       * 当切换算法节点时需要重置所有参数设置
       * 0代表显示 因为默认是不设置arg_noshow 所以arg_noshow=undefined都是显示的
       * 1代表不显示
       */
      hiddenParam(arr,　isShow){
        arr.some(item=>{
          if(isShow){
            this.paramForm.args[item]['arg_noshow'] = 1
          }else{
            this.paramForm.args[item]['arg_noshow'] = 0
          }
        })
      },
      // list 参数改变
      listChange(item){
        const { arg_value, arg_index, arg_relation } = item
        if(!this.$attrs.ispipeline) {
          const type = this.$props.data.provData[arg_index?arg_index:0]
          console.log(type, arg_value)
          item.select_type = type.indexOf(arg_value)
        }
        if(arg_relation){
          const temp = this.strToArr(arg_relation)
          const arr = temp[arg_value]
          if(arr.noshow){
            this.hiddenParam(arr.noshow, 1)
          }
          if(arr.show){
            this.hiddenParam(arr.show, 0)
          }
          if(!_.isEmpty(arr.value)){
            Object.keys(arr.value).some((m)=>{
              this.paramForm.args[m].arg_value = arr.value[m]
            })
          }
        }
      },
      /**
       * provData在数据实验中传入的是多个数据集 获取上流节点的返回的数据集字段　默认选取第一个数据字段
       * @param index
       * @returns {*}
       */
      getProvColumns(index){
        const dx = this.paramForm.args[index].arg_index
        if(dx){
          return this.$props.data.provData[dx]
        }else{
          return this.$props.data.provData[0]
        }
      },
      transferCallback(value){
        this.tdata = value
        let temp = []
        for (let i = 0, len = value.length; i < len; i++) {
          const item = value[i]
          temp.push(this.nodestr.indexOf(item))
        }
        this.tdataIndex = temp
      },
      // textarea输入组件弹窗
      handleAreaOpen(index){
        this.dialogAreaRule = true
        const value = this.paramForm.args[index].arg_value
        if(typeof value === 'string'){
          this.AreaRuleValue = [value]
        } else {
          this.AreaRuleValue = value
        }

        const _this = this
        this.addAreaRule = _.debounce(function(a){
          _this.paramForm.args[index].arg_value = a
        }, 1000)
      },
      // copy操作
      doCopy(e) {
        let selectEl = e.target.parentElement.previousElementSibling.innerHTML
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.setAttribute('value', selectEl);
        input.select();
        if (document.execCommand('copy')) {
          document.execCommand('copy');
          this.$message.info('copy success')
        }
        document.body.removeChild(input);
      },
      // handleMappingOpen输入组件弹窗
      handleMappingOpen(index, open){
        this[open] = true
        const value = this.paramForm.args[index].arg_value
        if(value && typeof value !== 'string'){
          this.mappingRuledata = value
        }
        const _this = this
        this.addAreaRule = _.debounce(function(a){
          _this.paramForm.args[index].arg_value = a
        }, 1000)
      },
      filterAction(){
        const args = this.paramForm.args
        if(!args) return
        // 单独处理lists 多选框选择问题
        args.map((item,key)=>{
          this.listChange(item)
          if(item.arg_type == 'lists'){
            if (!item.arg_value) {
              this.paramForm.args[key].arg_value = []
            } else {
              this.paramForm.args[key].arg_value = this.strToArr(item.arg_value)
            }
          }
        })
      },
      getFilterNewcols(newcols, newcolstype){
        const NUMBERTYPE = ['double', 'float', 'Array', 'vector', 'array', 'Vector']
        let nc = []
        try {
          for (let i = 0, len = newcolstype.length; i < len; i++) {
            const item = newcolstype[i]
            if(NUMBERTYPE.indexOf(item) > -1){
              nc.push(newcols[i])
            }
          }
          return nc
        }catch (e) {
          console.log(e)
          return []
        }
      }
    }
  }
</script>

<style scoped>

</style>
