import Vue from 'vue'
import Vuex from 'vuex'
import merge from 'deepmerge'

Vue.use(Vuex)

import storage from '../storage'
import {BANDS, MODES} from '../ham-radio'
import {getDx, getHunterDetails, getMscData, userData} from '../api'
import playSound from '../play-sound'

const STORAGE_KEY_USER = 'user'
const STORAGE_KEY_DX_FILTER = 'dxFilter'


const INIT_MUTATION = 'userInit'
export const SET_USER_MUTATION = 'setUser'
export const SET_OLD_CALLSIGNS_ALL = 'setOldCallsignsAll'
export const SET_DX_FILTER_MUTATION = 'setDxFilter'
export const DX_LISTENERS_MUTATION = 'dxListeners'
const SET_USER_RDA_MUTATION = 'setUserRda'
const SET_DX_MUTATION = 'setDx'
const SET_MSC_MUTATION = 'setMsc'
export const SET_USER_DATA_MUTATION = 'setUsrDataMtn'

const MSC_UPDATE_ACTION = 'mscUpdate'
const DX_UPDATE_ACTION = 'dxUpdate'
const LOAD_USER_RDA_ACTION = 'userRdaLoad'
export const USER_DATA_ACTION = 'userDataActn'

const DX_UPDATE_INTERVAL = 60 * 1000

const DX_SOUND = new Audio('/note.mp3')

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true,
    dxFilter: null,
    dx: [],
    userRda: {},
    mscData: {
      qsoCount: null
    }
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
    oldCallsigns: state => {
      return state.user ? JSON.parse(JSON.stringify(state.user.oldCallsigns)) : null
    },
    dxFilter: state => () => {
      return JSON.parse(JSON.stringify(state.dxFilter))
    }, 
    userDefs: state => {
      return state.user && state.user.defs ? JSON.parse(JSON.stringify(state.user.defs)) :
        {qsl: {}}
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
              state.userRda[item.awards.RDA.value][item.band] &&
              (state.dxFilter.modes.mix || 
                state.userRda[item.awards.RDA.value][item.band][item.mode]))
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
      getAdditionalData()
      state.dxUpdateInterval = setInterval(getAdditionalData, DX_UPDATE_INTERVAL)
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
      if (state.user && state.user.callsign) {
        store.dispatch(LOAD_USER_RDA_ACTION)
        store.dispatch(USER_DATA_ACTION)
      }
    },
    [SET_USER_DATA_MUTATION] (state, payload) {
      for (const field in payload) {
        Vue.set(state.user, field, payload[field])
      }
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
    [SET_MSC_MUTATION] (state, payload) {
      state.mscData = payload
      state.mscData.userActivityTotal = {qslWait: 0, qslToday: 0}
      if (payload.userActivity) {
        state.mscData.userActivityTotal = payload.userActivity.reduce((acc, val) => {
          return {
            qslWait: acc.qslWait + val.qslWait,
            qslToday: acc.qslToday + val.qslToday
          }
        }, {qslWait: 0, qslToday: 0})
      }
    },
    [SET_DX_MUTATION] (state, payload) {
      if (payload.length) {
        const newDx0 = JSON.stringify(payload[0])
        if (!state.dxPrev || state.dxPrev !== newDx0) {
          const prev = state.dxPrev
          state.dx = payload
          state.dxPrev = newDx0
          if (store.getters.dx.length) {
            const newFDx0 = JSON.stringify(store.getters.dx[0])
            if (!state.dxPrevF || state.dxPrevF !== newFDx0) {
              state.dxPrevF = newFDx0
              if (prev && state.dxFilter.sound)
                playSound(DX_SOUND)
            }
          }
        }
      }
    }
  },
  actions: {
    [LOAD_USER_RDA_ACTION] ({commit, state}) {
      if (state.user && state.user.callsign) {
        getHunterDetails(state.user.callsign)
          .then(data => {commit(SET_USER_RDA_MUTATION, data.rda.hunter)})
      }
    },
    [DX_UPDATE_ACTION] ({commit}) {
      getDx()
        .then(data => { commit(SET_DX_MUTATION, data) })
    },
    [MSC_UPDATE_ACTION] ({commit}) {
      getMscData()
        .then(data => { commit(SET_MSC_MUTATION, data) })
    },
    [USER_DATA_ACTION] ({commit, state}, payload) {
      if (state.user && state.user.token) {
        const data = payload ? JSON.parse(JSON.stringify(payload)) : {}
        data['token'] = state.user.token
        userData(data)
          .then(data => { commit(SET_USER_DATA_MUTATION, data) })
      }
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(INIT_MUTATION)

function getAdditionalData () {
  store.dispatch(DX_UPDATE_ACTION)
  store.dispatch(MSC_UPDATE_ACTION)
  store.dispatch(USER_DATA_ACTION)
}

export default store
