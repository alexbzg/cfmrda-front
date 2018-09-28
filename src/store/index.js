import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/*
import Ajv from 'ajv'
const ajv = new Ajv({allErrors: true})
*/
import jsen from 'jsen'

import storage from '../storage'
import { getSchemas } from '../api'

const STORAGE_KEY_USER = 'user'

const USER_INIT_MUTATION = 'userInit'
export const SET_USER_MUTATION = 'setUser'
const SET_VALIDATORS_MUTATION = 'setSchemas'

export const LOGIN_ACTION = 'login'
const LOAD_SCHEMAS_ACTION = 'loadSchemas'

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
    },
    validate: (state) => (name, data, callback) => { 
      const valid = state.validators[name](data)
      callback(valid, state.validators[name].errors)
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
    [SET_VALIDATORS_MUTATION] (state, payload) {
        /*
      state.validators = {}
      for (const name of Object.keys(payload.schemas)) {
        state.validators[name] = ajv.compile(payload.schemas[name])
      }
      */
      state.validators = {}
      for (const name in payload.schemas) {
        state.validators[name] = jsen(payload.schemas[name], {greedy: true})
      }
    }
  },
  actions: {
    [LOAD_SCHEMAS_ACTION] ({ commit }) {
      getSchemas() 
        .then(schemas => commit(SET_VALIDATORS_MUTATION, {schemas: schemas}))
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(USER_INIT_MUTATION)
store.dispatch(LOAD_SCHEMAS_ACTION)

export default store
