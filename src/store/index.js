import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import storage from '../storage'
import api from '../api'

const STORAGE_KEY_USER = 'user'

export const USER_INIT_MUTATION = 'userInit'
export const SET_USER_MUTATION = 'setUser'

export const LOGIN_ACTION = 'login'

export default new Vuex.Store({
  state: {
    user: null
  },
  getters: {
    userCallsign: state => {
      return state.user ? state.user.callsign : null
    },
    userEmailConfirmed: state => {
      return state.user ? state.user.email_confirmed : null
    }
  },
  mutations: {
    [USER_INIT_MUTATION] (state) {
      state.user = storage.load(STORAGE_KEY_USER)
    },
    [SET_USER_MUTATION] (state, payload) {
      state.user = payload.user
      storage.save(STORAGE_KEY_USER, state.user,
        state.user.remember ? 'local' : 'session')
    }
  },
  actions: {
    [LOGIN_ACTION] ({ commit }) {
      api.login(user => commit(SET_USER_MUTATION, {user: user}))
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})
