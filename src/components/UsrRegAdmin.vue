<template>
    <div id="usr_reg">

        Позывной <input type="text" id="callsign" v-model.trim="callsign" v-capitalize><br/>
        Пароль <input type="text" id="password" v-model.trim="password"><br/>
        Email <input type="text" id="email" v-model.trim="email">
        <span v-if="email_confirmed !== null"> ({{email_confirmed ? "Подтвержден" : "Не подтвержден"}})</span><br/>

        <input type="submit" class="btn" value="Отправить" @click="post()" :disabled="pending || !callsign"/>
    </div>
</template>
<script>
import {mapGetters} from 'vuex'

import {dataPost} from '../api'

export default {
  name: 'UsrRegAdmin',
  data () {
    return {
      callsign: null,
      password: null,
      email: null,
      email_confirmed: null,
      pending: false
    }
  },
  methods: {
    post() {
      this.pending = true
      const data = {
        callsign: this.callsign,
        email: this.email,
        password: this.password,
        token: this.$store.getters.userToken
      }
      const update_req = this.password && this.email
      dataPost('usr_reg_admin', data)
        .then(rsp_data => {
          if (update_req) {
            alert(rsp_data)
            this.callsign = null
            this.password = null
            this.email = null
            this.email_confirmed = null
          } else {
            if (rsp_data) {
              alert('Позывной уже есть в базе')
              this.password = rsp_data.password
              this.email = rsp_data.email
              this.email_confirmed = rsp_data.email_confirmed
            } else {
              alert('Позывной не зарегистрирован')
              this.email_confirmed = false
            }
          }
        })
        .catch(err => {
          alert(err.message)
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    ...mapGetters(['userToken'])
  }
}
</script>
