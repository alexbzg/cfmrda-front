<template>
    <div class="list">
        <h4>CFM QSO</h4>
        <p>Пожалуйста, <b>проверьте</b> указанные данные. Если всё верно, <b>отметьте</b> подтверждаемое QSO в колонке <b>CFM</b>.<br/>И <b>нажмите</b> кнопку "OK".</p>
        <table id="cfm_qso">
            <tr>
                <td class="menu rda_callsign"></td>
                <td class="menu rda">RDA</td>
                <td class="menu date">Date</td>
                <td class="menu time">GMT</td>
                <td class="menu band">MHz</td>
                <td class="menu mode">Mode</td>
                <td class="menu cfm_callsign">Callsign</td>
                <td class="menu rda_rst">Sent RST</td>
                <td class="menu my_rst">Rcvd RST</td>
                <td class="menu">CFM</td>
                <td class="menu">Reject</td>
            </tr>
            <tr :class="{cfm_checked: item.cfm, cfm_reject: item.reject}" v-for="item in qso" :key="item.id">
                <td class="rda_callsign">{{item.callsign}}</td>
                <td class="rda">{{item.rda}}</td>
                <td class="date">{{item.date}}</td>
                <td class="time">{{item.time}}</td>
                <td class="band">{{item.band}}</td>
                <td class="mode">{{item.mode}}</td>
                <td class="my_callsign">{{item.stationCallsign}}</td>
                <td class="rda_rst">{{item.sntRST}}</td>
                <td class="my_rst">{{item.rcvRST}}</td>
                <td class="cfm"><input type="checkbox" name="cfm_check" v-model="item.cfm"
                    @change="item.reject = item.cfm ? false : item.reject"></td>
                <td class="reject"><input type="checkbox" name="cfm_check" v-model="item.reject"
                    @change="item.cfm = item.reject ? false : item.cfm"></td>
            </tr>
            <tr>
                <td colspan="10" class="cfm_btn">
                    <input type="button" name="cfm_btn" id="cfm_btn" value="OK" class="btn"
                        @click="submitClick()" :disabled="pending">
                </td>
            </tr>
        </table>
        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
    </div>
</template>
<script>
import {cfmQso} from '../api'

export default {
  name: 'CfmQso',
  data () {
    return {
      qso: [],
      token: this.$route.query.token,
      pending: false,
      success: false,
      response: null
    }
  },
  mounted () {
    cfmQso({token: this.token})
      .then((data) => {
        for (const qso of data) {
          qso.cfm = false
          qso.reject = false
        }
        this.qso = data
      })
  },
  methods: {
    submitClick () {
      if (confirm('Вы действительно хотите сохранить изменения?')) {
        this.pending = true
        const request = {token: this.token,
          qso: {
            cfm: [], 
            reject: []
          }
        }
        for (const qso of this.qso) {
          for (const type in request.qso) 
            if (qso[type])
              request.qso[type].push(qso.id)
        }
        cfmQso(request)
          .then(() => {
            this.success = true
            this.response = "Данные были сохранены."
            this.qso = this.qso.filter((qso) => {
              for (const type in request.qso) {
                if (request.qso[type].find((id) => {
                  return id === qso.id
                }))
                  return false
              }
              return true
            })
          })
          .catch((e) => {
            this.success = false
            this.response = e.message
          })
          .finally(() => {
            this.pending = false
          })
      }
    }
  }
}
</script>
