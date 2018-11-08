import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Index from './../components/Index'
import Contact from './../components/Contact'
import StaticPage from './../components/StaticPage'

const CFM = () => import(/* webpackChunkName: "cfm" */ './../components/CFM.vue')
const EmailCFM = () => import(/* webpackChunkName: "cfm" */ './../components/EmailCFM.vue')

const ManageUploads = () => import(/* webpackChunkName: "uploader" */ './../components/ManageUploads.vue')
const NewUpload = () => import(/* webpackChunkName: "uploader" */ './../components/NewUpload.vue')
const Uploads = () => import(/* webpackChunkName: "uploader" */ './../components/Uploads.vue')

const CfmQso = () => import(/* webpackChunkName: "cfm_qso" */ './../components/CfmQso.vue')
const CfmBlacklist = () => import(/* webpackChunkName: "cfm_blacklist" */ './../components/CfmBlacklist.vue')

const router = new Router({
  routes: [
    { path: '/',
      name: 'Index',
      component: Index
    },
    { path: '/cfm',
      component: CFM,
      children: [
        /*{
          path: 'paper',
          name: 'PaperCFM',
          component: PaperCFM
        },*/
        {
          path: '',
          name: 'EmailCFM',
          component: EmailCFM
        }
      ]
    },
    { path: '/cfm_qso',
      name: 'CfmQso',
      component: CfmQso
    },
    { path: '/cfm_blacklist',
      name: 'CfmBlacklist',
      component: CfmBlacklist
    },
    {
      path: '/uploads',
      component: Uploads,
      children: [
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
      path: '/static/:page',
      name: 'StaticPage',
      component: StaticPage
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

export default router
