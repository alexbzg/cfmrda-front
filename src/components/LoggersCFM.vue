<template>
    <div id="elogs_cfm">
    
        <h4>eLogs CFM</h4>
        <p>Укажите свой логин/пароль доступа к системе LoTW или HAMLOG. После нажатия «OK» пройдет проверка связи с eLOG-сервером. Если всё прошло хорошо, появится значок <img src="/images/icon_connected.png" width="12">. CFMD QSO скачаются <u>в течение суток</u> и после проверки по нашей базе RDA будут добавлены к вашей статистике. Увидеть то, что скачалось, можно будет в разделе "Мои загрузки". В дальнейшем новые CFM QSO будут скачиваться один раз в неделю.</p>
        <p class="grey_note">
            Enter your login/password to access the LoTW or HAMLOG system. After clicking “OK” the connection with the eLOG-server will be checked. If everything went well, an icon <img src="/images/icon_connected.png" width="12"> will appear. CFMD QSO will be downloaded within 24 hours and after checking on our RDA database will be added to your statistics. In the future new CFM QSO will be downloaded once a week.
        </p>

        <table class="elog_stats">
            <tr>
                <td class="elog"></td>
                <td class="login"></td>
                <td class="ok"> </td>
                <td class="status"></td>
                <td class="del"></td>
                <td class="qso top">CFM QSO</td>
                <td class="date top">Last Check Date</td>
            </tr>
            <loggers-cfm-item v-for="(account, idx) in accounts" :key="idx" :account="account" 
                :loggers="loggers"
                @account-update="onAccountUpdate(account, $event)"
                @account-delete="onAccountDelete(account)">
            </loggers-cfm-item>
            <tr>
                <td id="add_line" colspan="7" @click="addAccount()">
                    Добавить ещё один доступ к моему электронному журналу - Add another access to my eLog
                </td>
            </tr>
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
      loggers: {},
      accounts: []
    }
  },
  mounted () {
    this.post()
      .then(data => {
        this.loggers = data.loggers
        for (const accnt of data.accounts)
          accnt.pending = false
        this.accounts = data.accounts
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
    onAccountUpdate (account, evtPayload) {
      if (account.pending)
        return
      account.loginData = evtPayload.loginData
      account.logger = evtPayload.logger
      account.state = null
      account.pending = true
      this.post({
        update: {
          id: account.id,
          logger: account.logger,
          loginData: account.loginData
        }
      })
        .then(data => {
          for (const field in data)
            this.$set(account, field, data[field])
        })
        .finally(() => {
          this.$set(account, 'pending', false)
        })
    },
    onAccountDelete (account) {
      if (account.pending)
        return
      if (!account.id) {
        this.removeAccount(account)
        return
      }
      if (confirm("Вы действительно хотите удалить доступ? Do you really want to delete the account?")) {
        account.pending = true
        this.post({delete: account.id})
          .then(() => {
            this.removeAccount(account)
          })
          .finally(() => {
            this.$set(account, 'pending', false)
          })
      }
    },
    removeAccount (account) {
      const idx = this.accounts.indexOf(account)
      this.accounts.splice(idx, 1)
    },
    addAccount () {
      this.accounts.push({pending: false, state: null, logger: null})     
    }
  }
}
</script>

