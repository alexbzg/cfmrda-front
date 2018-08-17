import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import store from './store'
import {USER_INIT_MUTATION} from './store'

new Vue({
  store: store,
  render: h => h(App),
  created() {
    this.$store.commit(USER_INIT_MUTATION)
  }
}).$mount('#app')
