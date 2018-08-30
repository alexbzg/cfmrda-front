<template>
    <div class="list list_small">
      <div id="upload">
        <span class="red">Загружать файлы ADI необходимо <b>раздельно</b> по каждому RDA-району!</span>
        <br/>
        <br/>
        <div id="upload_form">
          <input type="file" id="adif_file" style="display: none;" @change="adifFileChange" />
          <label  for="adif_file">
            <div class="btn" id="file_btn">Выбрать ADI файл для загрузки</div>
          </label>
          <br/>
          <b>Файл:</b> <span id="file_name">{{adif.fileName ? adif.fileName : '...'}}</span>
          <br/>
          <b>RDA район:</b> <input type="text" name="rda_input" id="rda_input" v-model.trim="adif.rda" 
                @change="capitalize(adif, 'rda')" :class="{error: validationErrors.rda}">
          <br/>
          <b>Позывной RDA активатора: </b> 
          <input type="text" name="callsign_input" id="callsign_input" 
                v-model.trim="adif.stationCallsign" @change="capitalize(adif, 'stationCallsign')" 
                :class="{error: validationErrors.stationCallsign}">
          <div id="ok_check" v-if="validated">
              <input type="checkbox" name="ok_check" v-model="check"/> Да, всё верно.
          </div>
          <input type="button" name="upload_btn" id="upload_btn" v-if="check"
            value="Загрузить файл в базу данных CFMRDA" class="btn" @click="uploadADIF">
        </div> 

        <div id="uploading_info" v-if="pending">
          Идёт загрузка файла...<br/>
          <img id="uploading" src="images/spinner.gif" border="0" />
        </div>

        <div id="message" v-if="response" v-html="response" :class="{success: success}"
            style="margin: 30px auto 0 auto;"></div>
        
      </div>
    </div>   
</template>

<script>
import storage from '../storage'
import {uploadADIF as apiUploadADIF} from '../api'

import validationMixin from '../validation-mixin'
import capitalizeMixin from '../capitalize-mixin'

const STORAGE_KEY_STATION_CALLSIGN = 'station_callsign'
const reRDA = /[a-z][a-z]-\d\d/i

export default {
  mixins: [validationMixin, capitalizeMixin],
  name: 'upload',
  data () {
    const adif = {
        rda: null,
        stationCallsign: storage.load(STORAGE_KEY_STATION_CALLSIGN),
        file: null,
        token: this.$store.getters.userToken,
        fileName: null
    }
    return {
      pending: false,
      response: null,
      adif: adif,
      validationSchema: 'adif',
      validationData: adif,
      check: false,
      success: false
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
    adifFileChange (e) {
      const files = e.target.files || e.dataTransfer.files
      // const el = e.target
      if (!files.length) {
        return
      }
      const reader = new FileReader()
      const vm = this
      vm.adif.fileName = files[0].name
      const rda = vm.adif.fileName.match(reRDA) 
      if (rda) {
        vm.adif.rda = rda[0].toUpperCase()        
      }

      reader.onload = function (e) {
        vm.adif.file = e.target.result
      }
      reader.readAsDataURL(files[0])
    },
    uploadADIF () {
      storage.save(STORAGE_KEY_STATION_CALLSIGN, this.adif.stationCallsign, 'local')
      this.pending = true
      this.response = null
      this.success = false
      this.check = false
      apiUploadADIF(this.adif)
        .then(() => { 
          this.adif.rda = null
          this.response = 'Файл был загружен успешно.'
          this.success = true
        })
        .catch((e) => { this.response = e.message })
        .finally((r) => { this.pending = false })
    }
  }
}
</script>

