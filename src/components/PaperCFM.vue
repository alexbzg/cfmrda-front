<template>
    <div id="paper_qsl">
            <h4>CFM RDA по QSL-карточкам (paper, eQSL, Hamlog)</h4>
            <p>Заполните форму ввода данными из полученной QSL-карточки, подтверждающей QSO с необходимым вам RDA.<br/>
            После проверки модератором данные будут добавлены в  базу CFMRDA. На карточке спец.позывного <b>обязательно указание RDA</b>.<br/>На проверку принимаются карточки с датой <b>не менее 10 дней</b> до текущей даты.<br/>Для получения CFM QSO с недавней датой используйте зачёт из eLog'ов (<i>кнопка Обновить</i>).</p>
            <p class="grey_note">Fill in the input form with data from the received QSL card confirming the QSO with the RDA you need.<br/>
            Your data will be added to CFMRDA database after the check by the moderator.  On the special callsign card <b>the RDA is required</b>.<br/>Cards with a date of <b>at least 10 days</b> before the current date are accepted for verification.<br/>To receive CFM QSOs with a recent date use the autodownload system from eLogs (<i>the Update button</i>).</p>
        <table id="qsl_data_form">
        <tr>
            <td class="top qsl_callsign">Station's callsign</td>
            <td class="top qsl_rda">RDA</td>
            <td class="top qsl_date">Date</td>
            <td class="top qsl_time">Time</td>
            <td class="top qsl_band">Band</td>
            <td class="top qsl_mode">Mode</td>
            <td class="top qsl_my_call">Your сallsign</td>
            <td class="top del"></td>
        </tr>
        <tbody v-for="(qso, idx) in qsl.qso" :key="idx">
            <tr>
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
                    <select v-model="qso.band" :class="{error: validationErrors['qso.' + idx + '.band']}">
                        <option v-for="(band, wl) in $options.BANDS_WL" :value="band" :key="band">{{wl}}</option>
                    </select>
                </td>
                <td class="qsl_mode">
                    <select-mode v-model="qso.mode" :class="{error: validationErrors['qso.' + idx + '.mode']}">
                    </select-mode>
                </td>
                <td class="qsl_my_call">
                    <input type="radio" :name="'qsl_callsign_rb_' + idx" class="qsl_radio_btns" :value="false"
                        v-model="qso.manualCallsign" @change="setQsoCallsign(qso)">
                    <select id="select_my_callsign" v-model="qso.listCallsign" :disabled="qso.manualCallsign"
                        @change="setQsoCallsign(qso)"
                        :class="{error: !qso.manualCallsign && validationErrors['qso.' + idx + '.callsign']}">
                        <option v-for="(callsign, idx) in userCallsigns" :value="callsign" :key="idx">{{callsign}}</option>
                    </select>
                    <input type="radio" :name="'qsl_callsign_rb_' + idx" class="qsl_radio_btns" :value="true"
                        v-model="qso.manualCallsign" @change="setQsoCallsign(qso)">
                    <input type="text" name="qsl_callsign" id="my_callsign" :disabled="!qso.manualCallsign"
                        v-capitalize @input="setQsoCallsign(qso)"
                        :class="{error: qso.manualCallsign && validationErrors['qso.' + idx + '.callsign']}"
                        v-model="qso.manualCallsignValue">
                </td>
                <td class="del" @click="deleteQso(idx)">
                    <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line">
                </td>
            </tr>
            <tr v-if="qso.response">
                <td colspan="8" class="response no_border" v-html="qso.response">
                </td>
            </tr>
        </tbody>
        <tr>
            <td colspan="8" class="add_line" @click="addQso">
                Добавить ещё одну строку QSO на этой QSL - Add one more QSO line on this QSL
            </td>
        </tr>
        <tr>
            <td colspan="6" class="card_upload">
                <span v-for="img in $options.images" :key="img.type">
                    {{img.caption}}
                    <input type="file" :name="img.type"
                        :ref="'fileInput_' + img.type"
                        accept="image/png, image/jpeg"
                        :class="{error: validationErrors[img.type + '.name']}"
                        @change="qslImageChange(img.type, $event)"
                    /><br/>
                </span>
            </td>
            <td colspan="2" class="qsl_message">
                Your comment<br/>
                <textarea name="qsl_message" v-model="qsl.comment" class="no_latinize">
                </textarea>
            </td>
        </tr>
        </table>

        <input type="button" name="save_qsl" id="save_qsl"
            value="Отправить QSL на проверку - Send this QSL for check" class="btn"
            :disabled="pending || !validated" @click="buttonClick">
        <br/>

        <table id="qsl_list" v-if="qslList">
            <tbody v-for="(qso, idx) in qslList" :key="idx">
                <tr :class="{confirmed: qso.state === true, rejected: qso.state === false}">
                    <td class="qsl_callsign">{{qso.stationCallsign}}</td>
                    <td class="qsl_rda">{{qso.rda}}</td>
                    <td class="qsl_date">{{qso.date}}</td>
                    <td class="qsl_time">{{qso.time}}</td>
                    <td class="qsl_band">{{bandWl(qso.band)}}</td>
                    <td class="qsl_mode">{{qso.mode}}</td>
                    <td class="qsl_my_call">{{qso.callsign}}</td>
                    <td class="qsl_card">
                        <div class="moderator" v-if="qso.admin">{{qso.admin}}</div>
                        <qsl-images :qso="qso" :active-image="activeImage" @show-qsl-image="showImage">
                        </qsl-images>
                        <img v-if="qso.state" src="/images/icon_qsl_cfm.png"
                            title="QSL проверена. Информация добавлена в базу CFMRDA."/>
                        <img v-if="qso.state === false" src="/images/icon_qsl_not_cfm.png"
                            title="QSL не прошла проверку."/>
                    </td>
                    <td class="qsl_message">
                        <template v-if="qsl.state !== true">
                            <span class="user" v-if="qso.commentQsl">{{qso.commentQsl}}</span>
                            <br v-if="qso.commentQsl && qso.commentQso"/>
                            <span class="admin" v-if="qso.commentQso">{{qso.commentQso}}</span>
                        </template>
                    </td>
                    <td class="del" @click="deleteQsl(qso.id)">
                        <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line">
                    </td>
                </tr>
                <tr v-if="activeImage && activeImage.qso === qso">
                    <td colspan="10" class="qsl_image">
                        <img :src="activeImage.src" @click="showImage(null)"/>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import {mapGetters, mapState, mapActions} from 'vuex'

import Datepicker from 'vuejs-datepicker'
import {TheMask} from 'vue-the-mask'

import RdaInput from './RDAinput'
import SelectMode from './SelectMode'
import QslImages from './QslImages'

import validationMixin from '../validation-mixin'
import requireLoginMixin from '../require-login-mixin'
import latinizeMixin from '../latinize-mixin'

import {cfmQslQso} from '../api'
import {USER_DATA_ACTION} from '../store'
import {BANDS_WL, bandWl} from '../ham-radio'

export default {
  BANDS_WL: BANDS_WL,
  images: [
    {type: 'image', caption: 'Изображение стороны QSL-карточки c данными QSO - Image of the QSL card\'s side with QSO data'},
    {type: 'imageBack', caption: 'Вторая сторона этой QSL - The other side of this QSL'},
  ],
  mixins: [validationMixin, requireLoginMixin, latinizeMixin],
  components: {Datepicker, RdaInput, SelectMode, TheMask, QslImages},
  name: 'PaperCFM',
  data () {
    const qsl = {
      qso: [this.newQso()],
      image: {
        file: null,
        name: null
      },
      comment: null
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
    ...mapGetters(['userToken', 'userDefs']),
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
    ...mapActions([USER_DATA_ACTION]),
    bandWl (band) {
      return bandWl(band)
    },
    showImage(imgData) {
      this.activeImage = imgData
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
      const prevQso = this.qsl && this.qsl.qso && this.qsl.qso.length ? this.qsl.qso[this.qsl.qso.length - 1] : null
      const qslDefs = prevQso ? prevQso : this.$store.getters.userDefs.qsl
      const qso = {
        callsign: null,
        stationCallsign: null,
        listCallsign: null,
        manualCallsign: false,
        manualCallsignValue: null,
        band: qslDefs.band,
        mode: qslDefs.mode,
        date: qslDefs.date,
        time: null,
        rda: null
      }
      if (prevQso) {
        qso.listCallsign = prevQso.listCallsign
        qso.manualCallsign = prevQso.manualCallsign
        qso.manualCallsignValue = prevQso.manualCallsignValue
        this.setQsoCallsign(qso)
        qso.stationCallsign = prevQso.stationCallsign
      }
      return qso
    },
    addQso () {
      this.qsl.qso.push(this.newQso())
    },
    setQsoCallsign (qso) {
      qso.callsign = qso.manualCallsign ? qso.manualCallsignValue : qso.listCallsign
      this.validate()
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
      const qso = this.qsl.qso[this.qsl.qso.length - 1]
      this[USER_DATA_ACTION]({data: {defs: {qsl: {
        band: qso.band,
        mode: qso.mode,
        date: qso.date
      }}}})
      this.pending = true
      this.response = null
      this.post({qsl: this.qsl})
        .then((response) => {
          const unsaved = []
          for (let co = 0; co < response.length; co++) {
            if (response[co] !== 'ok') {
              this.qsl.qso[co].response = response[co]
              unsaved.push(this.qsl.qso[co])
            }
          }
          if (unsaved.length) {
            this.qsl.qso = unsaved
          } else {
            this.qsl.qso = [this.newQso()]
            for (const imgType of ['image', 'imageBack']) {
              const fileInput = this.$refs['fileInput_' + imgType][0]
              fileInput.value = ''
            }
            this.qsl.image = {name: null, file: null}
            this.$delete(this.qsl, 'imageBack')
            this.qsl.comment = ''
          }
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

