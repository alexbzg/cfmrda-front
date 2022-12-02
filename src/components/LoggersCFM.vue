<template>
    <div id="elogs_cfm">

        <h4>eLogs CFM</h4>
        <p>Укажите свой логин/пароль доступа к системе LoTW, eQSL или HAMLOG. После нажатия «OK» пройдет проверка связи с eLOG-сервером. Если всё прошло хорошо, появится значок <img src="/images/icon_connected.png" width="12">. CFMD QSO скачаются c 5:00мск до 22:00мск и будут добавлены к вашей статистике при ночном пересчёте. Увидеть то, что пойдет зачёт, можно в разделе "Мои загрузки".<br/>Штатное скачивание из eLog'ов происходит раз в неделю. Данные из eLog'ов для аккаунтов, для которых подошла дата скачивания, будут скачиваться с 5:00мск до 22:00мск.<br/>Если в это время нажать кнопки "Обновить - Update", то ваш аккаунт будет добавлен в текущую очередь скачивания. В ближайшее время после нажатия данные ваших аккаунтов скачаются. Если нажать в другое время, то скачивание начнётся в следующий (завтрашний) период. </p>
        <p class="grey_note">
            Enter your login/password to access the LoTW, eQSL or HAMLOG system. After clicking “OK” the connection with the eLOG-server will be checked. If everything went well, an icon <img src="/images/icon_connected.png" width="12"> will appear. CFMD QSOs will be downloaded from 5:00msk to 22:00msk and will be added to your statistics.<br/>The standard downloading from eLogs occurs once a week. Data from the eLogs for accounts for which the download date came up will be downloaded from 5:00msk to 22:00msk.<br/>If at this time you click the "Обновить - Update" button, then your account will be added to the current download queue. In the near future after clicking the data of your accounts will be downloaded. If you click at another time, the download will start in the next (tomorrow) period.
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

