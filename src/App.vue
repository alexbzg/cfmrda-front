<template>
  <div id="app">
    <div id="top">
        <router-link to="/"><img id="logo" src="images/cfmrda_logo.png" border="0" /></router-link>

        <div id="top_menu" >
            <span id="callsign" v-if="userCallsign">{{userCallsign}}</span>  
            <router-link to="/cfm">CFM RDA</router-link>
            <router-link to="/uploads" v-if="userCallsign">Загрузки</router-link>
            <router-link to="/faq">FAQ</router-link>
            <router-link to="/contact">Contact</router-link>
            <router-link to="/login" v-if="!userCallsign">Login</router-link>
            <a @click="logout()" v-else id="logout_link">Logout</a>
       </div>
    </div>
    
    <keep-alive :include="['Index', 'Contact', 'Uploads', 'CFM']">
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
    ...mapGetters(['userCallsign'])
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
