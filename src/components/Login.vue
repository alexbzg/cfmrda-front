<template>
    <div class="list list_small">
        <div id="login_register">

            <vue-recaptcha v-if="login.register"
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
            <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
            <input type="password" name="password_input" id="password_input" 
                :class="{error: validationErrors.password}"
                v-model="login.password"><br/>
            <div id="register" v-if="login.register">
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
            <input type="checkbox" name="remember_input" id="remember_input" 
                v-model="remember"> Запомнить меня<br/>
            <input type="button" name="login_btn" id="login1_btn" 
                :value="login.register ? 'Зарегистрироваться' : 'Войти'" class="btn"
                :disabled="pending || !loginValidated" @click="loginClick()"/>
            <div id="login_bottom">
                <a id="pass_recovery" href="#">Восстановить пароль</a>
                <input type="button" name="register_btn" id="login2_btn" 
                    :value="login.register ? 'Войти' : 'Зарегистрироваться'" class="btn"
                    @click='login.register = !login.register'/>
            </div>
        </div>
    </div>
   
</template>

<script>
import _ from 'underscore'

import VueRecaptcha from 'vue-recaptcha'
import VueVuelidateJsonschema from 'vue-vuelidate-jsonschema'

import {LOGIN_ACTION} from '../store'
import {RECAPTCHA_SITE_KEY} from '../consts'

export default {
  RECAPTCHA_SITE_KEY: RECAPTCHA_SITE_KEY,
  name: 'login',
  components: {VueRecaptcha},
  mixins: [VueVuelidateJsonschema.mixin],
  data () {
    return {
      login: {
        callsign: null,
        password: null,
        email: null,
        register: false,
        recaptcha: null
      },
      remember: true,
      pending: false,
      validationErrors: {}
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
      this.$store.dispatch(LOGIN_ACTION, {login: this.login, remember: this.remember})
        .then(() => this.$router.push('/upload'))
        .catch(() => { 
          if (this.login.register) {
            this.resetRecaptcha()
          }
        })
        .finally(() => { 
          this.pending = false 
        })
    },
    validateLogin() {
      const schema = this.login.register ? 'register' : 'login'
      this.$store.getters.validate(schema, this.login, this.validateCallback)
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
    }
  }
}
</script>

<style scoped>
</style>
