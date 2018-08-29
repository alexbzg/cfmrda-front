<template>
    <div class="list list_small">
      <div id="upload">

        <div id="upload_form">
          <span class="red">Загружать файлы ADI необходимо только <b>раздельно</b> по каждому RDA-району!</span><br/><br/>
          <b>RDA район</b><br/>
          <input type="text" name="rda_input" id="rda_input" v-model.trim="adif.rda" 
            @change="capitalize(adif, 'rda')"><br/>
          <b>Позывной RDA экспедиции</b><br/>
          <input type="text" name="callsign_input" id="callsign_input" v-model.trim="adif.stationCallsign"
            @change="capitalize(adif, 'stationCallsign')"><br/>
          <input type="file" id="adif_file" style="display:none" @change="adifFileChange"/>
          <label for="adif_file" name="upload_btn" id="upload_btn" value="Загрузить новый ADI файл" class="btn"
            /><br/>
        </div> 

        <div id="uploading_info" v-if="pending">
          Идёт загрузка файла...<br/>
          <img id="uploading" src="images/spinner.gif" border="0" />
        </div>

        <div id="message" v-if="response.error" v-bind="response.error"></div>

        <div id="check_upload" v-if="response.data">
          <p>
            <u>Проверьте правильность информации</u>:<br/>
            Позывной: <span>{{response.data.stationCallsign}}</span><br/>
            RDA-район: <span>{{response.data.rda}}</span><br/>
            Файл: <span>{{response.data.filename}}</span>
          </p>
          <input type="radio" name="ok_del_input" id="ok_input" v-model="check.result" value="true"> 
          <span>Да, всё верно</span> 
          <input type="radio" name="ok_del_input" id="del_input" v-model="check.result" value="false"> 
          <span>Нет, есть ошибка.</span> Удалить.<br/>
          <input type="button" name="login_btn" id="ok_btn" value="OK" class="btn" @click="commitClick()">
        </div>
      </div>
    </div>   
</template>

<script>
import _ from 'underscore'

import storage from '../storage'
import {uploadADIF, commitADIF} from '../api'

import validationMixin from '../validation-mixin'
import capitalizeMixin from '../capitalize-mixin'

const STORAGE_KEY_STATION_CALLSIGN = 'station_callsign'

export default {
  mixins: [validationMixin, capitalizeMixin],
  name: 'upload',
  data () {
    const adif = {
        rda: null,
        station_callsign: storage.load(STORAGE_KEY_STATION_CALLSIGN),
        file: null,
        token: this.$store.getters.userToken
    }
    return {
      pending: false,
      commitPending: false,
      response: {
        error: null,
        data: null
      },
      check: {
        result: true,
        fileId: null
      },
      adif: adif,
      validationSchema: 'adif',
      validationData: adif
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

      reader.onload = function (e) {
        vm.pending = true
        vm.adif.file = e.target.result
        uploadADIF(vm.adif)
          .then(() => {})
          .finally(() => { vm.pending = false })
      }
      reader.readAsDataURL(files[0])
    }
  },
  commitClick: _.debounce(function () {
    this.commit()
  }, 300, true),
  commit () {
    commitADIF(this.check)
  }
}
</script>

