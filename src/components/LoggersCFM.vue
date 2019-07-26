<template>
    <div id="elogs_cfm">
    
        <h4>eLogs CFM</h4>
        <p>
            Укажите свой логин/пароль доступа к системам LoTW и eQSL.<br/>
            После проверки по нашей базе RDA подтвержденные QSO будут добавлены к вашей статистике CFMRDA.
        </p>
        <p class="grey_note">
            Enter your login/password for LoTW and eQSL systems.<br/>
            Verified QSOs will be added to your CFMRDA statistics аfter checking with our RDA database.
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
            <loggers-cfm-item v-for="(account, idx) in accounts" :key="idx" :account="logger" 
                :loggers="loggers"
                @account-update="onAccountUpdate(logger, $event)"
                @account-delete="onAccountDelete(logger)">
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
    onAccountUpdate (account, logger, loginData) {
      if (logger.pending)
        return
      account.loginData = loginData
      account.logger = logger
      account.state = null
      account.pending = true
      this.post({
        update: {
          id: account.id,
          logger: logger,
          loginData: loginData
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
          .catch(() => {
            this.$set(account, 'pending', false)
          })
      }
    },
    removeAccount (account) {
      const idx = this.accounts.indexOf(account)
      this.accounts.splice(idx, 1)
    }
  }
}
</script>

