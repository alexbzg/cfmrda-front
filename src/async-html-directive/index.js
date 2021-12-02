import Vue from 'vue'

import {getHTML} from '../api'

export default function () {
  Vue.directive('async-html', function (el, binding, vnode) {
    getHTML(binding.value)
      .then((data) => {
        el.innerHTML = data
        //recreate scripts nodes to run scripts
		Array.from(el.querySelectorAll("script")).forEach( oldScript => {
          const newScript = document.createElement("script")
          Array.from(oldScript.attributes)
            .forEach( attr => newScript.setAttribute(attr.name, attr.value) )
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        vnode.elm.dispatchEvent(new CustomEvent('load'))
      })
  })
}
  
