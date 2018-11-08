import Vue from 'vue'

import {getHTML} from '../api'

export default function () {
  Vue.directive('async-html', function (el, binding) {
    getHTML(binding.value)
      .then((data) => {
        el.innerHTML = data
      })
  })
}
  
