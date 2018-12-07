<template>
  <div>
    <table id="admin" v-show="!pending">
        <tr>
            <td class="menu allow" v-if="admin">Допущено</td>
            <td class="menu rda">RDA</td>
            <td class="menu callsign">Позывной</td>
            <td class="menu callsign">Зачет</td>
            <td class="menu qsos">QSOs</td>
            <td class="menu period">Период активации</td>
            <td class="menu uploader" v-if="admin">Загрузил</td>
            <td class="menu upload_date">Дата загрузки</td>
            <td class="menu del"></td>
        </tr>
        <tr id="search" @keyup.enter="showSearchResult = validated">
            <td class="allow" v-if="admin"></td>
            <td class="rda">
                <input type="text" name="rda_input" id="rda_input" 
                    v-model="search.rda" :class="{error: validationErrors.rda}"
                    @input="searchFieldChange('rda')">
            </td>
            <td class="callsign">
                <input type="text" name="call_input" id="call_input" v-model="search.station"
                    :class="{error: validationErrors.station}" @input="searchFieldChange('station')"/>
            </td>
            <td class="callsign">
            </td>
            <td class="qsos"></td>
            <td class="period"></td>
            <td class="uploader" v-if="admin">
                <input type="text" name="uploader_input" id="uploader_input" v-model="search.uploader"
                    :class="{error: validationErrors.uploader}" @input="searchFieldChange('uploader')">
            </td>
            <td class="upload_date">
                <datepicker v-model="search.uploadDate" :clear-button="true"></datepicker>
            </td>
            <td class="del">
                <input type="button" name="search_btn" id="search_btn" value="Найти" class="btn"
                    :disabled="!validated" @click="showSearchResult = true">
            </td>
        </tr>
        <uploads-table :admin="admin" :uploads="searchResult" v-if="searchResult" :pending="pending"
            @edit-uploads="editUploads">
            <img src="images/icon_close.png" title="Закрыть результаты поиска" 
                @click="showSearchResult = false">
        </uploads-table>
        <uploads-table :admin="admin" :uploads="uploads" :pending="pending" @edit-uploads="editUploads">
        </uploads-table>
    </table>

    <div id="wait" v-show="pending">
      PSE QRX...<br/>
      <img src="images/spinner.gif">
    </div>

  </div>

</template>
<script>
import {rdaValues, parseRDA} from '../ham-radio'

import {getUploads} from '../api'

import Datepicker from 'vuejs-datepicker'
import UploadsTable from './UploadsTable'

import ValidationMixin from '../validation-mixin'

export default {
  name: 'ManageUploads',
  mixins: [ValidationMixin],
  props: ['admin'],
  components: {Datepicker, UploadsTable},
  data () {
    this.loadList()
    const search = {
        rda: null,
        station: null,
        uploader: null,
        uploadDate: null
      }
    return {
      search: search,
      pending: false,
      errorMessage: null,
      validationData: search,
      validationSchema: "uploadsSearch",
      showSearchResult: false,
      uploads: []
    }
  },
  computed: {
    searchResult () {
      if (this.showSearchResult && this.validated) 
        return  this.uploads.filter((upload) => {
          if (this.search.rda && this.search.rda.length && 
            ((upload.rda && !upload.rda.includes(this.search.rda)) || !upload.rda))
            return false
          if (this.search.station && this.search.station.length &&
            !this.searchCallsign(this.search.station, upload.stations))
            return false
          if (this.search.uploader && this.search.uploader.length &&
            !this.searchCallsign(this.search.uploader, [upload.uploader]))
            return false
          if (this.search.uploadDate &&
            Date.parse(this.search.uploadDate.toDateString()) != Date.parse(upload.uploadDate))
            return false
          return true
        })
      else
        return null
    }
  },
  methods: {
    post (data) {
      data.token = this.$store.getters.userToken
      if (this.admin)
        data.admin = true
      return getUploads(data)
        .catch((e) => {
          this.errorMessage = e
          throw e
        })
    },
    loadList () {
      this.post({})
        .then((data) => {this.uploads = data})
    },
    editUploads(data) {
      if (this.pending) 
        return
      this.pending = true
      this.post(data)
        .then(() => {this.loadList()})
        .finally(() => {
          this.pending = false
        })
     
    },
    searchCallsign (needle, hay) {
      if (hay) {
        if (needle.includes('*')) {
          const reSearch = new RegExp(needle.replace(/\//g, '\\/').replace(/\*/g,'.*'))
          return hay.find((item) => { return reSearch.test(item) })
        } else 
          return hay.includes(needle)
      } else
        return false
    },
    searchFieldChange (field) {
      if (this.search[field] !== null)
        this.search[field] = this.search[field].toUpperCase()
      if (this.search[field] !== null && !this.search[field].length) 
        this.search[field] = null
      else if (field === 'rda') {
        if (this.search.rda && this.search.rda.length > 3 && !rdaValues.includes(this.search.rda)) {
          const rda = parseRDA(this.search.rda)
          if (rda)
            this.search.rda = rda
        }
      }
    }
  }
}
</script>
