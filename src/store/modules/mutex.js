// 全局互斥体，使用在全局notification、互斥操作。
// 场景：数据实验正在保存数据，给出全局提示框，且不可以运行、探查、保存，当前实验涉及到运行算法的地方都不可以操作
const mutex = {
  namespaced: true,
  state: {
    maps: { // mutex map
      experiment: { saveData: '实验数据保存', runnode: '实验节点运行', saveExploreData: '探查数据保存' },
      realtimeflow: {},
      periodflow: {}
    },
    running: [{
      type: 'example', // experiment
      operate: 'someAction',
      starttime: ''
    }]
  },
  getters: {
    // 获取正在执行的操作
    runningInfo: (state) => (type) => {
      if (state.running.length === 0) { return null }
      return state.running.find(c => c.type === type)
    },
    // 获取操作的互斥操作
    runningMutualOperation: (state, getters) => (type, operate) => {
      const ri = getters.getRunningInfo(type)
      if (!ri) { return null }
      const mutuals = state.maps[ri.type]
      if (!mutuals || mutuals.keys.length === 0) { return null }
      if (mutuals.keys.indexOf(operate) === -1) { return null }
      return ri
    },
    // 获取运行中提示消息
    runningMessage: (state) => (ri) => {
      if (!ri) return ''
      const mutuals = state.maps[ri.type]
      if (!mutuals || !mutuals[ri.operate]) { return '' }
      return mutuals[ri.operate]
    }
  },
  mutations: {
    ADD(state, runInfo) {
      if (state.running.length > 0 && state.running.find(c => c.type === runInfo.type)) {
        return false
      }
      runInfo.starttime = new Date().getTime()
      state.running.push(runInfo)
    },
    UPDATE(state, prop) {
      // prop:{type:'', others} 必须要有type作为key查找runInfo
      if (!prop.type) return false
      const toUpdateIndex = state.running.findIndex(c => c.type === prop.type)
      if (toUpdateIndex >= 0) {
        state.running.splice(toUpdateIndex, 1, { ...state.running[toUpdateIndex], ...prop })
      }
    },
    REMOVE(state, prop) {
      let toRemoveIndex = -1
      let key = ''
      if (typeof prop === 'object') {
        if (!prop.type) throw new Error('runInfo must has property [type]')
        key = prop.type
      } else if (typeof prop === 'string') {
        key = prop
      }
      toRemoveIndex = state.running.findIndex(c => c.type === key)
      if (toRemoveIndex >= 0) {
        state.running.splice(toRemoveIndex, 1)
      }
    },
    CLEAR(state) {
      state.running = []
    }
  },
  actions: {
    add({ commit }, runInfo) {
      commit('ADD', runInfo)
    },
    update({ commit }, prop) {
      commit('UPDATE', prop)
    },
    remove({ commit }, prop) {
      commit('REMOVE', prop)
    },
    clear({ commit }) {
      commit('CLEAR')
    }
  }
}
export default mutex
