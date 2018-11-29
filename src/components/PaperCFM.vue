<template>
    <div id="paper_qsl">
        <h4>CFM RDA по бумажным QSL-карточкам</h4>
        <p>Заполните форму ввода данными из полученной QSL-карточки, подтверждающей QSO с необходимым вам RDA. Если QSL карточка выписана вам на старый позывной, то в поле "Your сallsign" укажите его, а в поле "New callsign" можно указать ваш новый позывной, чтобы это QSO пошло в зачёт и новому позывному.<br/>
        После проверки модератором данные будут добавлены в  базу CFMRDA.</p>
        <p class="grey_note">Fill in the input form with data from the received QSL card confirming the QSO with the RDA you need. If a QSL card is issued to your old callsign, then enter it in the "QSL callsign" field, and you can enter your new callsign in the "New callsign" field so that this QSO will go on to the new callsign.<br/>
        Your data will be added to CFMRDA database after the check by the moderator.</p>
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
            <input type="text" name="qsl_callsign" id="qsl_callsign" v-model="qso.callsign">
        </td>
        <td class="qsl_rda"><input type="text" name="qsl_rda" id="qsl_rda"></td>
        <td class="qsl_date">input календарь</td>
        <td class="qsl_time"><input type="text" name="qso_time" id="qso_time"></td>
        <td class="qsl_band">
            <select>
                <option>1.8</option>
                <option>3.5</option>
                <option>7</option>
                <option>10</option>
                <option>14</option>
                <option>18</option>
                <option>21</option>
                <option>24</option>
                <option>28</option>
            </select>
        </td>
        <td class="qsl_mode">
            <select>
                <option>CW</option>
                <option>SSB</option>
                <option>DIGI</option>
            </select>
        </td>
        <td class="qsl_my_call"><input type="text" name="qsl_my_call" id="qsl_my_call"></td>
        <td class="qsl_my_new_call" colspan="2"><input type="text" name="qsl_my_new_call" id="qsl_my_new_call"></td>
        <td rowspan="2" class="del"><input type="button" name="save_qsl" id="save_qsl" value="OK" class="btn"></td>
    </tr>
    <tr>
        <td colspan="9" class="qsl_upload"><b>Загрузите скан или фото QSL-карточки!</b> <input type="file" name="qsl_callsign"></td>
    </tr>
    <tr><td colspan="10" class="no_border"></td></tr>
    <tr>
        <td class="qsl_callsign">DX1DX</td>
        <td class="qsl_rda">KK-23</td>
        <td class="qsl_date">12 Dec 2017</td>
        <td class="qsl_time">07:15</td>
        <td class="qsl_band">7</td>
        <td class="qsl_mode">CW</td>
        <td class="qsl_my_call">TE1STA</td>
        <td class="qsl_my_new_call">TE1S</td>
        <td class="qsl_card"><a href="#"><img src="/images/icon_qsl.png" title="Просмотр QSL"></a></td>
        <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
    </tr>
    <tr>
        <td class="qsl_callsign">DX2DX/P</td>
        <td class="qsl_rda">KK-11</td>
        <td class="qsl_date">15 Mar 2018</td>
        <td class="qsl_time">08:50</td>
        <td class="qsl_band">14</td>
        <td class="qsl_mode">SSB</td>
        <td class="qsl_my_call">TE1STA</td>
        <td class="qsl_my_new_call">TE1S</td>
        <td class="qsl_card"><a href="#"><img src="/images/icon_qsl.png" title="Просмотр QSL"></a></td>
        <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
    </tr>
    <tr class="cfmd">
        <td class="qsl_callsign">DX3DX/P</td>
        <td class="qsl_rda">KK-13</td>
        <td class="qsl_date">15 Mar 2018</td>
        <td class="qsl_time">08:50</td>
        <td class="qsl_band">14</td>
        <td class="qsl_mode">SSB</td>
        <td class="qsl_my_call">TE1STA</td>
        <td class="qsl_my_new_call">TE1S</td>
        <td class="qsl_card"><img src="/images/icon_qsl_cfm.png" title="QSL проверена. Информация добавлена в базу CFMRDA."></td>
        <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
    </tr>
    <tr class="not_cfmd">
        <td class="qsl_callsign">DX4DX/P</td>
        <td class="qsl_rda">KK-14</td>
        <td class="qsl_date">16 Mar 2018</td>
        <td class="qsl_time">07:50</td>
        <td class="qsl_band">10</td>
        <td class="qsl_mode">CW</td>
        <td class="qsl_my_call">TE1STA</td>
        <td class="qsl_my_new_call">TE1S</td>
        <td class="qsl_card"><img src="/images/icon_qsl_not_cfm.png" title="QSL не прошла проверку."><Br/>Не указан RDA</td>
        <td class="del"><img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"></td>
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

