import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Upload from './../components/Upload'

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/'
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
