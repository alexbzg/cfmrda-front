<template>
    <div>
        <h4>CFM RDA по email запросу</h4>
        <p>Данные QSO будут отправлены RDA корреспонденту по email, указанному в его профиле QRZ.com.<br/>Если корреспондент подтвердит QSO с вами, то подтвержденное QSO будет добавлено в базу CFMRDA.ru.</p>
        <p class="grey_note">The QSO data will be sent to the RDA correspondent by the email specified by him in the QRZ.com profile.<br/>If the correspondent will confirm QSO with you the confirmed QSO will be added to the database of CFMRDA.ru.</p>
        <table id="cfm_qso_request">
            <tr>
                <td class="menu rda_callsign">RDA's callsign</td>
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
                    <datepicker v-model="qso.date" :input-class="{error: !qso.date}" :use-utc="true">
                    </datepicker>
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
                    <div id="recap">
                        <vue-recaptcha v-if="!userToken"
                            ref="recaptcha"
                            @verify="onRecaptchaVerify"
                            @expired="onRecaptchaExpired"
                            :sitekey="$options.RECAPTCHA_SITE_KEY">
                        </vue-recaptcha>
                    </div>
                    <input type="button" name="send_btn" id="send_btn" 
                        value="Отправить запрос на подтверждение QSO - Send CFM QSO request"
                        class="btn" :disabled="pending" 
                        @click="sendClick()">
                </td>
            </tr>
                
        </table>
       
        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
        <div v-if="errors" id="message_errors">
            <div v-for="(item, idx) in errors" :key="idx" class="qso_data_unit">
              <div class="qso_data">{{item.qso.stationCallsign}} {{item.qso.rda}} {{item.qso.band}} {{item.qso.mode}}</div>
              <div class="qso_error">{{item.error}}</div>
            </div>
        </div>

        <template v-if="prevRequests">
            <div id="cfm_email_list_text">
                Удаление строки происходит только из списка отправленных Email CFM запросов и не виляет на вашу статистику CFM RDA.
            </div>
            <table id="cfm_email_list">
                <tr>
                    <td class="top status">Status</td>
                    <td class="top status_date">Status date</td>
                    <td class="top rda">RDA</td>
                    <td class="top rda_callsign">Station's callsign</td>
                    <td class="top date">Date</td>
                    <td class="top time">GMT</td>
                    <td class="top band">MHz</td>
                    <td class="top mode">Mode</td>
                    <td class="top my_callsign">Your callsign</td>
                    <td class="top del"></td>
                </tr>
                <template v-for="(qso, idx) in prevRequests">
                    <tr :class="{cfmd: qso.state === true, not_cfmd: qso.state === false}" 
                        :key="'qso_' + idx">
                        <td class="status" :rowspan="qso.comment ? 2 : 1">
                            <img v-if="qso.icon" 
                                :src="'/images/icon_email_' + qso.icon + '.png'" :title="qso.iconTitle">
                        </td>
                        <td class="status_date">{{qso.statusDate}}</td>
                        <td class="rda">{{qso.rda}}</td>
                        <td class="rda_callsign">{{qso.stationCallsign}}</td>
                        <td class="date">{{qso.date}}</td>
                        <td class="time">{{qso.time}}</td>
                        <td class="band">{{qso.band}}</td>
                        <td class="mode">{{qso.mode}}</td>
                        <td class="my_callsign">{{qso.callsign}}</td>
                        <td class="del" :rowspan="qso.comment ? 2 : 1">
                            <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"
                            @click="deletePrevRequest(qso)">
                        </td>
                    </tr>  
                    <tr :class="{cfmd: qso.state === true, not_cfmd: qso.state === false}" 
                        :key="'comment_' + idx" v-if="qso.comment">
                        <td class="status_comm" colspan="8">
                            <b>Comment:</b> {{qso.comment}}
                        </td>
                    </tr>
                </template>
            </table>
        </template>

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'
import {TheMask} from 'vue-the-mask'

import validationMixin from '../validation-mixin'
import recaptchaMixin from '../recaptcha-mixin'
import requireLoginMixin from '../require-login-mixin'
import latinizeMixin from '../latinize-mixin'

import RdaInput from './RDAinput'

import {orderedBands, MODES, stripCallsign} from '../ham-radio'
import storeEmail from '../store-email'
import {cfmRequestQso, getCorrespondentEmail} from '../api'
import {isEmpty} from '../utils'

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
  mixins: [validationMixin, recaptchaMixin, requireLoginMixin, latinizeMixin],
  components: {Datepicker, RdaInput, TheMask},
  name: 'EmailCFM',
  data () {
    const request = {
      qso: [{}],
      token: this.$store.getters.userToken
    }
    return {
      request: request,
      errors: [],
      validationData: request,
      pending: false,
      validationSchema: 'cfmRequestQso',
      response: null,
      success: false,
      prevRequests: null
    }
  },
  computed: {
    ...mapGetters(['userToken']),
  },
  mounted () {
    this.validate()
    this.loadPrevRequests()
  },
  methods: {
    sendClick () {
      if (this.request.qso.length > 1)
        this.request.qso = this.request.qso.filter((item) => {
          return !isEmpty(item)
        })

      this.$nextTick(() => {

        if (this.validated) {

          this.response = null
          this.success = false
      
          this.pending = true
          if (this.request.email) {
            storeEmail.save(this.request.email)
          }
      
          cfmRequestQso(this.request)
            .then((errors) => {
              if (this.request.qso.length > errors.length) {
                this.response = "Ваш запрос будет отправлен корреспондентам в течение суток.<br/>" + 
                    "Your request will be sent to correspondents in 24 hours."
                this.request.qso = [{}]
                this.success = true
                this.loadPrevRequests()
              }
              this.errors = errors
            })
            .catch((e) => {
              this.response = e.message
              this.success = false
            })
            .finally(() => {
              this.pending = false
            })
        } else if (this.request.qso.length === 0)
          this.request.qso = [{}]
      })
    },
    deleteQso (idx) {
      if (confirm("Удалить строку? Do you really want to delete the line?"))
        this.request.qso.splice(idx, 1)
    },
    loadPrevRequests () {
      if (this.userToken)
        cfmRequestQso({token: this.userToken})
          .then((data) => {
            data.map(item => {
              if (item.blacklist)
                item.state = false
              if (item.state) {
                item.icon = 'ok'
                item.iconTitle = 'RDA подтверждён - CFMD RDA'
              } 
              else if (item.state === false) {
                if (item.blacklist) {
                  item.icon = 'bad'
                  item.iconTitle = 'Письмо не доставлено - Email could not be delivered'
                } else {
                  item.icon = 'no'
                  item.iconTitle = 'Подтверждение RDA отклонено - CFM RDA is rejected'
                }
              } else if (item.viewed) {
                item.icon = 'opened'
                item.iconTitle = 'CFMRDA email получен и просмотрен - CFMRDA Email was received'
              } else if (item.sent) {
                item.icon = 'sent'
                item.iconTitle = 'CFMRDA Email отправлен - CFMRDA Email was sent'
              } else {
                item.icon = 'wait'
                item.iconTitle = 'CFMRDA Email ожидает отправки - CFMRDA Email is waiting to be delivered'
              }
            })
            this.prevRequests = data
          })
    },
    deletePrevRequest (qso) {
      if (confirm('Удалить запрос? Do you really want to delete the request?')) {
        cfmRequestQso({token: this.userToken, delete: qso.id})
          .then(() => this.loadPrevRequests())
      }
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

