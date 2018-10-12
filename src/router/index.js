import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Index from './../components/Index'
import Contact from './../components/Contact'
import Faq from './../components/Faq'
const ManageUploads = () => import(/* webpackChunkName: "uploader" */ './../components/ManageUploads.vue')
const Upload = () => import(/* webpackChunkName: "uploader" */ './../components/Upload.vue')

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
      path: '/contact',
      name: 'Contact',
      component: Contact,
      props: true
    },
    {
      path: '/faq',
      name: 'Faq',
      component: Faq
    },
    {
      path: '/manageUploads',
      name: 'ManageUploads',
      component: ManageUploads
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
