import axios from 'axios'
import Vue from 'vue'

export const API_URL = '/aiohttp/'

function onError (error) {
  let e = {status: 0, log: '', message: 'Ошибка сервера. Пожалуйста, повторите операцию позднее.'}
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    e.log = error.response.data + '\n'
    + error.response.status + '\n'
    + error.response.headers
    if (error.response.status === 400) {
    e.status = 400
    e.message = error.response.data
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    e.log = error.request
  } else {
    // Something happened in setting up the request that triggered an Error
    e.log = error.message
  }
  e.log += '\n' + error.config
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.log(e.log)
  }
  throw e
}

export function post (URL, data) {
  return axios.post(API_URL + URL, data)
    .catch(onError)
}

export function get (URL) {
  if (!URL.startsWith('/')) {
    URL = window.location.pathname + '/' + URL
  }
  return axios.get(URL)
    .catch(onError)
}

function dataPost(url, data) {
  return post (url, data)
    .then(response => {
      return response.data
    })
}

export function manageUploads (data) {
  return dataPost('manage_uploads', data)
}

export function cfmRequestQso (data) {
  return dataPost('cfm_request_qso', data)
}

export function getUploads (token) {
  return dataPost('user_uploads', {'token': token})
}

export function login (data) {
  return dataPost('login', data)
}

export function cfmQso (data) {
  return dataPost('cfm_qso', data)
}

export function cfmBlacklist (token) {
  return dataPost('cfm_blacklist', {token: token})
}

export function contactSupport (data) {
  return dataPost('contact_support', data)
}

export function uploadADIF (data) {
  return dataPost('adif', data)
}

export function chatPost (data) {
  return dataPost('chat', data)
}

export function getRDAValues () {
  return get('/json/rdaValues.json')
    .then(response => {
      return response.data
    })
}

export function getRankings () {
  return get('/json/rankings.json')
    .then(response => {
      return response.data
    })
}

export function getHTML (page) {
  return get('/html/' + page + '.html')
    .then((response) => {
      return response.data
    })
}

export function getRecentUploads () {
  return get('/json/recent_uploads.json')
    .then(response => {
      return response.data
    })
}

export function getMscData () {
  return get('/json/msc.json')
    .then(response => {
      return response.data
    })
}


export function getFullRDA () {
  return get('/json/rda.json')
    .then(response => {
      return response.data
    })
}

export function getHunterDetails (callsign) {
  return get(API_URL + 'hunter/' + callsign)
    .then(response => {
      return response.data
    })
}

export function getCorrespondentEmail (callsign) {
  return get(API_URL + 'correspondent_email/' + callsign)
    .then(response => {
      return response.data
    })
}

export function getUpload (id) {
  return get(API_URL + 'upload/' + id)
    .then(response => {
      return response.data
    })
}

export function dataService(url, eventName) {
  let bus = new Vue({})
  let s = {
    lastModified: null,
    load: load,
    data: null,
    processData: function () {},
    onUpdate: onUpdate}

  return s

  function onUpdate (callback) {
    bus.$on(eventName, callback)
    if (s.data) {
      callback()
    }
  }

  function load () {
    return get(url)
      .then(loadComplete)

    function loadComplete (response) {
      if (s.lastModified !== response.headers['last-modified']) {
        s.lastModified = response.headers['last-modified']
        s.data = response.data
        s.processData()
        bus.$emit(eventName)
      }
      return response.data
    }
  }
}
