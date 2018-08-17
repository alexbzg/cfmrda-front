import Vue from 'vue'
import Router from 'vue-router'
import Login from './../components/Login'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/stations'
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
