<template>
  <div id="app">
    <div id="top">
        <router-link to="/"><img id="logo" src="images/cfmrda_logo.png" border="0" /></router-link>

        <div id="top_menu" >
            <router-link to="/" id="callsign" v-if="userCallsign" exact>{{userCallsign}}</router-link>
            <router-link to="/" v-if="$route.name !== 'Index'" id="home" exact>Home</router-link>
            <router-link to="/admin/qsl" v-if="admin" id="admin">
            Admin <template v-if="mscData.unsortedQsl">({{mscData.unsortedQsl}})</template>
            </router-link>
            <router-link to="/awards">Awards</router-link>
            <router-link to="/callsignsRda">RDA_search</router-link>
            <router-link to="/cluster">Cluster</router-link>
            <router-link to="/cfm" v-if="userCallsign" id="chat">CFM RDA</router-link>
            <router-link to="/uploads" v-if="userCallsign">Загрузки</router-link>
            <router-link to="/stats">Stats</router-link>
            <router-link to="/static/faq">FAQ</router-link>
            <router-link to="/chat">Chat</router-link>
            <router-link to="/contact">Contact</router-link>
            <router-link to="/login" v-if="!userCallsign">Login</router-link>
            <a @click="logout()" v-else id="logout_link">Logout</a>
       </div>
    </div>
    
    <keep-alive :include="['Index', 'Contact', 'Uploads', 'CFM', 'Admin', 'AutoRegistration']">
        <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import {mapGetters,mapState} from 'vuex'

import './style.css'

import {SET_USER_MUTATION} from './store'

export default {
  name: 'app',
  components: {
  },
  computed: {
    ...mapState(['mscData']),
    ...mapGetters(['userCallsign', 'admin'])
  },
  methods: {
    logout () {
      this.$store.commit(SET_USER_MUTATION, {user: null})
    }
  }
}
</script>

<style>

</style>
