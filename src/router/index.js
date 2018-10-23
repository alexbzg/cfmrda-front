import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Index from './../components/Index'
import Contact from './../components/Contact'
import Faq from './../components/Faq'
import CFM from './../components/CFM'
import EmailCFM from './../components/EmailCFM'
const ManageUploads = () => import(/* webpackChunkName: "uploader" */ './../components/ManageUploads.vue')
const NewUpload = () => import(/* webpackChunkName: "uploader" */ './../components/NewUpload.vue')
const Uploads = () => import(/* webpackChunkName: "uploader" */ './../components/Uploads.vue')

const router = new Router({
  routes: [
    { path: '/',
      name: 'Index',
      component: Index
    },
    { path: '/cfm',
      name: 'CFM',
      component: CFM,
      chidren: [
        {
          path: 'email',
          name: 'EmailCFM',
          component: EmailCFM
        }
      ]
    },
    {
      path: '/uploads',
      name: 'Uploads',
      component: Uploads,
      children: [
        {
          path: 'new',
          name: 'NewUpload',
          component: NewUpload
        },
        {
          path: 'manage',
          name: 'ManageUploads',
          component: ManageUploads
        },
        {
          path: '',
          name: 'NewUpload',
          component: NewUpload
        }
      ]
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact
    },
    {
      path: '/faq',
      name: 'Faq',
      component: Faq
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

export default router
