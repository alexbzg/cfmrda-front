<template>
    <div class="list list_small">
        <div id="login_register">
            <b>Позывной</b><br/>
            <input type="text" name="callsign_input" id="callsign_input" v-model.trim="login.callsign" 
                @change="callsignChange()"/>
            <br/>
            <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
            <input type="password" name="password_input" id="password_input" v-model="login.password"><br/>
            <div id="register" v-if="login.register">
                <b>Email</b><br/>
                <span class="note_red">
                    Email должен быть <b>обязательно</b> тем, с которым вы зарегистрированы на 
                    <b>QRZ.com</b>!<br/>
                    На этот email будет отправлено письмо с ссылкой.
                    Кликните по ней для завершения регистрации.
                </span><br/>
                <input type="text" name="email_input" id="email_input" v-model.trim="login.emai"><br/>
            </div>
            <input type="checkbox" name="remember_input" id="remember_input" 
                v-model="remember"> Запомнить меня<br/>
            <input type="button" name="login_btn" id="login1_btn" 
                :value="login.register ? 'Зарегистрироваться' : 'Войти'" class="btn"
                @click="loginClick()"/>
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
// import api from '../api'
import {LOGIN_ACTION} from '../store'

export default {
  name: 'login',
  data () {
    return {
      login: {
        callsign: null,
        password: null,
        email: null,
        register: null,
        recaptcha: null
      },
      remember: true  
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters.userCallsign) {
        vm.$router.push( '/upload' )
      }
    })
  },
  methods: {
    loginClick () {
      this.$store.dispatch(LOGIN_ACTION, {login: this.login, remember: this.remember})
        .then(() => this.$router.push('/upload'))
    },
    callsignChange () {
      if (this.login.callsign !== this.login.callsign.toUpperCase()) {
        this.login.callsign = this.login.callsign.toUpperCase()
      }
    }
  }
}
</script>

