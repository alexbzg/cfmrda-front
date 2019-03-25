import Vue from 'vue'
import Vuex from 'vuex'
import merge from 'deepmerge'

Vue.use(Vuex)

import storage from '../storage'
import {BANDS, MODES} from '../ham-radio'
import {getDx, getHunterDetails} from '../api'

const STORAGE_KEY_USER = 'user'
const STORAGE_KEY_DX_FILTER = 'dxFilter'

const INIT_MUTATION = 'userInit'
export const SET_USER_MUTATION = 'setUser'
export const SET_OLD_CALLSIGNS_ALL = 'setOldCallsignsAll'
export const SET_DX_FILTER_MUTATION = 'setDxFilter'
export const DX_LISTENERS_MUTATION = 'dxListeners'
const SET_USER_RDA_MUTATION = 'setUserRda'
const SET_DX_MUTATION = 'setDx'

const DX_UPDATE_ACTION = 'dxUpdate'
const LOAD_USER_RDA_ACTION = 'userRdaLoad'

const DX_UPDATE_INTERVAL = 60 * 1000

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true,
    dxFilter: null,
    dx: null,
    dxListeners: {},
    userRda: {}
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
      return state.user ? JSON.parse(JSON.stringify(state.user.oldCallsigns)) : null
    },
    dxFilter: state => {
      return JSON.parse(JSON.stringify(state.dxFilter))
    }, 
    dx: state => {
      if (state.dx) {
        return state.dx.filter(item => {
          if (!state.dxFilter.bands[item.band])
            return false
          if (!state.dxFilter.modes.mix && !state.dxFilter.modes[item.mode])
            return false
          if (state.dxFilter.allRda && item.awards.RDA)
            return true
          if (state.dxFilter.dxped && item.dxped)
            return true
          if (item.awards.RDA) {
            if (state.userRda[item.awards.RDA.value] &&
              state.userRDA[item.awards.RDA.value][item.band] &&
              (state.dxFilter.modes.mix || 
                state.userRDA[item.awards.RDA.value][item.band][item.mode]))
              return false
            else
              return true
          }
          return false
        })
      } else
        return null
    }

  },
  mutations: {
    [INIT_MUTATION] (state) {
      state.user = storage.load(STORAGE_KEY_USER)
      const dxfDef = {
        bands: {},
        modes: {
          mix: false
        },
        allRda: false,
        dxped: false,
        sound: false
      }
      for (const band of BANDS)
        dxfDef.bands[band] = true
      for (const mode of MODES)
        dxfDef.modes[mode] = true
      const dxfStor = storage.load(STORAGE_KEY_DX_FILTER, 'local')
      state.dxFilter = dxfStor ? merge(dxfDef, dxfStor) : dxfDef
      if (state.user && state.user.callsign)
        store.dispatch(LOAD_USER_RDA_ACTION)
    },
    [DX_LISTENERS_MUTATION] (state, payload) {
      for (const lstnr in payload) {
        if (payload[lstnr])
          state.dxListeners[lstnr] = true
        else
          delete state.dxListeners[lstnr]
      }
      if (state.dxUpdateInterval && Object.keys(state.dxListeners).length === 0)
        clearInterval(state.dxUpdateInterval)
      else if (!state.dxUpdateInterval && Object.keys(state.dxListeners).length) 
        state.dxUpdateInterval = setInterval(function () {store.dispatch(DX_UPDATE_ACTION)}, 
          DX_UPDATE_INTERVAL)
    },
    [SET_DX_FILTER_MUTATION] (state, payload) {
      const dxfNew = JSON.parse(JSON.stringify(payload))
      if (!state.dxFilter.modes.mix && dxfNew.modes.mix) {
        for (const mode of MODES)
          dxfNew.modes[mode] = false
      }
      for (const mode of MODES) {
        if (!state.dxFilter.modes[mode] && dxfNew.modes[mode]) {
          dxfNew.modes.mix = false
          break
        }
      }
      state.dxFilter = dxfNew
      storage.save(STORAGE_KEY_DX_FILTER, dxfNew, 'local')
    },
    [SET_USER_MUTATION] (state, payload) {
      state.user = payload.user
      storage.remove(STORAGE_KEY_USER, state.remember ? 'local' : 'session')
      if (payload.user) {
        storage.save(STORAGE_KEY_USER, state.user,
          payload.remember ? 'local' : 'session')
        state.remember = payload.remember
      }
      if (state.user && state.user.callsign)
        store.dispatch(LOAD_USER_RDA_ACTION)
    },
    [SET_OLD_CALLSIGNS_ALL] (state, callsigns) {
      state.user.oldCallsigns.all = JSON.parse(JSON.stringify(callsigns))
    },
    [SET_USER_RDA_MUTATION] (state, payload) {
      state.userRda = {}
      for (const rda in payload) {
        state.userRda[rda] = {}
        for (const item of payload[rda]) {
          if (item.band) {
            if (!(item.band in state.userRda[rda]))
              state.userRda[rda][item.band] = {}
            state.userRda[rda][item.band][item.mode] = true
          }
        }
      }
    },
    [SET_DX_MUTATION] (state, payload) {
      state.dx = payload
    }
  },
  actions: {
    [LOAD_USER_RDA_ACTION] (commit, state) {
      if (state.user && state.user.callsign) {
        getHunterDetails(state.user.callsign)
          .then(data => {commit(SET_USER_RDA_MUTATION, data.rda.hunter)})
      }
    },
    [DX_UPDATE_ACTION] (commit) {
      getDx()
        .then(data => { commit(SET_DX_MUTATION, data) })
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(INIT_MUTATION)

export default store
