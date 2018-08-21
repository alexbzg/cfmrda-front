import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Upload from './../components/Upload'
import Index from './../components/Index'

const router = new Router({
  routes: [
    { path: '/',
      name: 'Index',
      component: Index,
      props: true
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload,
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      props: true
    }
  ]
})

export default router
