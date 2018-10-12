import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/*
import Ajv from 'ajv'
const ajv = new Ajv({allErrors: true})
*/

import storage from '../storage'
import {getUploads} from '../api'

const STORAGE_KEY_USER = 'user'

const USER_INIT_MUTATION = 'userInit'
const SET_UPLOADS_MUTATION = 'setUploads'
export const SET_USER_MUTATION = 'setUser'

export const GET_UPLOADS_ACTION = 'getUploads'

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true,
    uploads: null
  },
  getters: {
    userCallsign: state => {
      return state.user ? state.user.callsign : null
    },
    userToken: state => {
      return state.user ? state.user.token : null
    },
    admin: state => {
      return state.user ? state.user.admin : false
    },
    uploads: state => {
      return state.uploads
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
    },
    [SET_UPLOADS_MUTATION] (state, uploads) {
      state.uploads = uploads
    }
  },
  actions: {
    [GET_UPLOADS_ACTION] ({state, commit}) {
      if (state.user && state.user.token) {
        getUploads(state.user.token)
          .then((data) => {
            commit(SET_UPLOADS_MUTATION, data)
          })
      }
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(USER_INIT_MUTATION)

export default store
