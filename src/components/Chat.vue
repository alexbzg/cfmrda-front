<template>
  <div class="list">
      <div id="chat_cluster_view">
        <img src="/images/icon_chat_cluster.png" @click="showCluster = !showCluster"/>
      </div>
      <div id="chat_cluster" v-if="showCluster">
          <cluster-table rows="3"></cluster-table>
      </div>
      <div id="chat">
            <table id="message_form">
                <tbody>
                    <tr>
                        <td>
                            <input type="text" id="your_call" v-model.trim="callsign" v-capitalize
                                @blur="csNameBlur"/>
                        </td>
                        <td>
                            <input type="text" id="your_name" v-model.trim="name"
                                @blur="csNameBlur"/>
                        </td>
                        <td>
                            <input type="text" id="your_text" v-model="message" @keyup="typing"
                                ref="msgTextInput"/>
                        </td>
                        <td>
                            <img id="smile_btn" src="/images/smiles/01.gif"
                                @click="showSmiles = !showSmiles"/>
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

            <div id="smiles" v-show="showSmiles">
                <div id="close_smiles"><img src="/images/icon_delete20.png" @click="showSmiles = false"></div>
                <div id="smiles_block">
                    <template v-for="n in 70">
                        <div class="smile" :key="'smile_' + n" @click="insertSmile(n)">
                            <span>{{smile(n)}}</span>
                            <img :src="'/images/smiles/' + smile(n) + '.gif'">
                        </div>
                        <br v-if="n % 10 == 0" :key="'smile_br_' + n"/>
                    </template>
                </div>
                <div id="smiles_link"><a href="http://www.kolobok.us/" target="_blank">www.kolobok.us</a></div>
            </div>

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
                                <td @mouseover="messageMouseOver(true,$event)"
                                    @mouseout="messageMouseOver(false,$event)">
                                    <img class="delete_btn" src="/images/icon_delete20.png"
                                        title="Удалить сообщение" @click="deleteMessage(message.ts)"/>
                                    <span class="message_to" v-for="callsignTo in message.to" :key="callsignTo"
                                        :class="{personal: callsignTo === callsign}">
                                        &rArr; {{callsignTo}}
                                    </span>
                                    <span class="message_text" v-html="message.text"></span>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td>
                        <div id="chat_info">
                            <div class="chat_info_title">Online</div>
                            <div class="chat_info_users1">
                                <span v-for="user in users" :key="user.callsign"
                                    :class="{admin: user.admin, typing:user.typing}"
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
import sanitizeHTML from 'sanitize-html'
import insertTextAtCursor from 'insert-text-at-cursor'

import replaceZerosMixin from '../replace-zeros-mixin'
import storage from '../storage'
import {dataService, chatPost} from '../api'

import ClusterTable from './ClusterTable'

const CHAT_STORAGE_KEY = 'chat'

const TYPING_INT = 30 //seconds
const CHAT_RELOAD_INT = 5 * 1000 //ms
const USERS_RELOAD_INT = 5 * 1000 //ms
const USERS_POST_INT = 5 * 1000  //ms

const reMSG_TO = /(:?\u21d2\s?\w+(:?\/\w+)*\s?)+(:?\s|$)/
const MSG_SANITIZE_HTML_SETTINGS = {
    allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']
}

export default {
  mixins: [replaceZerosMixin],
  components: {ClusterTable},
  name: 'Chat',
  data () {
    const stored = storage.load(CHAT_STORAGE_KEY)
    let callsign = null
    if (stored && stored.callsign)
      callsign = stored.callsign
    else if (this.$store.getters.userCallsign)
      callsign = this.$store.getters.userCallsign
    return {
      showSmiles: false,
      tabId: 'chat',
      callsign: callsign,
      name: stored && stored.name ? stored.name : null,
      message: null,
      users: [],
      messages: [],
      typingTs: null,
      pending: false,
      showCluster: false
    }
  },
  mounted () {
    this.chatService = dataService('/json/chat.json', 'chat-update')
    this.usersService = dataService('/json/active_users.json', 'users-update')
    this.chatService.onUpdate(this.chatUpdate)
    this.chatService.load()
    this.reloadUsers()
    this.$chatReloadInterval = setInterval(this.chatService.load, CHAT_RELOAD_INT)
    this.$usersReloadInterval = setInterval(this.reloadUsers, USERS_RELOAD_INT)
    this.$usersPostInterval = setInterval(this.postUsers, USERS_POST_INT)
  },
  beforeRouteLeave (to, from, next) {
    this.post({'exit': true})
    next()
  },
  beforeDestroy () {
    clearInterval(this.$chatReloadInterval)
    clearInterval(this.$usersReloadInterval)
    clearInterval(this.$usersPostInterval)
  },
  methods: {
    smile (n) {
      return n < 10 ? '0' + n : n
    },
    insertSmile (n) {
      insertTextAtCursor(this.$refs.msgTextInput, ':' + this.smile(n) + ':')
    },
    chatUpdate () {
      if (this.chatService.data && this.chatService.data.length) {
        for (const msg of this.chatService.data) {
            msg.text = sanitizeHTML(msg.text, MSG_SANITIZE_HTML_SETTINGS)
            let match = null
            if (match = reMSG_TO.exec(msg.text)) {
              const to = match[0]
              msg.text = msg.text.substring(to.length, msg.text.length)
              msg.to = to.split(/\s?\u21d2\s?/).map(item => item.trim())
              msg.to.shift()
            }
            msg.text = msg.text.replace(/:(\d\d):/g, '<image src="/images/smiles/$1.gif"/>')
        }
        this.messages = this.chatService.data
      }
    },
    post (data) {
      if (this.userToken && (this.userCallsign === this.callsign || 'delete' in data))
        data.token = this.userToken
      else
        data.callsign = this.callsign
      return chatPost(data)
    },
    csNameBlur () {
      storage.save(CHAT_STORAGE_KEY,
        {callsign: this.callsign,
        name: this.name},
        'local')
    },
    buttonClick () {
      if (this.buttonDisabled) return
      this.pending = true
      this.showSmiles = false
      this.post({'message': this.message,
        'name': this.name})
        .then(() => {
          this.message = null
          this.chatService.load()
        })
        .finally(() => {
          this.pending = false
        })
    },
    reloadUsers () {
      this.usersService.load()
        .then(() => {
          const ts = Date.now() / 1000
          const data = this.usersService.data
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
    deleteMessage (ts) {
      if (this.admin && window.confirm('Вы действительно хотите удалить сообщение?')) {
        this.post({'delete': ts})
          .then(this.chatService.load)
      }
    },
    replyTo (callsign) {
      const txt = String.fromCharCode(8658) + ' ' + callsign
      if ( !this.message || this.message.indexOf(txt) === -1 ) {
        this.message = txt + ' ' +  (this.message ? this.message : '')
      }
    },
    messageMouseOver (state, e) {
      if (this.admin) {
        if (state) {
          e.currentTarget.classList.add( 'can_delete' )
        } else {
          e.currentTarget.classList.remove( 'can_delete' )
        }
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
.delete_btn {
    width: 20px;
    height: 20px;
    display: none;
}

.can_delete img{
    display: inline;
}

</style>
