<template>
    <div class="list list_small">
        <div id="login_register">

            <vue-recaptcha v-if="mode === 'register' || mode === 'passwordRequest'"
                ref="recaptcha"
                @verify="onRecaptchaVerify"
                @expired="onRecaptchaExpired"
                size="invisible"
                :sitekey="$options.RECAPTCHA_SITE_KEY">
            </vue-recaptcha>

            <template v-if="mode !== 'passwordChange'">
                <b>Позывной</b><br/>
                <input type="text" name="callsign_input" id="callsign_input" v-model.trim="login.callsign" 
                    :class="{error: validationErrors.callsign}"
                    @change="capitalize(login, 'callsign')"/>
                <br/>
            </template>

            <template v-if="mode !== 'passwordRequest'">
                <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
                <input type="password" name="password_input" id="password_input" 
                    :class="{error: validationErrors.password}"
                    v-model="login.password"><br/>
            </template>

            <div id="register" v-if="mode === 'register'">
                <b>Email</b><br/>
                <span class="note_red">
                    Email должен быть <b>обязательно</b> тем, с которым вы зарегистрированы на 
                    <b>QRZ.com</b>!<br/>
                    На этот email будет отправлено письмо с ссылкой.
                    Кликните по ней для завершения регистрации.
                </span><br/>
                <input type="text" name="email_input" id="email_input" 
                    :class="{error: validationErrors.email}"
                    v-model.trim="login.email"><br/>
            </div>

            <template v-if="mode == 'login'">
                <input type="checkbox" name="remember_input" id="remember_input" 
                    v-model="remember"> Запомнить меня<br/>
            </template>
            <input type="button" name="login_btn" id="login1_btn" 
                value="Отправить" class="btn"
                :disabled="pending || !validated" @click="loginClick()"/>
            <div v-if="response" id="message" v-html="response"></div>
            <div id="login_bottom" v-if="mode !== 'passwordChange'">
                <a id="pass_recovery" href="#" 
                    @click="mode = (mode === 'passwordRequest' ? 'login' : 'passwordRequest')">
                    {{mode === 'passwordRequest' ? 'Вход/Регистрация' : 'Восстановление пароля'}}
                </a>
                <input type="button" name="register_btn" id="login2_btn" 
                    v-if="mode !== 'passwordRequest'"
                    :value="mode === 'register' ? 'Вход' : 'Регистрация'" class="btn"
                    @click="mode = mode === 'register' ? 'login' : 'register'"/>
            </div>
        </div>
    </div>
   
</template>

<script>
import _ from 'underscore'

import {login as api_login} from '../api'
import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'
import capitalizeMixin from '../capitalize-mixin'

import {SET_USER_MUTATION} from '../store'

export default {
  name: 'login',
  mixins: [validationMixin, recaptchaMixin, capitalizeMixin],
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
    loginClick: _.debounce(function () {
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
