<template>
    <div>
        <vue-recaptcha v-if="!userToken"
            ref="recaptcha"
            @verify="onRecaptchaVerify"
            @expired="onRecaptchaExpired"
            size="invisible"
            :sitekey="$options.RECAPTCHA_SITE_KEY">
        </vue-recaptcha>

        <p>Данные QSO будут отправлены корреспонденту по email, указанному им в профиле QRZ.com.<br/>Если корреспондент подтвердит QSO с вами, то подтвержденное QSO будет добавлено в базу CFMRDA.ru.</p>
        <p>The QSO data will be sent to the correspondent by the email specified by him in the QRZ.com profile.<br/>If the correspondent will confirm QSO with you the confirmed QSO will be added to the database of CFMRDA.ru.</p>
        <table id="cfm_qso_request">
            <tr>
                <td colspan="10" class="no_border">
                    <input type="text" name="rda_callsign" id="rda_callsign" 
                        v-model="request.email" :class="{error: validationErrors.email}"/>
                </td>
            </tr>
            <tr>
                <td colspan="10" class="rda_callsign_note">Ваш email - Your email</td>
            </tr>
            <tr>
                <td class="menu rda_callsign">Station callsign</td>
                <td class="menu rda">RDA</td>
                <td class="menu date">Date</td>
                <td class="menu time">GMT</td>
                <td class="menu band">MHz</td>
                <td class="menu mode">Mode</td>
                <td class="menu my_callsign">Your callsign</td>
                <td class="menu rda_rst">Snt RST</td>
                <td class="menu my_rst">Rcv RST</td>
                <td class="menu del"></td>
            </tr>
            <tr v-for="(qso, idx) in request.qso" :key="idx">
                <td class="rda_callsign">
                    <input type="text" name="qso_rda_callsign" id="qso_rda_callsign"
                        v-model="qso.callsign" 
                        :class="{error:validationErrors['qso.' + idx + '.callsign']}">
                </td>
                <td class="rda">
                    <input type="text" name="qso_cfm_rda" id="qso_cfm_rda" v-model="qso.rda"
                        :class="{error:validationErrors['qso.' + idx + '.rda']}">
                </td>
                <td class="date">
                    <datepicker v-model="qso.date"></datepicker>
                </td>
                <td class="time">
                    <input type="text" name="qso_time" id="qso_time" v-model="qso.time">
                </td>
                <td class="band">
                    <select v-model="qso.band" :class="{error: !qso.band}">
                        <option v-for="(band, idx) in $options.BANDS" :key="idx">{{band}}</option>
                    </select>
                </td>
                <td class="mode">
                    <select v-model="qso.mode" :class="{error: !qso.mode}">
                        <option v-for="(mode, idx) in $options.MODES" :key="idx">{{mode}}</option>
                    </select>
                </td>
                <td class="my_callsign">
                    <input type="text" name="qso_my_callsign" id="qso_my_callsign"
                        v-model="qso.stationCallsign" 
                        :class="{error: validationErrors['qso.' + idx + '.stationCallsign']}">
                </td>
                <td class="rda_rst">
                    <input type="text" name="qso_dx_rst" id="qso_dx_rst"
                        v-model="qso.sentRST">
                </td>
                <td class="my_rst">
                    <input type="text" name="qso_my_rst" id="qso_my_rst"
                        v-model="qso.recRST">
                </td>
                <td class="del">
                    <img src="images/icon_delete.png" title="Удалить эту строку - Delete this line"
                        @click="deleteQso(idx)">
                </td>
            </tr>
            <tr>
                <td colspan="10" class="add_line" @click="addQso()">
                    Добавить ещё одну строку - Add one more line
                </td>
            </tr>
            <tr>
                <td colspan="10" class="send_btn">
                    <input type="button" name="send_btn" id="send_btn" 
                        value="Отправить запрос DX1DX на подтверждение QSO - 
                            Send the request to DX1DX for CFM QSO"
                        class="btn" :disabled="pending || !validated" 
                        @click="sendClick()">
                </td>
            </tr>
                
        </table>
       
        <div v-if="response" id="message" v-html="response"></div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'

import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'

import {orderedBands, MODES} from '../ham-radio'
import storeEmail from '../store-email'
import {cfmRequestQso} from '../api'

export default {
  BANDS: orderedBands(),
  MODES: MODES,
  mixins: [validationMixin, recaptchaMixin],
  components: {Datepicker},
  name: 'PaperCFM',
  data () {
    const request = {
      email: storeEmail.load(),
      correspondent: null,
      token: this.userToken,
      qso: []
    }
    return {
      request: request,
      validationData: request,
      pending: false,
      validationSchema: 'cfmRequestQso',
      response: null
    }
  },
  computed: {
    ...mapGetters(['userToken']),
  },
  mounted () {
    this.validate()
  },
  methods: {

    sendClick () {
      this.pending = true
      if (this.request.email) {
        storeEmail.save(this.request.email)
      }
      
      cfmRequestQso(this.qso)
        .then(() => {
          this.response = 'Ваше запрос был отправлен. Your request was sent.'
          this.request.qso = []
        })
        .catch((e) => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

