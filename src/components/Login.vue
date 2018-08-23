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

            <b>Позывной</b><br/>
            <input type="text" name="callsign_input" id="callsign_input" v-model.trim="login.callsign" 
                :class="{error: validationErrors.callsign}"
                @change="callsignChange()"/>
            <br/>
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
            <template v-if="mode == 'login' || mode == 'register'">
                <input type="checkbox" name="remember_input" id="remember_input" 
                    v-model="remember"> Запомнить меня<br/>
            </template>
            <input type="button" name="login_btn" id="login1_btn" 
                value="Отправить" class="btn"
                :disabled="pending || !loginValidated" @click="loginClick()"/>
            <div v-if="message" id="message" v-html="message"></div>
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

import VueRecaptcha from 'vue-recaptcha'
import VueVuelidateJsonschema from 'vue-vuelidate-jsonschema'

import {login as api_login} from '../api'

import {SET_USER_MUTATION} from '../store'
import {RECAPTCHA_SITE_KEY} from '../consts'

export default {
  RECAPTCHA_SITE_KEY: RECAPTCHA_SITE_KEY,
  name: 'login',
  components: {VueRecaptcha},
  mixins: [VueVuelidateJsonschema.mixin],
  data () {
    const login = {
        callsign: null,
        password: null,
        email: null,
        token: this.$route.query.token,
        recaptcha: null
    }
    const mode = login.token ? 'passwordChange' : 'login'    
    return {
      login: login,
      remember: true,
      pending: false,
      mode: mode,
      validationErrors: {},
      message: null
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters.userCallsign) {
        vm.$router.push( '/upload' )
      }
    })
  },
  mounted () {
    this.$nextTick(function () {
      this.validateLogin()
    })
  },
  methods: {
    doLogin() {
      this.pending = true
      this.message = null
      const data = {...this.login, mode: this.mode}

      api_login(data)
        .then((user) => {
          if (this.mode === 'login') {
            this.$store.commit(SET_USER_MUTATION, {user: user, remember: this.remember})
          } else if (this.mode === 'passwordRequest') {
            this.message = 'На ваш адрес электронной почты было отправлено письмо с инструкциями.'
          } else if (this.mode === 'passwordChange') {
              this.message = 'Ваш пароль был изменен.'
          } else if (this.mode === 'register') {
              this.message = 'Для завершения регистрации необходимо подтвердиь адрес элетронной почты. Вам было отправлeно письмо с инструкциями.'
          }
        })
        .catch((e) => { 
          if (this.mode === 'register' || this.mode === 'passwordRequest') {
            this.resetRecaptcha()
          }
          if (e.status === 400) {
            this.message = e.message
          }
        })
        .finally(() => { 
          this.pending = false 
        })
    },
    validateLogin() {
      this.$store.getters.validate(this.mode, this.login, this.validateCallback)
    },
    validateCallback (valid, errors) {
      this.$set(this, 'validationErrors', {})
      if (!valid) {
        for (const item of errors) {
          this.$set(this.validationErrors, item.dataPath.substr(1), item.message)
        }
        if (this.validationErrors.recaptcha) {
          this.$refs.recaptcha.execute()
        }
      }
    },
    resetRecaptcha () {
      this.$set(this.login, 'recaptcha', null)
      this.$refs.recaptcha.reset()
    },
    loginClick: _.debounce(function () {
      this.doLogin()
    }, 300, true),
    callsignChange () {
      if (this.login.callsign !== this.login.callsign.toUpperCase()) {
        this.login.callsign = this.login.callsign.toUpperCase()
      }
    },
    onRecaptchaVerify (response) {
      this.$set(this.login, 'recaptcha', response)
    },
    onRecaptchaExpired () {
      this.login.recaptcha = null
    }
  },
  computed: {
    loginValidated() {
      return _.isEmpty(this.validationErrors)
    }
  },
  watch: {
    login: {
      handler: function () { this.validateLogin() },
      deep: true
    },
    mode: {
      handler: function () {
        const vm = this
        vm.$nextTick(function () {
          vm.validateLogin()
        })
      }
    }
  }
}
</script>

<style scoped>
</style>
