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
        <tr v-for="(qso, idx) in qsl.qso" :key="idx">
            <td class="qsl_callsign">
                <input type="text" name="qsl_callsign" id="qsl_callsign" v-model="qso.stationCallsign"
                    v-capitalize
                    :class="{error: validationErrors['qso.' + idx + '.stationCallsign']}"/>
            </td>
            <td class="qsl_rda">
                <rda-input type="text" name="qsl_rda" id="qsl_rda" v-model="qso.rda"
                    :class="{error: validationErrors['qso.' + idx + '.rda']}"/>
            </td>
            <td class="qsl_date">
                <datepicker v-model="qso.date" :input-class="{error: !qso.date}" :use-utc="true">
                </datepicker>
            </td>
            <td class="qsl_time">
                <the-mask mask="##:##" type="text" name="qso_time" id="qso_time"
                    placeholder="hh:mm" v-model="qso.time"
                    :class="{error: validationErrors['qso.' + idx + '.time']}">
                </the-mask>
            </td>
            <td class="qsl_band">
                <select-band v-model="qso.band" :class="{error: validationErrors['qso.' + idx + '.band']}">
                </select-band>
            </td>
            <td class="qsl_mode">
                <select-mode v-model="qso.mode" :class="{error: validationErrors['qso.' + idx + '.mode']}">
                </select-mode>
            </td>
            <td class="qsl_my_call" colspan="2">
                <input type="radio" :name="'qsl_callsign_rb_' + idx" class="qsl_radio_btns" :value="false"
                    v-model="qso.manualCallsign" @input="setQsoCallsign(qso)">
                <select id="select_my_callsign" v-model="qso.listCallsign" :disabled="qso.manualCallsign"
                     @input="setQsoCallsign(qso)" 
                     :class="{error: !qso.manualCallsign && validationErrors['qso.' + idx + '.callsign']}">
                    <option v-for="(callsign, idx) in userCallsigns" :value="callsign" :key="idx">{{callsign}}</option>
                </select>
                <input type="radio" :name="'qsl_callsign_rb_' + idx" class="qsl_radio_btns" :value="true"
                    v-model="qso.manualCallsign" @input="setQsoCallsign(qso)">
                <input type="text" name="qsl_callsign" id="my_callsign" :disabled="!qso.manualCallsign"
                    v-capitalize @input="setQsoCallsign(qso)"
                    :class="{error: qso.manualCallsign && validationErrors['qso.' + idx + '.callsign']}"
                    v-model="qso.manualCallsignValue">
            </td>
            <td class="del" @click="deleteQso(idx)">
                <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line">
            </td>
        </tr>
        <tr>
            <td colspan="9" class="add_line" @click="addQso">
                Добавить ещё одну строку QSO на этой QSL - Add one more QSO line on this QSL
            </td>
        </tr>
        <tr>
            <td colspan="7" class="card_upload">
                Photo/scan of this QSL<br/>
                <span v-for="imgType in ['image', 'imageBack']" :key="imgType">
                    <input type="file" :name="imgType"
                        :ref="'fileInput' + imgType"
                        :class="{error: validationErrors[imgType + '.name']}"
                        @change="qslImageChange(imgType, $event)"
                    ><br/>
                </span>
            </td>
            <td colspan="2" class="qsl_message">Your comment<br/><textarea name="qsl_message"></textarea></td>
        </tr>
        </table>

        <input type="button" name="save_qsl" id="save_qsl" value="Отправить QSL на проверку - Send this QSL for check" class="btn"
            :disabled="pending || !validated" @click="buttonClick">
        <br/>

        <table id="qsl_list" v-if="qslList">
            <tbody v-for="(qso, idx) in qslList" :key="idx">
                <tr>
                    <td class="qsl_callsign">{{qso.callsign}}</td>
                    <td class="qsl_rda">{{qso.rda}}</td>
                    <td class="qsl_date">{{qso.date}}</td>
                    <td class="qsl_time">{{qso.time}}</td>
                    <td class="qsl_band">{{qso.band}}</td>
                    <td class="qsl_mode">{{qso.mode}}</td>
                    <td class="qsl_my_call">{{qso.callsign}}</td>
                    <td class="qsl_card">
                        <div class="moderator" v-if="qso.admin">{{qso.admin}}</div>
                        <a href="#" v-for="imgType in ['image', 'imageBack']"
                            @click="showImage(qso, imgType)" :key="imgType"
                            v-if="qso.state === null && qso[imgType]">
                            <img src="/images/icon_qsl.png" title="Просмотр QSL">
                        </a>
                        <img v-if="qso.state" src="/images/icon_qsl_cfm.png"
                            title="QSL проверена. Информация добавлена в базу CFMRDA."/>
                        <img v-if="qso.state === false" src="/images/icon_qsl_not_cfm.png"
                            title="QSL не прошла проверку."/>
                        <span v-if="qso.comment"><br/>{{qso.comment}}</span>
                    </td>
                    <td class="qsl_message">
                    </td>
                    <td class="del" @click="deleteQsl(qso.id)">
                        <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line">
                    </td>
                </tr>
                <tr v-if="activeImage.qso === qso">
                    <td colspan="10" class="qsl_image">
                        <img :src="activeImage.src" @click="showImage(null)"/>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

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
    const qsl = {
      qso: [this.newQso()],
      image: {
        file: null,
        name: null
      }
    }
    return {
      qsl: qsl,
      validationData: qsl,
      pending: false,
      validationSchema: 'cfmQslQso',
      qslList: null,
      activeImage: {
        qso: null,
        src: null
      },
      response: null
    }
  },
  computed: {
    ...mapGetters(['userToken']),
    ...mapState(['user']),
    userCallsigns () {
      return [this.user.callsign].concat(this.user.oldCallsigns.confirmed)
    }
  },
  mounted () {
    this.validate()
    this.loadList()
  },
  methods: {
    showImage(qso, imgType) {
      this.activeImage.qso = qso
      if (qso) {
        this.activeImage.src = `/qsl_images/${qso.qslId}_${imgType}_${qso[imgType]}`
      }
    },
    post(data) {
      data.token = this.userToken
      return cfmQslQso(data)
    },
    loadList() {
      this.post({})
        .then((data) => {this.qslList = data})
    },
    newQso () {
      const qso = {
        callsign: null,
        stationCallsign: null,
        listCallsign: null,
        manualCallsign: false,
        manualCallsignValue: null,
        band: null,
        mode: null,
        date: null,
        time: null,
        rda: null
      }
      if (this.qsl && this.qsl.qso && this.qsl.qso.length) {
        const prevQso = this.qsl.qso[this.qsl.qso.length - 1]
        qso.listCallsign = prevQso.listCallsign
        qso.manualCallsign = prevQso.manualCallsign
        qso.manualCallsignValue = prevQso.manualCallsignValue
        this.setQsoCallsign(qso)
      }
      return qso
    },
    addQso () {
      this.qsl.qso.push(this.newQso())
    },
    setQsoCallsign (qso) {
      qso.callsign = qso.manualCallsign ? qso.manualCallsignValue : qso.listCallsign
    },
    qslImageChange (imgType, e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      const reader = new FileReader()
      const vm = this
      if (!this.qsl[imgType]) {
        this.$set(this.qsl, imgType, {name: null, file: null})
      }
      this.qsl[imgType].name = files[0].name

      reader.onload = function (e) {
        vm.qsl[imgType].file = e.target.result
        vm.validate()
      }
      reader.readAsDataURL(files[0])
    },
    deleteQso (idx) {
      if (confirm("Удалить строку? Do you really want to delete the line?")) {
        this.qsl.qso.splice(idx, 1)
      }
    },
    deleteQsl (idx) {
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
      this.post({qsl: this.qsl})
        .then(() => {
          this.qso = [this.newQso()]
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

