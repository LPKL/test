const mflow = {
  state: {
    isw: true,
    curJzId: null, // 当前选定的jz或file id
    curJzId2: null, // 实时流程当前选定jz
    curProId: null, // 数据流程当前项目
    curProId2: null, // 实时流程当前项目
    opreates: null,
    dflowMsg: [], // 数据流程每次运行返回数据数组
    upWhich: null,
    curNodeDataItemEnum: [], // 数据源中选中数据节点的枚举值
    piplineDraw: null // 发布pipline时保存的画版结构
  },
  mutations: {
    SET_ISW: (state, isw) => {
      state.isw = isw
    },
    SET_OPREATES: (state, opreates) => {
      state.opreates = opreates
    },
    SET_CURJZID: (state, id) => {
      state.curJzId = id
    },
    SET_CURJZID2: (state, id) => {
      state.curJzId2 = id
    },
    SET_CURPROID: (state, id) => {
      state.curProId = id
    },
    SET_CURPROID2: (state, id) => {
      state.curProId2 = id
    },
    SET_DFLOWMSG: (state, dflowMsg) => {
      state.dflowMsg = dflowMsg
    },
    SET_UPWHICH: (state, upWhich) => {
      state.upWhich = upWhich
    },
    SET_CURNODEDATAITEMENUM: (state, curNodeDataItemEnum) => {
      state.curNodeDataItemEnum = curNodeDataItemEnum
    },
    CLEAN: (state) => {
      state.isw = true
      state.curJzId = null
      state.curJzId2 = null
      state.curProId = null
      state.curProId2 = null
      state.opreates = null
      state.dflowMsg = []
      state.upWhich = null
      state.curNodeDataItemEnum = []
    },
    SET_PIPLINEDRAW: (state, opreates) => {
      state.piplineDraw = opreates
    }
  },
  actions: {
    setOpreates({ commit }, opreates) {
      commit('SET_OPREATES', opreates)
    },
    setIsw({ commit }, isw) {
      commit('SET_ISW', isw)
    },
    setJzid({ commit }, id) {
      commit('SET_CURJZID', id)
    },
    setJzid2({ commit }, id) {
      commit('SET_CURJZID2', id)
    },
    setProid({ commit }, id) {
      commit('SET_CURPROID', id)
    },
    setProid2({ commit }, id) {
      commit('SET_CURPROID2', id)
    },
    setDflowMsg({ commit }, msg) {
      commit('SET_DFLOWMSG', msg)
    },
    setUpWhich({ commit }, msg) {
      commit('SET_UPWHICH', msg)
    },
    setCurNodeDataItemEnum({ commit }, list) {
      commit('SET_CURNODEDATAITEMENUM', list)
    },
    clean({ commit }) {
      commit('CLEAN')
    }
  }
}

export default mflow
