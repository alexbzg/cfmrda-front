import axios from 'axios'

export const API_URL = '/aiohttp/'

export default {

  onError (error) {
    let e = {status: 0, log: ''}
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
  },

  post (URL, data) {
    return axios.post(API_URL + URL, data)
      .catch(this.onError)
  },

  get (URL) {
    if (!URL.startsWith('/')) {
      URL = window.location.pathname + '/' + URL
    }
    return axios.get(URL)
      .catch(this.onError)
  },

  login (data) {
    return this.post ('login', data)
      .then(response => {
        return response.data
      })
      .catch(e => {
        alert(e.message)
        throw e
      })
  },

  getSchemas () {
    return this.get('/json/schemas.json')
      .then(response => {
        return response.data
      })
  }

}
