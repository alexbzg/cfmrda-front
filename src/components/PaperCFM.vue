<template>
    <div id="paper_qsl">
            <h4>CFM RDA по бумажным QSL-карточкам</h4>
            <p>Заполните форму ввода данными из полученной QSL-карточки, подтверждающей QSO с необходимым вам RDA.<br/>
            После проверки модератором данные будут добавлены в  базу CFMRDA.</p>
            <p class="grey_note">Fill in the input form with data from the received QSL card confirming the QSO with the RDA you need.<br/>
            Your data will be added to CFMRDA database after the check by the moderator.</p>
        <table id="qsl_data_form">
        <tr>
            <td class="top qsl_callsign">Station's callsign</td>
            <td class="top qsl_rda">RDA</td>
            <td class="top qsl_date">Date</td>
            <td class="top qsl_time">Time</td>
            <td class="top qsl_band">MHz</td>
            <td class="top qsl_mode">Mode</td>
            <td class="top qsl_my_call" colspan="2">Your сallsign</td>
            <td class="top del"></td>
        </tr>
        <tr v-for="(qso, idx) in qsl" :key="idx">
            <td class="qsl_callsign">
                <input type="text" name="qsl_callsign" id="qsl_callsign" v-model="qso.stationCallsign"
                    v-capitalize
                    :class="{error: validationErrors.stationCallsign}"/>
            </td>
            <td class="qsl_rda">
                <rda-input type="text" name="qsl_rda" id="qsl_rda" v-model="qso.rda"
                    :class="{error: validationErrors.rda}"/>
            </td>
            <td class="qsl_date">
                <datepicker v-model="qso.date" :input-class="{error: !qso.date}" :use-utc="true">
                </datepicker>
            </td>
            <td class="qsl_time">
                <the-mask mask="##:##" type="text" name="qso_time" id="qso_time"
                    placeholder="hh:mm" v-model="qso.time"
                    :class="{error: validationErrors.time}">
                </the-mask>
            </td>
            <td class="qsl_band">
                <select-band v-model="qso.band" :class="{error: validationErrors.band}">
                </select-band>
            </td>
            <td class="qsl_mode">
                <select-mode v-model="qso.mode" :class="{error: validationErrors.mode}">
                </select-mode>
            </td>
            <td class="qsl_my_call" colspan="2">
                <input type="radio" name="qsl_callsign1" class="qsl_radio_btns" :value="false"
                    v-model="qso.manualCallsign">
                <select id="select_my_callsign" v-model="qso.callsign">
                    <option v-for="(callsign, idx) in userCallsigns" :value="callsign" :key="idx">{{callsign}}</option>
                </select>
                <input type="radio" name="qsl_callsign1" class="qsl_radio_btns" :value="true"
                    v-model="qso.manualCallsign">
                <input type="text" name="qsl_callsign" id="my_callsign" :disabled="qso.manualCallsign"
                    v-model="qso.manualCallsignValue">
            </td>
            <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
        </tr>
        <tr>
            <td colspan="9" class="add_line">Добавить ещё одну строку QSO на этой QSL - Add one more QSO line on this QSL</td>
        </tr>
        <tr>
            <td colspan="7" class="card_upload">
                Photo/scan of this QSL<br/>
                <input type="file" name="qsl_back"><br/><input type="file" name="qsl_front"></td>
            <td colspan="2" class="qsl_message">Your comment<br/><textarea name="qsl_message"></textarea></td>
        </tr>
        </table>

        <input type="button" name="save_qsl" id="save_qsl" value="Отправить QSL на проверку - Send this QSL for check" class="btn">
        <br/>

        <table id="qsl_list">
        <tr v-for="(qso, idx) in qslList" :key="idx">
            <td class="qsl_callsign">{{qso.callsign}}</td>
            <td class="qsl_rda">{{qso.rda}}</td>
            <td class="qsl_date">{{qso.date}}</td>
            <td class="qsl_time">{{qso.time}}</td>
            <td class="qsl_band">{{qso.band}}</td>
            <td class="qsl_mode">{{qso.mode}}</td>
            <td class="qsl_my_call">{{qso.callsign}}</td>
            <td class="qsl_card">
                <div class="moderator" v-if="qso.admin">{{qso.admin}}</div>
                <a href="#" @click="showImage = (showImage === qso ? null : qso)"
                    v-if="qso.state === null">
                    <img src="/images/icon_qsl.png" title="Просмотр QSL">
                </a>
                <img v-if="qso.state" src="/images/icon_qsl_cfm.png"
                    title="QSL проверена. Информация добавлена в базу CFMRDA."/>
                <img v-if="qso.state === false" src="/images/icon_qsl_not_cfm.png"
                    title="QSL не прошла проверку."/>
                <span v-if="qso.comment"><br/>{{qso.comment}}</span>
            </td>
            <td class="qsl_message">комментарий к карточке...
            </td>
            <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
        </tr>
        </table>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'
import {TheMask} from 'vue-the-mask'

import RdaInput from './RDAinput'
import SelectBand from './SelectBand'
import SelectMode from './SelectMode'

import validationMixin from '../validation-mixin'
import requireLoginMixin from '../require-login-mixin'
import latinizeMixin from '../latinize-mixin'

import {cfmQslQso} from '../api'

export default {
  mixins: [validationMixin, requireLoginMixin, latinizeMixin],
  components: {Datepicker, RdaInput, SelectBand, SelectMode, TheMask},
  name: 'PaperCFM',
  data () {
    const qso = {
      callsign: null,
      stationCallsign: null,
      band: null,
      mode: null,
      date: null,
      time: null,
      rda: null,
      image: {
        file: null,
        name: null
      }
    }
    return {
      qso: qso,
      validationData: qso,
      pending: false,
      validationSchema: 'cfmQslQso',
      qsoList: null,
      showImage: null,
      response: null
    }
  },
  computed: {
    ...mapGetters(['userToken']),
  },
  mounted () {
    this.validate()
    this.loadList()
  },
  methods: {
    post(data) {
      data.token = this.userToken
      return cfmQslQso(data)
    },
    loadList() {
      this.post({})
        .then((data) => {this.qsoList = data})
    },
    qslImageChange (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      const reader = new FileReader()
      const vm = this
      this.qso.image.name = files[0].name

      reader.onload = function (e) {
        vm.qso.image.file = e.target.result
        vm.validate()
      }
      reader.readAsDataURL(files[0])
    },
    deleteQso (idx) {
      if (confirm("Удалить строку? Do you really want to delete the line?")) {
        this.response = null
        this.success = false
        this.post({delete: idx})
          .then(() => {this.loadList()})
          .catch((e) => {this.response = e.massage})
      }
    },
    buttonClick () {
      this.pending = true
      this.response = null
      this.post({qso: this.qso})
        .then(() => {
          this.qso.stationCallsign = null
          this.qso.time = null
          this.qso.rda = null
          this.qso.image.file = null
          this.qso.image.name = null
          this.$refs.fileInput.value = ''
          this.loadList()
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

