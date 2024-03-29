<template>
    <div class="list list_small">
        <div id="login_register">

            <template v-if="mode !== 'passwordChange'">
                <b>Callsign</b><br/>
                <input type="text" name="callsign_input" id="callsign_input" v-model.trim="login.callsign"
                    :class="{error: validationErrors.callsign}" v-capitalize/>
                <br/>
            </template>

            <template v-if="mode !== 'passwordRequest'">
                <b>Password</b> <span class="note"> (min. 8 symbols)</span><br/>
                <input type="password" name="password_input" id="password_input"
                    :class="{error: validationErrors.password}"
                    v-model="login.password"><br/>
            </template>

            <div id="register" v-if="mode === 'register'">
                <b>Email</b><br/>
                <input type="text" name="email_input" id="email_input"
                    :class="{error: validationErrors.email}"
                    v-model.trim="login.email"><br/>
                <span class="note_red">
                    Email должен быть <b>обязательно</b> тот, который показывается на вашей странице на <b>QRZ.com</b>!<br/>На этот email будет отправлено письмо с ссылкой. Кликните по ней для завершения регистрации.<br/><b>Если вы не зарегистрированы на QRZ.com</b> или <b>просто не получается зарегистрироваться</b>,<br/>напишите нам через форму Contact (см. меню).<br/><br/>
                </span>
                <span class="note_grey">
                    Email is <b>required</b> that the one shown on your page at <b> QRZ.com </b>! <br/>Confirmation link will be sent to this email. Click on it to complete registration.
                    <br/><b>If you are not registered on QRZ.com</b> or <b>simply cannot register</b> write to us via the Contact form (see Мenu).<br/><br/>
                </span>
            </div>

            <div id="recap">
                <vue-recaptcha v-if="mode === 'register' || mode === 'passwordRequest'"
                ref="recaptcha"
                @verify="onRecaptchaVerify"
                @expired="onRecaptchaExpired"
                :sitekey="$options.RECAPTCHA_SITE_KEY">
                </vue-recaptcha>
            </div>

            <template v-if="mode == 'login'">
                <input type="checkbox" name="remember_input" id="remember_input"
                    v-model="remember"> Keep me logged<br/>
            </template>
            <input type="button" name="login_btn" id="login1_btn"
                value="OK" class="btn"
                v-show="!pending && validated" @click="loginClick()"/>
            <div v-if="response" id="message" v-html="response"></div>
            <div id="login_bottom" v-if="mode !== 'passwordChange'">
                <a id="pass_recovery" href="#"
                    @click="mode = (mode === 'passwordRequest' ? 'login' : 'passwordRequest')">
                    {{mode === 'passwordRequest' ? 'Login/Registration' : 'Password recovery'}}
                </a>
                <input type="button" name="register_btn" id="login2_btn"
                    v-if="mode !== 'passwordRequest'"
                    :value="mode === 'register' ? 'Login' : 'Registration'" class="btn"
                    @click="mode = mode === 'register' ? 'login' : 'register'"/>
            </div>
        </div>
    </div>

</template>

<script>
import {debounce} from '../utils'

import {login as api_login} from '../api'
import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'

import {SET_USER_MUTATION} from '../store'

export default {
  name: 'login',
  mixins: [validationMixin, recaptchaMixin],
  data () {
    const token = this.$route.query.token
    return {
      login:  {
        callsign: null,
        password: null,
        email: null,
        token: token,
        recaptcha: null
      },
      remember: true,
      pending: false,
      mode: token ? 'passwordChange' : 'login',
      response: null
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters.userCallsign) {
        vm.$router.push('/')
      }
    })
  },
  mounted () {
    this.validationData = this.login
    this.validationSchema = this.mode
  },
  methods: {
    doLogin() {
      this.pending = true
      this.response = null
      const data = {...this.login, mode: this.mode}

      api_login(data)
        .then((user) => {
          if (this.mode === 'login') {
            this.$store.commit(SET_USER_MUTATION, {user: user, remember: this.remember})
            this.$router.push('/')
          } else if (this.mode === 'passwordRequest') {
            this.response = 'На ваш адрес электронной почты было отправлено письмо с инструкциями.'
          } else if (this.mode === 'passwordChange') {
              this.response = 'Ваш пароль был изменен.'
              this.mode = 'login'
          } else if (this.mode === 'register') {
              this.response = 'Для завершения регистрации необходимо подтвердить адрес элетронной почты. Вам было отправлeно письмо с инструкциями.'
              this.mode = 'login'
          }
        })
        .catch((e) => {
          if (this.mode === 'register' || this.mode === 'passwordRequest') {
            this.resetRecaptcha()
          }
          if (e.status === 400) {
            this.response = e.message
          }
        })
        .finally(() => {
          this.pending = false
        })
    },
    loginClick: debounce(function () {
      this.doLogin()
    }, 300, true)
  },
  watch: {
    mode: function (newVal) {
      this.validationSchema = newVal
    }
  }
}
</script>

<style scoped>
</style>
