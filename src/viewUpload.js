import Vue from 'vue'
import ViewUpload from './ViewUpload.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(ViewUpload)
}).$mount('#app')
