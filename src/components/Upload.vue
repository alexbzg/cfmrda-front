<template>
    <div class="list list_small">
      <div id="upload">
        <div id="upload_rules" @click="showInfo = !showInfo">Правила загрузки ADI файлов</div>
            <ul id="upload_info" v-if="showInfo">
              <li>Один файл - один RDA район.</li>
              <li>Можно выбирать и загружать сразу несколько ADI файлов.</li>
              <li>Если название файла будет начинаться с RDA района (<i>например, BU-10.adi или KR-03_R7AB.adi</i>), то RDA район в поле ввода будет вставлен автоматически.</li>
              <li>Если активатор работал из RDA района разными позывными (<i>например, .../P и .../M</i>), то можно отметить "Брать позывной активатора..." и написать название ПОЛЯ в ADI файле, из которого будет браться позывной активатора для каждого QSO.</li>
          </ul>

        <div id="upload_form" v-if="!pending">
          <input type="file" id="adif_file" style="display: none;" @change="adifFileChange"
            accept=".adi,.adif" multiple/>
          <label  for="adif_file">
            <div class="btn" id="file_btn">Выбрать один или несколько ADI файлов для загрузки</div>
          </label>
          <br/>
          Позывной RDA активатора
          <input type="text" name="callsign_input" id="callsign_input" 
                v-model.trim="adif.stationCallsign" 
                @change="capitalize(adif, 'stationCallsign')" 
                :class="{error: !adif.stationCallsignFieldEnable && validationErrors.stationCallsign}"
                :disabled="adif.stationCallsignFieldEnable"/><br/>
          <span id="activator_check">
              <input type="checkbox" name="activator_check" v-model="adif.stationCallsignFieldEnable"
                @change="stationCallsignTypeChange"/> 
              Брать позывной активатора в ADI файле из поля
              <input type="text" name="callsign_field" id="callsign_field" 
                v-model="adif.stationCallsignField"
                @change="capitalize(adif, 'stationCallsignField')"
                :class="{error: adif.stationCallsignFieldEnable && validationErrors.stationCallsignField}"
                :disabled="!adif.stationCallsignFieldEnable"/>
          </span>
          <br/>
          <table id="upload_files">
            <tr>
              <td class="top file">Файл</td>
              <td class="top rda_input">RDA</td>
            </tr>
            <tr v-for="(file, index) in adif.files">
              <td class="file">{{file.name}}</td>
              <td class="rda_input"><input type="text" name="rda_input" id="rda_input" v-model.trim="file.rda" 
                @change="capitalize(adif.files[index], 'rda')" 
                :class="{error: validationErrors['files['+index+'].rda']}"></td>
            </tr>
          </table>
          <br/>
          <div id="ok_check" v-if="validated">
              <input type="checkbox" name="ok_check" v-model="check"/> Да, всё верно.
          </div>
          <input type="button" name="upload_btn" id="upload_btn" v-if="check"
            value="Загрузить в базу данных CFMRDA" class="btn" @click="uploadADIF">
        </div> 

        <div id="uploading_info" v-if="pending">
          Идёт загрузка файла...<br/>
          <img id="uploading" src="images/spinner.gif" border="0" />
        </div>

        <div id="response" v-if="response.message || response.errors">
            <div id="message" v-if="response.message" v-html="response.message"
                :class="{'success': response.success}">
            </div>
            <table id="errors" v-if="response.errors">
                <tr>
                    <td class="top file">Файл</td>
                    <td class="top rda">RDA</td>
                    <td class="top error">Ошибка</td>
                </tr>
                <tr v-for="error in response.errors">
                    <td class="file">{{error.filename}}</td>
                    <td class="rda">{{error.rda}}</td>
                    <td class="error">{{error.message}}</td>
               </tr>
            </table>
        </div>
        
      </div>
    </div>   
</template>

<script>
import storage from '../storage'
import {uploadADIF as apiUploadADIF, getRDAValues} from '../api'

import validationMixin from '../validation-mixin'
import capitalizeMixin from '../capitalize-mixin'

const STORAGE_KEY_STATION_CALLSIGN_SETTINGS = 'station_callsign_settings'
const DEF_STATION_CALLSIGN_FIELD = 'STATION_CALLSIGN'
const reRDA = /([a-z][a-z])[- ]?(\d\d)/gi

export default {
  mixins: [validationMixin, capitalizeMixin],
  name: 'upload',
  data () {
    getRDAValues()
      .then((data) => { this.RDAValues = data })
     
    const stationCallsignSettings = this.loadStationCallsignSettings()
    const adif = {
        rda: null,
        stationCallsignFieldEnable: stationCallsignSettings.fieldEnable,
        stationCallsign: stationCallsignSettings.fieldEnable ?
            null : stationCallsignSettings.callsign,
        stationCallsignField: stationCallsignSettings.fieldEnable ?
            stationCallsignSettings.field : null,
        files: [],
        token: this.$store.getters.userToken,
        fileName: null
    }
    return {
      showInfo: false,
      pending: false,
      response: {
        message: null,
        errors: null,
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
        const idx = i
        const reader = new FileReader()
        const vm = this
        const file = {name: files[i].name, rda: null}
        let rdaMatch = null
        while ((rdaMatch = reRDA.exec(file.name)) !== null) {
          let rda = (rdaMatch[1] + '-' + rdaMatch[2]).toUpperCase()
          if (this.RDAValues.includes(rda)) {
            file.rda = rda
            reRDA.lastIndex = 0
            break
          }
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
      this.pending = true
      this.check = false
      apiUploadADIF(this.adif)
        .then((response) => { 
          if (response.filesLoaded) {
            this.response.message = 'Успешно загружено файлов: ' + response.filesLoaded
            this.response.success = true
          }
          if (response.errors.length) {
            this.response.errors = response.errors
          }
        })
        .catch((e) => {
          this.response.message = e.message
        })
        .finally((r) => {
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

