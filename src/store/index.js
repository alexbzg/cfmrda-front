import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/*
import Ajv from 'ajv'
const ajv = new Ajv({allErrors: true})
*/

import storage from '../storage'
import {getUploads, manageUploads} from '../api'

const STORAGE_KEY_USER = 'user'

const USER_INIT_MUTATION = 'userInit'
const SET_UPLOADS_MUTATION = 'setUploads'
export const SET_USER_MUTATION = 'setUser'
export const SET_OLD_CALLSIGNS_ALL = 'setOldCallsignsAll'

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
      return JSON.parse(JSON.stringify(state.uploads))
    },
    oldCallsigns: state => {
      return JSON.parse(JSON.stringify(state.oldCallsigns))
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
    },
    [SET_OLD_CALLSIGNS_ALL] (state, callsigns) {
      state.oldCallsigns.all = JSON.parse(JSON.stringify(callsigns))
    }
  },
  actions: {
    [GET_UPLOADS_ACTION] ({state, commit}, payload) {        
      if (state.user && state.user.token) {
        const storeUploads = () => {
          getUploads(state.user.token)
            .then((data) => {
              commit(SET_UPLOADS_MUTATION, data)
            })
        }
        if (payload) {
          payload.token = state.user.token
          return manageUploads(payload)
            .then(() => {storeUploads()})
        } else
          return storeUploads()
      }
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(USER_INIT_MUTATION)

export default store
