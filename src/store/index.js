import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import errorLog from './modules/errorLog'
import permission from './modules/permission'
import tagsView from './modules/tagsView'
import user from './modules/user'
import mflow from './modules/mflow'
import etl from './modules/etl'
import ws from './modules/ws'
import metadata from './modules/metadata'
import mutex from './modules/mutex'
import getters from './getters'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    app,
    errorLog,
    permission,
    tagsView,
    user,
    mflow,
    etl,
    ws,
    metadata,
    mutex
  },
  getters
})

export default store
