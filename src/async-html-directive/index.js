import Vue from 'vue'

import {getHTML} from '../api'

export default function () {
  Vue.directive('async-html', function (el, binding, vnode) {
    getHTML(binding.value)
      .then((data) => {
        el.innerHTML = data
        vnode.elm.dispatchEvent(new CustomEvent('load'))
      })
  })
}
  
