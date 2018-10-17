<template>
    <div class="list list_small">
      <div id="contact">
        <vue-recaptcha v-if="!msg.token"
            ref="recaptcha"
            @verify="onRecaptchaVerify"
            @expired="onRecaptchaExpired"
            size="invisible"
            :sitekey="$options.RECAPTCHA_SITE_KEY">
        </vue-recaptcha>
       
        <input type="text" v-model.trim="msg.email" v-if="!msg.token" placeholder="your e-mail"
            id="email_input" :class="{error: validationErrors.email}"/><br/>
        <textarea v-model="msg.text" placeholder="your message" id="text_area"
            :class="{error: validationErrors.text}"></textarea><br/>
        <input type="button" value="OK" :disabled="pending || !validated" @click="sendClick()"
            id="send_button" class="btn">

        <div v-if="response" id="message" v-html="response"></div>
    </div>
  </div>
</template>

<script>
import debounce from '../debounce'

import storage from '../storage'
import {contactSupport} from '../api'

import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'

const STORAGE_KEY_EMAIL = 'contact_email'

export default {
  mixins: [validationMixin, recaptchaMixin],
  name: 'Contact',
  data () {
    const msg = { 
      text: null
    }
    const token = this.$store.getters.userToken
    if (token) {
      msg.token = token
    } else {
      msg.recaptcha = null
      msg.email = storage.load(STORAGE_KEY_EMAIL)
    }
    return { 
      msg: msg,
      pending: false,
      validationSchema: 'contactSupport',
      validationData: msg,
      response: null
    }
  },
  mounted () {
    this.validate()
  },
  methods: {

    sendClick: debounce(function () {
      this.send()
    }, 300, true),

    send () {

      if (this.msg.email) {
        storage.save(STORAGE_KEY_EMAIL, this.msg.email, 'local')
      }
      this.pending = true
      
      contactSupport(this.msg)
        .then(() => {
          this.response = 'Ваше сообщение было отправлено.'
          this.msg.text = null
        })
        .catch((e) => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

