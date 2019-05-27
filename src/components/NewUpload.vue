<template>
      <div id="upload">

        <div id="upload_form" v-if="!pending">
          Позывной
          <input type="text" name="callsign_input" id="callsign_input" 
                v-model.trim="adif.stationCallsign" v-capitalize
                :class="{error: !adif.stationCallsignFieldEnable && validationErrors.stationCallsign}"
                :disabled="adif.stationCallsignFieldEnable"/>

          <div id="upload_setup_link" @click="showSetup = !showSetup">
              Расширенные настройки загрузки
          </div>
          <div id="upload_setup" v-show="showSetup">
            <span id="activator_check">
                <input type="checkbox" name="activator_check" v-model="adif.stationCallsignFieldEnable"
                  @change="stationCallsignTypeChange"/> 
                Брать <b>позывной</b> в ADIF из поля
                <input type="text" name="callsign_field" id="callsign_field" 
                  v-model="adif.stationCallsignField" v-capitalize
                  :class="{error: adif.stationCallsignFieldEnable && validationErrors.stationCallsignField}"
                  :disabled="!adif.stationCallsignFieldEnable"/>
            </span><br/>
            <span id="rda_check">
                <input type="checkbox" name="rda_check" v-model="adif.rdaFieldEnable"/> 
                Брать <b>RDA район</b> в ADIF из поля
                <input type="text" name="rda_field" id="rda_field" v-model="adif.rdaField"
                  :class="{error: adif.rdaFieldEnable && validationErrors.rdaField}"
                  v-capitalize :disabled="!adif.rdaFieldEnable"/>
            </span><br/>
            <span id="operators_check">
                <input type="checkbox" name="operators_check" 
                  v-model="adif.additionalActivatorsEnable"/>
                 Подтвердить RDA районы <b>для операторов вашей экспедиции</b> или для вашего <b>нового позывного</b><br/>
                <input type="text" name="operators_callsigns" id="operators_callsigns" 
                  :disabled="!adif.additionalActivatorsEnable"
                  v-capitalize v-model.trim="adif.additionalActivators"/>
            </span>
          </div>

          <input type="file" id="adif_file" style="display: none;" @change="adifFileChange"
            accept=".adi,.adif" multiple/>
          <label  for="adif_file">
            <div class="btn" id="file_btn">Выберите один или несколько ADI файлов для загрузки</div>
          </label>

          <table id="upload_files" v-if="adif.files.length">
            <tr>
              <td class="top file">Файл</td>
              <td class="top rda_input">RDA</td>
            </tr>
            <tr v-for="(file, index) in adif.files" :key="index">
              <td class="file">{{file.name}}</td>
              <td class="rda_input"><rda-input name="rda_input" id="rda_input" v-model.trim="file.rda" 
                v-capitalize :disabled="adif.rdaFieldEnable"
                :class="{error: !adif.rdaFieldEnable && validationErrors['files.'+index+'.rda']}">
                </rda-input>
              </td>
            </tr>
          </table>
          <br/>
          <div id="ok_check" v-if="validated"><b>Проверьте, правильно ли указан RDA!</b><br/>
              <input type="checkbox" name="ok_check" v-model="check"/> Да, всё верно.
          </div>
          <input type="button" name="upload_btn" id="upload_btn" v-if="check"
            value="Загрузить в базу данных CFMRDA" class="btn" @click="uploadADIF"><br/><br/>
            <span id="upload_email">Если при загрузке ADIF появляется ошибка, пришлите свой ADI файл на <b><u>support@cfmrda.ru</u></b>. Мы загрузим его сами.</span>
        </div> 

        <div id="uploading_info" v-if="pending">
          Идёт загрузка файла...<br/>
          <img id="uploading" src="images/spinner.gif" border="0" />
        </div>

        <div id="response" v-if="response.message || response.errors">
            <div id="message" v-if="response.message" v-html="response.message"
                :class="{'success': response.success}">
            </div>
            <table id="files" v-if="response.files.length">
                <tr>
                    <td class="top file">Файл</td>
                    <td class="top rda">RDA</td>
                    <td class="top error">Статус</td>
                </tr>
                <template v-for="(file, index) in response.files"> 
                    <tr :key="index">
                        <td class="file">{{file.file}}</td>
                        <td class="rda">{{file.rda}}</td>
                        <td class="error">
                            <template v-if="file.qso">
                                <span v-if="file.qso.ok" class="ok">
                                    Загружено: <span class="count">{{file.qso.ok}}</span>
                                    <br v-if="file.qso.error"/>
                                </span>
                                <template v-if="file.qso.error">
                                    <span v-for="(count, msg) in file.qso.errors" class="error" :key="msg">
                                        {{msg}}: <span class="count">{{count}}</span><br/>
                                    </span>
                                </template>
                            </template>
                            <span class="error" v-else>{{file.message}}</span>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
        
      </div>
</template>

<script>
import storage from '../storage'
import {uploadADIF as apiUploadADIF} from '../api'
import {parseRDA} from '../ham-radio'

import RdaInput from './RDAinput'

import validationMixin from '../validation-mixin'

const STORAGE_KEY_STATION_CALLSIGN_SETTINGS = 'station_callsign_settings'
const STORAGE_KEY_RDA_SETTINGS = 'rda_settings'
const DEF_STATION_CALLSIGN_FIELD = 'STATION_CALLSIGN'
const RDA_DETECT_SKIP = ['TO-20', 'OM-20', 'TO-19', 'OM-19']

export default {
  mixins: [validationMixin],
  components: {RdaInput},
  name: 'Upload',
  data () {
    const stationCallsignSettings = this.loadStationCallsignSettings()
    const rdaSettings = this.loadRdaSettings()
    const adif = {
        rda: null,
        stationCallsignFieldEnable: stationCallsignSettings.fieldEnable,
        stationCallsign: stationCallsignSettings.fieldEnable ?
            null : stationCallsignSettings.callsign,
        stationCallsignField: stationCallsignSettings.fieldEnable ?
            stationCallsignSettings.field : null,
        additionalActivatorsEnable: false,
        additionalActivators: null,
        rdaFieldEnable: rdaSettings.fieldEnable,
        rdaField:rdaSettings.field,
        files: [],
        token: this.$store.getters.userToken,
        fileName: null
    }
    return {
      showSetup: false,
      pending: false,
      response: {
        message: null,
        files: [],
        success: false
      },
      adif: adif,
      validationSchema: 'adif',
      validationData: adif,
      check: false,
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userCallsign) {
        vm.$router.push( '/login' )
      }
    })
  },
  methods: {
    loadStationCallsignSettings () {
      return storage.load(STORAGE_KEY_STATION_CALLSIGN_SETTINGS) ||
        {fieldEnable: false, callsign: null, field: null}
    },
    loadRdaSettings () {
      return storage.load(STORAGE_KEY_RDA_SETTINGS) ||
        {fieldEnable: false, field: null}
    },
    clearResponse() {
      this.response.message = null
      this.response.errors = null
      this.response.success = false
    },
    adifFileChange (e) {
      this.clearResponse()
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      this.adif.files = []  

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader()
        const vm = this
        const rda = parseRDA(files[i].name)        
        const file = {
          name: files[i].name, 
          rda: RDA_DETECT_SKIP.includes(rda) ? null : rda
        }
        this.adif.files.push(file)

        reader.onload = function (e) {
          file.file = e.target.result
          vm.validate()
        }
        reader.readAsDataURL(files[i])
      }
    },
    uploadADIF () {
      const stationCallsignSettings = this.loadStationCallsignSettings()
      if (this.adif.stationCallsignFieldEnable) {
        stationCallsignSettings.field = this.adif.stationCallsignField
      } else {
        stationCallsignSettings.callsign = this.adif.stationCallsign
      }
      stationCallsignSettings.fieldEnable = this.adif.stationCallsignFieldEnable
      storage.save(STORAGE_KEY_STATION_CALLSIGN_SETTINGS, stationCallsignSettings, 'local')
      const rdaSettings = this.loadRdaSettings()
      rdaSettings.fieldEnable = this.adif.rdaFieldEnable
      if (this.adif.rdaFieldEnable)
          rdaSettings.field = this.adif.rdaField
      storage.save(STORAGE_KEY_RDA_SETTINGS, rdaSettings, 'local')
      this.pending = true
      this.check = false
      apiUploadADIF(this.adif)
        .then((response) => { 
          let qso = 0
          this.response.files = []
          for (const file of response) {
            if (file.qso && file.qso.ok)
              qso += file.qso.ok
            this.response.files.push(file)
          }
          if (qso) {
            this.response.message = 'Успешно загружено qso: ' + qso +
              '.<br/> Статистика будет обновлена в течение 24 часов.'
            this.response.success = true
          } else 
            this.response.message = 'Не найдено корректных qso.'
        })
        .catch((e) => {
          this.response.message = e.message
        })
        .finally(() => {
          this.adif.files = []
          this.pending = false
        })
    },
    stationCallsignTypeChange () {
      const savedSettings = this.loadStationCallsignSettings()
      if (this.adif.stationCallsignFieldEnable) {
        this.adif.stationCallsignField = savedSettings.field || DEF_STATION_CALLSIGN_FIELD
        this.adif.stationCallsign = null
      } else {
        this.adif.stationCallsignField = null
        this.adif.stationCallsign = savedSettings.callsign
     }
    }
  }
}
</script>

