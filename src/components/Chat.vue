<template>
    <div class="list">
        <div id="chat">
            <table id="message_form">
                <tbody>
                    <tr>
                        <td>
                            <input type="text" id="your_call" v-model.trim="callsign" v-capitalize/>
                        </td>
                        <td>
                            <input type="text" id="your_name" v-model.trim="name"/>
                        </td>
                        <td>
                            <input type="text" id="your_text" v-model.trim="message" @keyup="typing"/>
                        </td>
                        <td>
                            <button @click="buttonClick()" :disabled="buttonDisabled">OK</button>
                        </td>
                    </tr>
                    <tr>
                        <td class="note">your callsign</td>
                        <td class="note">your name</td>
                        <td class="note">your message</td>
                        <td class="note">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
            
            <table id="chat_layout">
                <tr>
                    <td>
                        <table id="chat_window">
                            <tr v-for="message in messages" :key="message.ts"> 
                                <td class="call">
                                    <span class="call" @click="replyTo(message.callsign)" 
                                        :class="{admin: message.admin}">
                                        {{replace0(message.callsign)}}
                                    </span><br/>
                                    <span class="name" v-if="message.name" @click="replyTo(message.callsign)">
                                        {{message.name}}
                                    </span>
                                    <a :href="'http://qrz.com/db/' + message.callsign" target="_blank" 
                                        rel="noopener" title="Link to QRZ.com">
                                        <img src="/images/icon_qrz.png"/>
                                    </a>
                                    <br/>
                                    <span class="date_time">{{message.date}} {{message.time}}</span>
                                </td>
                                <td>
                                    <span class="message_to" v-for="callsign in message.to" :key="callsign">
                                        &rArr; {{callsign}}
                                    </span>
                                    {{message.text}}
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td>                   
                        <div id="chat_info">
                            <div class="chat_info_title">Online</div>
                            <div class="chat_info_users1">
                                <span v-for="user in users" :key="user.callsign" :class="{admin: user.admin}"
                                    @click="replyTo(user.callsign)">
                                    {{replace0(user.callsign)}}<br/>
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>

        </div>
    </div>

</template>

<script>
import {mapGetters} from 'vuex'

import replaceZerosMixin from '../replace-zeros-mixin'
import storage from '../storage'
import {dataService, chatPost} from '../api'

const CHAT_STORAGE_KEY = 'chat'

const TYPING_INT = 5 * 60
const CHAT_RELOAD_INT = 5 * 1000
const USERS_RELOAD_INT = 5 * 1000
const USERS_POST_INT = 5 * 1000

const chatService = dataService('/json/chat.json', 'chat-update')
const usersService = dataService('/json/active_users.json', 'users-update')

const reMSG_TO = /(:?=>\s?\w+\s?)+\s/


export default {
  mixins: [replaceZerosMixin],
  name: 'Chat',
  data () {
    const stored = storage.load(CHAT_STORAGE_KEY)
    let callsign = null
    if (stored && stored.callsign)
        callsign = stored.callsign
    else if (this.$store.getters.userCallsign)
        callsign = this.$store.getters.userCallsign
    chatService.onUpdate(this.chatUpdate)
    chatService.load()
    this.reloadUsers()
    this.$chatReloadInterval = setInterval(chatService.load, CHAT_RELOAD_INT)
    this.$usersReloadInterval = setInterval(this.reloadUsers, USERS_RELOAD_INT)
    this.$usersPostInterval = setInterval(this.postUsers, USERS_POST_INT)
    return {
      tabId: 'chat',
      callsign: callsign,
      name: stored && stored.name ? stored.name : null,
      message: null,
      users: [],
      messages: [],
      typingTs: null,
      pending: false,
    }
  },
  beforeDestroy () {
    clearInterval(this.$chatReloadInterval)
    clearInterval(this.$usersReloadInterval)
    clearInterval(this.$usersPostInterval)
  },
  methods: {
    chatUpdate () {
      for (const msg of chatService.data) {
        let match = null
        if (match = reMSG_TO.exec(msg.text)) {
          const to = match[0]
          msg.text = msg.text.substring(to.length, msg.text.length - to.length)
          msg.to = to.split(/\s?=>\s?/)
        }
      }
      this.messages = chatService.data
    },
    post (data) {
      if (this.userToken && this.userCallsign === this.callsign)
        data.token = this.userToken
      else
        data.callsign = this.callsign
      return chatPost(data)
    },
    buttonClick () {
      if (this.buttonDisabled) return
      storage.save(CHAT_STORAGE_KEY, 
        {callsign: this.callsign,
        name: this.name}, 
        'local')
        this.pending = true
        this.post({'message': this.message,
          'name': this.name})
          .then(() => { 
            this.message = null
            chatService.load()
          })
          .finally(() => {
            this.pending = false
          })
    },
    reloadUsers () {
      usersService.load()
        .then(() => {
          const ts = Date.now() / 1000
          const data = usersService.data
          for (const cs in data) {
            if (data[cs].typing && ts - data[cs].ts > TYPING_INT) {
              data[cs].typing = false
            }
          }
          const au = []
          for (const cs in data) {
            data[cs].callsign = cs
            au.push( data[cs] )
          }
          au.sort(
            function (a, b) {
              if (a.callsign < b.callsign) return -1
              if (b.callsign < a.casllsign) return 1
              return 0
            })
          this.users = au
        })
    },
    typing (event) {
      if (event.key === 'Enter') {
        this.buttonClick()
      } else {
        this.typingTs = Date.now() / 1000 + TYPING_INT
      }
    },
    postUsers (data) {
      if (this.callsign) {
        const _data = data ? {...data} : {}
        _data.typing = Date.now() / 1000 < this.typingTs
        this.post(_data)
      }
    },
    msgMouseOver (state, e) {
      if (this.admin) {
        if (state) {
          e.currentTarget.classList.add( 'can_delete' )
        } else {
          e.currentTarget.classList.remove( 'can_delete' )
        }
      }
    },
    deleteMsg (ts) {
      if (window.confirm('Do you really want to delete this message?')) {
        this.serverPost( { 'delete': ts } )
      }
    },
    replyTo (callsign) {
      const txt = '=> ' + callsign
      if ( !this.message || this.message.indexOf(txt) === -1 ) {
        this.message = txt + (this.message ? ' ' + this.message : '')
      }
    }
  },
  computed: {
    ...mapGetters(['userToken', 'userCallsign', 'admin']),
    buttonDisabled () {
      return this.pending || (this.message === null || this.message.length === 0) 
        || (this.callsign === null || this.callsign.length === 0)
    }
  }
}
</script>

<style scoped>
</style>
