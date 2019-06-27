<template>
    <div id="elogs_cfm">
    
        <h4>LoTW CFM</h4>
            <p>Укажите свой логин/пароль доступа к системе LoTW.<br/>После нажатия «OK» пройдет проверка связи с сервером LoTW. Если всё прошло хорошо, появится значок <img src="/images/icon_connected.png" width="12">.<br/>CFMD QSO скачаются <u>в течение суток</u> и после проверки по нашей базе RDA будут добавлены к вашей статистике.<br/>Увидеть то, что скачалось, можно будет в разделе "Мои загрузки".<br/>В дальнейшем новые CFMD QSO будут скачиваться из LoTW один раз в месяц.</p>
            <p class="grey_note">Enter your login/password to access the LoTW system. The connection with the LoTW server will be checked after clicking «OK». If everything went well the <img src="/images/icon_connected.png"  width="12"><br/>icon will appear. The confirmed QSOs will be downloaded to CFMRDA within 24 hours and after checking with our RDA database will be added to your statistics.<br/>New CFMD QSOs will be downloaded from LoTW once a month.</p>

        <table class="elog_stats">
            <tr>
                <td class="elog"></td>
                <td class="login">Login</td>
                <td class="pass">Password</td>
                <td class="ok"> </td>
                <td class="status"></td>
                    <td class="qso top">CFM QSO</td>
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
        for (const logger of data)
          logger.pending = false
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
      if (logger.pending)
        return
      logger.loginData = loginData
      logger.state = null
      logger.pending = true
      this.post({
        update: {
          logger: logger.logger,
          loginData: loginData
        }
      })
        .then(data => {
          this.$set(logger, 'state', data)
        })
        .finally(() => {
          this.$set(logger, 'pending', false)
        })
    }
  }
}
</script>

