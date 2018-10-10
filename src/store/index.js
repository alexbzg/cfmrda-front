import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/*
import Ajv from 'ajv'
const ajv = new Ajv({allErrors: true})
*/

import storage from '../storage'

const STORAGE_KEY_USER = 'user'

const USER_INIT_MUTATION = 'userInit'
export const SET_USER_MUTATION = 'setUser'

export const LOGIN_ACTION = 'login'

const store = new Vuex.Store({
  state: {
    user: null,
    validators: null,
    remember: true
  },
  getters: {
    userCallsign: state => {
      return state.user ? state.user.callsign : null
    },
    userToken: state => {
      return state.user ? state.user.token : null
    }
  },
  mutations: {
    [USER_INIT_MUTATION] (state) {
      state.user = storage.load(STORAGE_KEY_USER)
    },
    [SET_USER_MUTATION] (state, payload) {
      state.user = payload.user
      storage.remove(STORAGE_KEY_USER, state.remember ? 'local' : 'session')
      if (payload.user) {
        storage.save(STORAGE_KEY_USER, state.user,
          payload.remember ? 'local' : 'session')
        state.remember = payload.remember
      }
    }
  },
  actions: {
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(USER_INIT_MUTATION)

export default store
