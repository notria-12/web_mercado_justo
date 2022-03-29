import Vue from 'vue'
import Axios from '@plugins/axios'
import Vuex from 'vuex'
import dispatchActionForAllModules from '@utils/dispatch-action-for-all-modules'
import modules from './modules'

Vue.use(Axios)
Vue.use(Vuex)

const store = new Vuex.Store({
    modules,
    strict: process.env.NODE_ENV !== 'production',
})

export default store

dispatchActionForAllModules('init')