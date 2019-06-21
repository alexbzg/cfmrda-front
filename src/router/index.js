import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Index from './../components/Index'
import Chat from './../components/Chat'
import Contact from './../components/Contact'
import StaticPage from './../components/StaticPage'
import Stats from './../components/Stats'
import Awards from './../components/Awards'
import Cluster from './../components/Cluster'

import StatsRdaQso from './../components/StatsRdaQso'
import AwardsIssued from './../components/AwardsIssued'
import CallsignsRda from './../components/CallsignsRda'

const CFM = () => import(/* webpackChunkName: "cfm" */ './../components/CFM.vue')
const EmailCFM = () => import(/* webpackChunkName: "cfm" */ './../components/EmailCFM.vue')
const PaperCFM = () => import(/* webpackChunkName: "cfm" */ './../components/PaperCFM.vue')
const LoggersCFM = () => import(/* webpackChunkName: "cfm" */ './../components/LoggersCFM.vue')

const ManageUploads = () => import(/* webpackChunkName: "uploader" */ './../components/ManageUploads.vue')
const NewUpload = () => import(/* webpackChunkName: "uploader" */ './../components/NewUpload.vue')
const Uploads = () => import(/* webpackChunkName: "uploader" */ './../components/Uploads.vue')

const CfmQso = () => import(/* webpackChunkName: "cfm_qso" */ './../components/CfmQso.vue')
const CfmBlacklist = () => import(/* webpackChunkName: "cfm_blacklist" */ './../components/CfmBlacklist.vue')

const Admin = () => import(/* webpackChunkName: "admin" */ './../components/Admin.vue')
const QslAdmin = () => import(/* webpackChunkName: "admin" */ './../components/QslAdmin.vue')
const CallsignsAdmin = () => import(/* webpackChunkName: "admin" */ './../components/CallsignsAdmin.vue')

const AutoRegistration = () => import(/* webpackChunkName: "auto_reg" */ './../components/AutoRegistration.vue')

const router = new Router({
//  mode: 'history',
  routes: [
    { path: '/',
      name: 'Index',
      component: Index
    },
    { path: '/chat',
      name: 'Chat',
      component: Chat
    },
    { path: '/callsignsRda/:extSearchCallsign?',
      name: 'CallsignsRda',
      component: CallsignsRda,
      props: true
    },
    { path: '/auto_registration',
      name: 'AutoRegistration',
      component: AutoRegistration,
      props: true
    },
    { path: '/cfm',
      component: CFM,
      children: [
        {
          path: 'paper',
          name: 'PaperCFM',
          component: PaperCFM
        },
        {
          path: '',
          name: 'EmailCFM',
          component: EmailCFM
        },
        {
          path: 'loggers',
          name: 'LoggersCFM',
          component: LoggersCFM
        }
      ]
    },
    { path: '/stats',
      component: Stats,
      children: [
        {
          path: '',
          name: 'StatsRdaQso',
          component: StatsRdaQso
        }
      ]
    },
       
    { path: '/admin',
      component: Admin,
      name: 'Admin',
      children: [
        {
          path: 'qsl',
          name: 'QslAdmin',
          component: QslAdmin
        },
        {
          path: 'callsigns',
          name: 'CallsignsAdmin',
          component: CallsignsAdmin
        },
        {
          path: 'uploads',
          name: 'ManageUploads',
          component: ManageUploads,
          props: {admin: true}
        },
        {
          path: 'email',
          name: 'CfmQso',
          component: CfmQso,
          props: {admin: true}
        }
           
      ]
    },
    { path: '/cfm_qso',
      name: 'CfmQso',
      component: CfmQso
    },
    { path: '/cluster',
      name: 'Cluster',
      component: Cluster
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
          path: 'rules',
          name: 'StaticPage',
          component: StaticPage,
          props: {page: 'rulesADIF'}
        },
        {
          path: '',
          name: 'NewUpload',
          component: NewUpload
        }
      ]
    },
    {
      path: '/awards',
      component: Awards,
      children: [
        {
          path: 'rules',
          name: 'Awards',
          component: StaticPage,
          props: {page: 'rules'}
        },
        {
          path: '',
          name: 'AwardsIssued',
          component: AwardsIssued
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
      component: StaticPage,
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {selector: to.hash}
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

export default router
