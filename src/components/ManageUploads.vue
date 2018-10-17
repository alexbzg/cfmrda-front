<template>
  <div class="list">
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
            @edit-pending="editPending" @server-error="serverError">
            <img src="images/icon_close.png" title="Закрыть результаты поиска" 
                @click="showSearchResult = false">
        </uploads-table>
        <uploads-table :admin="admin" :uploads="uploads" :pending="pending"
            @edit-pending="editPending" @server-error="serverError">
        </uploads-table>
    </table>

    <div id="wait" v-show="pending">
      База данных обновляется. Подождите...<br/>
      <img src="images/spinner.gif">
    </div>

  </div>

</template>
<script>
import {mapGetters} from 'vuex'
import {rdaValues, parseRDA} from '../ham-radio'

import {GET_UPLOADS_ACTION} from '../store'

import Datepicker from 'vuejs-datepicker'
import UploadsTable from './UploadsTable'

import CapitalizeMixin from '../capitalize-mixin'
import ValidationMixin from '../validation-mixin'

export default {
  name: 'ManageUploads',
  mixins: [CapitalizeMixin, ValidationMixin],
  components: {Datepicker, UploadsTable},
  data () {
    this.$store.dispatch(GET_UPLOADS_ACTION)
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
      showSearchResult: false
    }
  },
  computed: {
    ...mapGetters(['admin', 'uploads']),
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
      this.capitalize(this.search, field)
      if (this.search[field] !== null && !this.search[field].length)
        this.search[field] = null
      else if (field === 'rda') {
        if (this.search.rda && this.search.rda.length > 3 && !rdaValues.includes(this.search.rda)) {
          const rda = parseRDA(this.search.rda)
          if (rda)
            this.search.rda = rda
        }
      }
    },
    editPending (pending) {
      this.pending = pending
    },
    serverError (e) {
      this.errorMessage = e.message
    }
  }
}
</script>
