<template>
    <div>
        <vue-recaptcha v-if="!userToken"
            ref="recaptcha"
            @verify="onRecaptchaVerify"
            @expired="onRecaptchaExpired"
            size="invisible"
            :sitekey="$options.RECAPTCHA_SITE_KEY">
        </vue-recaptcha>

        <p>Данные QSO будут отправлены корреспонденту по email, указанному в его профиле QRZ.com.<br/>Если корреспондент подтвердит QSO с вами, то подтвержденное QSO будет добавлено в базу CFMRDA.ru.</p>
        <p class="grey_note">The QSO data will be sent to the correspondent by the email specified by him in the QRZ.com profile.<br/>If the correspondent will confirm QSO with you the confirmed QSO will be added to the database of CFMRDA.ru.</p>
        <table id="cfm_qso_request">
            <tr v-if="!userToken">
                <td colspan="10" class="no_border email">
                    <input type="text" name="email" id="email" 
                        v-model="request.email" :class="{error: validationErrors.email}"/>
                </td>
            </tr>
            <tr v-if="!userToken">
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
                        v-model="qso.stationCallsign" v-capitalize
                        @change="checkCorrespondent(qso)"
                        :class="{error:validationErrors['qso.' + idx + '.stationCallsign'] || 
                        validationErrors['qso.' + idx + '.email']}"/>
                    <img v-if="qso.correspondentError" 
                         :src="'/images/icon_' + qso.correspondentError.icon + '.png'"
                         :title="qso.correspondentError.message"/>
                </td>
                <td class="rda">
                    <rda-input type="text" name="qso_cfm_rda" id="qso_cfm_rda" v-model="qso.rda"
                        :class="{error:validationErrors['qso.' + idx + '.rda']}">
                    </rda-input>
                </td>
                <td class="date">
                    <datepicker v-model="qso.date" :input-class="{error: !qso.date}"></datepicker>
                </td>
                <td class="time">
                    <the-mask mask="##:##" type="text" name="qso_time" id="qso_time" 
                        placeholder="hh:mm" v-model="qso.time" 
                        :class="{error: validationErrors['qso.' + idx + '.time']}">
                    </the-mask>
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
                        v-model="qso.callsign" v-capitalize  
                        :class="{error: validationErrors['qso.' + idx + '.callsign']}">
                </td>
                <td class="rda_rst">
                    <input type="text" name="qso_dx_rst" id="qso_dx_rst"
                        v-model="qso.sentRST" 
                        :class="{error: validationErrors['qso.' + idx + '.sentRST']}">
                </td>
                <td class="my_rst">
                    <input type="text" name="qso_my_rst" id="qso_my_rst"
                        v-model="qso.recRST"
                        :class="{error: validationErrors['qso.' + idx + '.recRST']}">
                </td>
                <td class="del">
                    <img src="images/icon_delete.png" title="Удалить эту строку - Delete this line"
                        @click="deleteQso(idx)">
                </td>
            </tr>
            <tr>
                <td colspan="10" class="add_line" @click="request.qso.push({})">
                    Добавить ещё одну строку - Add one more line
                </td>
            </tr>
            <tr>
                <td colspan="10" class="send_btn">
                    <input type="button" name="send_btn" id="send_btn" 
                        value="Отправить запрос на подтверждение QSO - 
                            Send CFM QSO request"
                        class="btn" :disabled="pending || !validated" 
                        @click="sendClick()">
                </td>
            </tr>
                
        </table>
       
        <div v-if="response" id="message" :class="{succes: success}" v-html="response"></div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'
import {TheMask} from 'vue-the-mask'

import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'

import RdaInput from './RDAinput'

import {orderedBands, MODES, stripCallsign} from '../ham-radio'
import storeEmail from '../store-email'
import {cfmRequestQso, getCorrespondentEmail} from '../api'

const CORRESPONDENT_ERRORS = {
  blacklist: {
    message: 'Correspondent had disabled email CFM.',
    icon: 'blacklist'
  },
  'not found': {
    message: 'Correspondent\'s callsign or email is not registered on qrz.com',
    icon: 'warning'
  }
}

export default {
  BANDS: orderedBands(),
  MODES: MODES,
  mixins: [validationMixin, recaptchaMixin],
  components: {Datepicker, RdaInput, TheMask},
  name: 'EmailCFM',
  data () {
    const token = this.$store.getters.userToken
    const request = {
      qso: [{}]
    }
    if (token)
      request.token = token
    else {
      request.recaptcha = null
      request.email = storeEmail.load()
    }
    return {
      request: request,
      validationData: request,
      pending: false,
      validationSchema: 'cfmRequestQso',
      response: null,
      success: false
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
      
      cfmRequestQso(this.request)
        .then(() => {
          this.response = "Ваш запрос будет отправлен корреспондентам в течение суток.<br/>" + 
              "Your request will be sent to correspondents in 24 hours."
          this.request.qso = []
          this.success = true
        })
        .catch((e) => {
          this.requestError = e.message
          this.success = false
        })
        .finally(() => {
          this.pending = false
        })
    },
    deleteQso (idx) {
      if (confirm("Удалить строку? Do you really want to delete the line?"))
        this.request.qso.splice(idx, 1)
    },
    checkCorrespondent (qso) {
      qso.correspondent = stripCallsign(qso.stationCallsign)
      if (qso.correspondent) {
        const sameCallsignQso = this.request.qso.find((item) => {
          return item !== qso && item.correspondent === qso.correspondent && 
            (item.email || item.correspondentError)
        })
        if (sameCallsignQso) {
          this.$set(qso, 'email', sameCallsignQso.email)
          this.$set(qso, 'correspondentError', sameCallsignQso.correspondentError)
        } else {
          getCorrespondentEmail(qso.correspondent)
            .then((data) => {
              this.$set(qso, 'email', data.email)
              this.$set(qso, 'correspondentError', data.email ? null : CORRESPONDENT_ERRORS[data.reason])
            })
        }
      }
    }
  }
}
</script>

