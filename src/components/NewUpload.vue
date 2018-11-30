<template>
      <div id="upload">
        <div id="upload_rules" @click="showInfo = !showInfo">Правила загрузки ADIF</div>
            <ul id="upload_info" v-if="showInfo">
              <li><b>Засчитываются QSO</b>, проведенные любым видом излучения на любых КВ диапазонах <b>c 12 июня 1991 года</b>.<br/>Связи, проведённые до этой даты, в базу CFMRDA добавлены не будут.</li>
              <li><b>Один файл - один RDA район</b>. Если название файла будет начинаться с RDA района (<i>например, BU-10.adi или KR-03_R7AB.adi</i>), то RDA район в поле ввода будет вставлен автоматически.</li>
              <li><b>Один файл - несколько RDA районов</b>. Отметьте "Брать RDA район активатора..." и напишите название ПОЛЯ в ADI файле, из которого будет браться RDA активатора для каждого QSO.</li>
              <li><b>Можно</b> выбирать и загружать <b>сразу несколько</b> ADI файлов.</li>
              <li>Если <b>активатор</b> работал из RDA района <b>разными позывными</b> (<i>например, .../P и .../M</i>), то отметьте "Брать позывной активатора..." и напишите название ПОЛЯ (<i>без двоеточия и цифры</i>) в ADI файле, из которого будет браться позывной активатора для каждого QSO.<br/><img src="/images/help_1.jpg" title="Как указывать поле позывного в ADIF" /></li>
              <li>Если <b>активатор</b> работал из RDA района <b>коллективным позывным</b> (<i>например, позывным R7AB работали операторы R7DA и R7TU</i>), то можно отметить "Подтвердить RDA районы..." и написать позывные операторов коллективной станции, чтобы проведенные QSO пошли в зачёт и операторам.</li>
              <li>Если у активатора есть <b>лог работы</b> его <b>старым позывным</b>, а зачёт должен пойти и за новый позывной (<i>например, новый позывной RU6K, а старые позывные - UU2JQ, EO2012JQ, UB2JQ, UB4JLF</i>), то при загрузке лога укажите актуальный позывной на тот момент (<i>из примера - UU2JQ</i>), отметьте "Подтвердить RDA районы..." и напишите новый позывной (<i>из примера - RU6K</i>). Проведенные QSO пойдут в зачёт и старому, и новому позывному.</li>
          </ul>

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
              <td class="rda_input"><input type="text" name="rda_input" id="rda_input" v-model.trim="file.rda" 
                v-capitalize :disabled="adif.rdaFieldEnable"
                :class="{error: !adif.rdaFieldEnable && validationErrors['files.'+index+'.rda']}"></td>
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
                <tr v-for="(error, index) in response.errors" :key="index">
                    <td class="file">{{error.filename}}</td>
                    <td class="rda">{{error.rda}}</td>
                    <td class="error">{{error.message}}</td>
               </tr>
            </table>
        </div>
        
      </div>
</template>

<script>
import storage from '../storage'
import {uploadADIF as apiUploadADIF} from '../api'
import {parseRDA} from '../ham-radio'

import validationMixin from '../validation-mixin'

const STORAGE_KEY_STATION_CALLSIGN_SETTINGS = 'station_callsign_settings'
const DEF_STATION_CALLSIGN_FIELD = 'STATION_CALLSIGN'

export default {
  mixins: [validationMixin],
  name: 'Upload',
  data () {
    const stationCallsignSettings = this.loadStationCallsignSettings()
    const adif = {
        rda: null,
        stationCallsignFieldEnable: stationCallsignSettings.fieldEnable,
        stationCallsign: stationCallsignSettings.fieldEnable ?
            null : stationCallsignSettings.callsign,
        stationCallsignField: stationCallsignSettings.fieldEnable ?
            stationCallsignSettings.field : null,
        additionalActivatorsEnable: false,
        additionalActivators: null,
        rdaFieldEnable: false,
        rdaField: null,
        files: [],
        token: this.$store.getters.userToken,
        fileName: null
    }
    return {
      showSetup: false,
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
        const reader = new FileReader()
        const vm = this
        const file = {name: files[i].name, rda: parseRDA(files[i].name)}
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
            this.response.message = 'Успешно загружено файлов: ' + response.filesLoaded +
              '.<br/> Статистика будет обновлена в течение 24 часов.'
            this.response.success = true
          }
          if (response.errors.length) {
            this.response.errors = response.errors
          }
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

