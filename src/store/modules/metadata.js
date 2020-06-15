const metadata = {
  state: {
    metadataId: '',
    currentMetadata: {}
  },
  mutations: {
    CHANGE_ID(state, id) {
      state.metadataId = id
    },
    CHANGE_METADATA(state, data) {
      state.currentMetadata = data
    }
  },
  actions: {
    RECORD_CURRENT_ID({ commit }, id) {
      commit('CHANGE_ID', id)
    },
    RECORD_CURRENT_METADATA({ commit }, data) {
      commit('CHANGE_METADATA', data)
    }
  }
}
export default metadata
