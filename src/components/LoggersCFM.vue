<template>
    <div id="elogs_cfm">

        <h4>eLogs CFM</h4>
        <p>Укажите свой логин/пароль доступа к системе LoTW, eQSL или HAMLOG. После нажатия «OK» пройдет проверка связи с eLOG-сервером. Если всё прошло хорошо, появится значок <img src="/images/icon_connected.png" width="12">. CFMD QSO скачаются после 19:00 мск и после проверки будут добавлены к вашей статистике. Увидеть то, что пойдет зачёт, можно в разделе "Мои загрузки". В дальнейшем новые CFM QSO будут скачиваться <u>один раз в неделю</u>.<br/>Если вы хотите запустить скачивание вручную, нажмите кнопку "Обновить - Update". CFMD QSO скачаются после 19:00 мск и после проверки будут добавлены к вашей статистике во время пересчёта. </p>
        <p class="grey_note">
            Enter your login/password to access the LoTW, eQSL or HAMLOG system. After clicking “OK” the connection with the eLOG-server will be checked. If everything went well, an icon <img src="/images/icon_connected.png" width="12"> will appear. CFMD QSOs will be downloaded after 19:00 msk and after verification will be added to your statistics. In the future new CFM QSO will be downloaded <u>once a week</u>.<br/>If you want to start the download manually, click the "Обновить - Update" button. CFMD QSOs will be downloaded after 19:00 msk and after verification will be added to your statistics during recalculation.
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
                <td class="update_req top"></td>
            </tr>
            <loggers-cfm-item v-for="(account, idx) in accounts" :key="idx" :account="account"
                :loggers="loggers"
                @account-update="onAccountUpdate(idx, $event)"
                @account-request-update="onAccountRequestUpdate(account)"
                @account-delete="onAccountDelete(idx)">
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
    onAccountUpdate (idx, evtPayload) {
      const account = this.accounts[idx]
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
    onAccountDelete (idx) {
      const account = this.accounts[idx]
      if (account.pending)
        return
      if (!account.id) {
        this.removeAccount(idx)
        return
      }
      if (confirm("Вы действительно хотите удалить доступ? Do you really want to delete the account?")) {
        account.pending = true
        this.post({delete: account.id})
          .then(() => {
            this.removeAccount(idx)
          })
          .finally(() => {
            this.$set(account, 'pending', false)
          })
      }
    },
    removeAccount (idx) {
      this.accounts.splice(idx, 1)
    },
    addAccount () {
      this.accounts.push({pending: false, state: null, logger: null})
    },
    onAccountRequestUpdate (account) {
      if (account.pending)
        return
      this.post({
        update: {
          id: account.id,
          updateRequest: 1
        }
      })
        .then(() => {
          this.$set(account, 'lastUpdated', null)
          this.$set(account, 'qsoCount', null)
        })
        .finally(() => {
          this.$set(account, 'pending', false)
        })
    },

  }
}
</script>

