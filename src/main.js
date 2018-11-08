import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import store from './store'

import router from './router'

import capitalizeDirective from './capitalize-directive'
capitalizeDirective()

import asyncHtmlDirective from './async-html-directive'
asyncHtmlDirective()

new Vue({
  store: store,
  router: router,
  render: h => h(App)
}).$mount('#app')
