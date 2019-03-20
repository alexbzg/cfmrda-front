<template>
  <div id="app">
    <div id="top">
        <router-link to="/"><img id="logo" src="images/cfmrda_logo.png" border="0" /></router-link>

        <div id="top_menu" >
            <router-link to="/" id="callsign" v-if="userCallsign">{{userCallsign}}</router-link>
            <router-link to="/" v-if="$route.name !== 'Index'" id="home">Home</router-link>
            <router-link to="/admin" v-if="admin" id="admin">Admin</router-link>
            <router-link to="/awards">Awards</router-link>
            <router-link to="/cfm" v-if="userCallsign">CFM RDA</router-link>
            <router-link to="/uploads" v-if="userCallsign">Загрузки</router-link>
            <router-link to="/stats">Stats</router-link>
            <router-link to="/static/faq">FAQ</router-link>
            <router-link to="/chat" id="chat">Chat</router-link>
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
import {mapGetters} from 'vuex'

import './style.css'

import {SET_USER_MUTATION} from './store'

export default {
  name: 'app',
  components: {
  },
  computed: {
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
    textarea.error, input.error, select.error {
        background-color: #ff111133;
    }
</style>
