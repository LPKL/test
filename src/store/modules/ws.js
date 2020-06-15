const ws = {
  state: {
    dfws: '', // 数据流程页面websocket请求
    notifyws: '', // 消息接收websocket请求
    rfws: '', // 实时流程websocket请求
    rfwsdata: '', // 实时流程websocket 返回数据
    errorws: '' // 故障消息接收websocket请求
  },
  mutations: {
    SET_DFWS: (state, dfws) => {
      state.dfws = dfws
    },
    SET_NOTIFYWS: (state, notifyws) => {
      state.notifyws = notifyws
    },
    SET_ERRORWS: (state, errorws) => {
      state.errorws = errorws
    },
    SET_RFWS: (state, rfws) => {
      state.rfws = rfws
    },
    SET_RFWSDATA: (state, rfwsdata) => {
      state.rfwsdata = rfwsdata
    }
  },
  actions: {
    setDFws({ commit }, opreates) {
      commit('SET_DFWS', opreates)
    },
    setNOTIFYws({ commit }, opreates) {
      commit('SET_NOTIFYWS', opreates)
    },
    setERRORws({ commit }, opreates) {
      commit('SET_ERRORWS', opreates)
    },
    setRFws({ commit }, opreates) {
      commit('SET_RFWS', opreates)
    },
    setRfWsData({ commit }, opreates) {
      commit('SET_RFWSDATA', opreates)
    }
  }
}

export default ws
