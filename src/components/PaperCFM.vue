<template>
    <div id="paper_qsl">
        <h4>CFM RDA по бумажным QSL-карточкам</h4>
        <p>Введите данные QSO из полученной QSL, подтверждающей необходимый вам RDA. Если QSL карточка выписана вам на старый позывной, то в поле "New callsign" можно указать ваш новый позывной, чтобы это QSO пошло в зачёт и новому позывному.<br/>
        После проверки модератором данные будут добавлены в  базу CFMRDA. Принимаются фото бумажных QSL и изображения eQSL и HamLog.</p>

        <div id="qsl_rules"><b>Правило проверки <i>электронных</i> QSL</b><br/>
        Если заявленый RDA и тот, что указан в нашей базе RDA Search, <i>совпадают</i>, то карточка идет в зачёт.<br/>
        Если в нашей базе по позывному указаны <i>"три звездочки"</i>, определение RDA невозможно и карточка в зачёт не идет.<br/>
        Если заявленый RDA и тот, что указан в нашей базе, <i>не совпадают</i>, то карточка откладывается до выяснения.<br/>
        Если позывного нет в нашей базе, то зачет идет по тому RDA, который написан на карточке.
        </div>

        <p class="grey_note">Fill in the input form with data from the received QSL card confirming the QSO with the RDA you need. If a QSL card is issued to your old callsign, you can enter your new callsign in the "New callsign" field so that this QSO will go on to the new callsign. Your data will be added to CFMRDA database after the check by the moderator.<br/> <b>Photos of paper QSLs</b>, <b>eQSL</b>, <b>HamLog</b> images are taken only.</p>
        <table id="add_paper_qsl">
            <tr>
                <td class="top qsl_callsign">Station's callsign</td>
                <td class="top qsl_rda">RDA</td>
                <td class="top qsl_date">Date</td>
                <td class="top qsl_time">GMT</td>
                <td class="top qsl_band">MHz</td>
                <td class="top qsl_mode">Mode</td>
                <td class="top qsl_my_call">Your сallsign</td>
                <td class="top qsl_my_new_call" colspan="2">New callsign</td>
                <td class="top del"></td>
            </tr>
            <tr>
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
                <td class="qsl_my_call">
                    <input type="text" name="qsl_my_call" id="qsl_my_call" v-model="qso.callsign"
                        v-capitalize
                        :class="{error: validationErrors.callsign}"/>
                </td>
                <td class="qsl_my_new_call" colspan="2">
                    <input type="text" name="qsl_my_new_call" id="qsl_my_new_call" v-model="qso.newCallsign"
                        v-capitalize
                        :class="{error: validationErrors.newCallsign}"/>
                </td>
                <td rowspan="2" class="del">
                    <input type="button" name="save_qsl" id="save_qsl" value="OK" class="btn"
                        @click="buttonClick" :disabled="pending || !validated"/>
                </td>
            </tr>
            <tr>
                <td colspan="9" class="qsl_upload">
                    <b>Загрузите скан или фото QSL-карточки!</b>
                    <input type="file" name="qsl_callsign" @change="qslImageChange"
                        ref="fileInput"
                        :class="{error: validationErrors['image.name']}"
                        accept=".png,.jpg,.gif"/>
                </td>
            </tr>

            <tr><td colspan="10" class="no_border"></td></tr>
            <tr v-if="response">
                <td colspan="10" class="response no_border">
                    <div v-if="response" id="message" v-html="response"></div>
                </td>
            </tr>
            <tr>
                <td colspan="10" class="no_border2">
                Удаление <b>проверенной и утвержденной</b> QSL карточки из списка <b>не влияет</b> на вашу статистику CFM RDA.
                </td>
            </tr>

            <tbody v-for="qso in qsoList" :key="qso.id">
                <tr :class="{cfmd: qso.state, not_cfmd: qso.state === false}">
                    <td class="qsl_callsign">{{qso.stationCallsign}}</td>
                    <td class="qsl_rda">{{qso.rda}}</td>
                    <td class="qsl_date">{{qso.date}}</td>
                    <td class="qsl_time">{{qso.time}}</td>
                    <td class="qsl_band">{{qso.band}}</td>
                    <td class="qsl_mode">{{qso.mode}}</td>
                    <td class="qsl_my_call">{{qso.callsign}}</td>
                    <td class="qsl_my_new_call">{{qso.newCallsign}}</td>
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
                    <td class="del">
                        <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"
                            @click="deleteQso(qso.id)"/>
                    </td>
                </tr>
                <tr v-if="showImage === qso">
                    <td colspan="10" class="qsl_image">
                        <img :src="'/qsl_images/' + qso.id + '_' + qso.image" @click="showImage = null"/>
                    </td>
                </tr>
            </tbody>
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

