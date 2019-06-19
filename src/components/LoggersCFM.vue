<template>
    <div id="elogs_cfm">
    
        <h4>LoTW/eQSL CFM</h4>
            <p>Укажите свой логин/пароль доступа к системам LoTW и eQSL.<br/>После проверки по нашей базе RDA подтвержденные QSO будут добавлены к вашей статистике CFMRDA.</p>
            <p class="grey_note">Enter your login/password for LoTW and eQSL systems.<br/>Verified QSOs will be added to your CFMRDA statistics аfter checking with our RDA database.</p>

        <table class="elog_stats">
            <tr>
                <td class="elog"></td>
                <td class="login">Login</td>
                <td class="pass">Password</td>
                <td class="ok"> </td>
                <td class="status"></td>
                    <td class="qso top">CFMD QSO</td>
                <td class="date top">Last Check Date</td>
            </tr>
            <loggers-cfm-item v-for="(logger, idx) in loggers" :key="idx" :logger="logger" 
                @logger-update="loggerUpdate(logger, $event)">
            </loggers-cfm-item>
        </table>


    </div>

</template>

<script>
import {mapGetters} from 'vuex'

import {loggersPost} from '../api'

import LoggersCfmItem from './LoggersCfmItem'

export default {
  components: {LoggersCfmItem},
  name: 'LoggersCfm',
  data () {
    return { 
      loggers: []
    }
  },
  mounted () {
    this.post()
      .then(data => {
        this.loggers = data
      })
  },
  computed: {
    ...mapGetters(['userToken']),
  },
  methods: {
    post (data) {
      if (!data)
        data = {}
      data.token = this.userToken
      return loggersPost(data)
    },
    loggerUpdate (logger, loginData) {
      logger.loginData = loginData
      this.post({
        update: {
          logger: logger.logger,
          loginData: loginData
        }
      })
        .then(data => {
          this.$set(logger, 'state', data)
        })
    }
  }
}
</script>

