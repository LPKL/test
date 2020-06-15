const etl = {
  state: {
    planid: '1'
  },
  mutations: {
    SET_PLANID: (state, id) => {
      state.planid = id
    }
  },
  actions: {
    setPlanid({ commit }, planid) {
      commit('SET_PLANID', planid)
    }
  }
}

export default etl
