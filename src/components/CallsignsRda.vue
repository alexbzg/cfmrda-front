<template>
    <div class="list">
    <div id="our_base">
        <table id="call_search_table">
          <tr>
            <td>
                <rda-input id="rda_search" :class="{error: !searchEnabled}" v-model="search.rda"
                    @keyup.enter="searchEnabled && doSearch()">
                </rda-input>
            </td>
            <td>
              <input type="text" id="call_search" v-model="search.callsign" v-capitalize
                :class="{error: !searchEnabled}" @keyup.enter="searchEnabled && doSearch()" >
            </td>
            <td>
              <input type="submit" class="btn" value="Search" @click="doSearch()"
            :disabled="!searchEnabled">
            </td>
          <tr/><tr>
            <td class="note">RDA</td><td class="note">Callsign</td><td></td>
          </tr>
        </table>

        <span v-for="(suffix, idx) in suffixes" :key="idx" @click="doSearch(suffix)" class="other_calls">
            {{suffix}}
        </span>

        <table id="callsign_rda" v-if="rdaRecords">
            <tr v-if="callsign && callsign.length">
                <td class="top" colspan="5">{{callsign}}</td>
            </tr>
            <tr v-for="(item, idx) in rdaRecords" :key="idx">
                <td class="callsign" v-if="!callsign || !callsign.length">{{item.callsign}}</td>
                <td class="rda">{{item.rda}}</td>
                <td class="time_period">{{item.period}}</td>
                <td class="admin">{{item.source}} <span>{{item.ts}}</span></td>
                <td class="del" >
                    <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"
                    v-if="admin" @click="deleteRecord(item)">
                </td>
            </tr>
            <tr v-if="admin && callsign && callsign.length">
                <td class="rda no_border">
                    <rda-input v-model="newEntry.rda" :class="{error: !$options.parseRDA(newEntry.rda)}">
                    </rda-input>
                </td>
                <td class="time_period no_border">
                <u>Добавление новой записи для <b>{{callsign}}</b></u><br/>
                    <select v-model="newEntry.periodType" @change="periodTypeChange"
                        :class="{error: !newEntry.periodType}">
                        <option disabled value="null">Выберите период</option>
                        <option value="all">Всё время</option>
                        <option value="till">До даты</option>
                        <option value="from">После даты</option>
                        <option value="period">С... по...</option>
                    </select>
                    <datepicker v-if="newEntry.periodType === 'from' || newEntry.periodType === 'period'"
                        v-model="newEntry.dtStart" :input-class="{error: !newEntry.dtStart}" :use-utc="true">
                    </datepicker>
                    <datepicker v-if="newEntry.periodType === 'till' || newEntry.periodType === 'period'"
                        v-model="newEntry.dtStop" :input-class="{error: !newEntry.dtStop}" :use-utc="true">
                    </datepicker>
                </td>
                <td class="comment no_border"><input type="text" value="" placeholder="Комментарий"></td>
                    </tr>
                    <tr>  
                <td colspan="5" class="no_border">
                    <input type="button" name="save_call_rda" id="save_call_rda" value="Сохранить" class="btn"
                        @click="save()" :disabled="!saveEnabled">
                </td>
            </tr>
        </table>

        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>

    </div>
    </div>
</template>
<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'

import {callsignsRda} from '../api'
import {parseRDA, validCallsignFull} from '../ham-radio'

import RdaInput from './RDAinput'


export default {
  name: 'CallsignsRda',
  parseRDA: parseRDA,
  components: {RdaInput, Datepicker},
  props: ['extSearchCallsign'],
  data () {
    return {
      search: {
        callsign: null,
        rda: null
      },
      callsign: null,
      suffixes: [],
      rdaRecords: [],
      pending: false,
      newEntry: {
        rda: null,
        dtStart: null,
        dtStop: null,
        periodType: null
      },
      response: null
    }
  },
  mounted () {
    if (this.extSearchCallsign)
      this.doSearch(this.extSearchCallsign)
  },
  computed: {
    ...mapGetters(['userToken', 'admin']),
    searchEnabled () {
      return validCallsignFull(this.search.callsign) || parseRDA(this.search.rda)
    },
    saveEnabled () {
      const ne = this.newEntry
      const pt = ne.periodType
      return (pt === 'all' || ((ne.dtStart || pt == 'till') && (ne.dtStop || pt === 'from'))) &&
        parseRDA(ne.rda)
    }
  },
  methods: {
    periodTypeChange () {
      const pt = this.newEntry.periodType
      if (!pt || pt === 'all' || pt === 'from')
        this.newEntry.dtStop = null
      if (!pt || pt === 'all' || pt === 'till')
        this.newEntry.dtStart = null
    },
    post (data) {
      if (this.pending)
        return;
      this.pending = true
      this.response = null
      return callsignsRda(data)
        .catch((e) => {
          this.success = false
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    },
    editPost (data) {
      data.callsign = this.callsign
      data.token = this.userToken
      return this.post(data)
        .then(rsp => {
          this.rdaRecords = rsp.rdaRecords
        })
    },
    doSearch (searchCallsign) {
      if (searchCallsign && this.search.callsign !== searchCallsign)
        this.search.callsign = searchCallsign
      this.callsign = null
      const searchData = {}
      for (const field in this.search) {
        if (this.search[field])
          searchData[field] = this.search[field]
      }
      this.post(searchData)
        .then(data => {
          this.suffixes = data.suffixes
          this.rdaRecords = data.rdaRecords
          this.callsign = this.search.callsign
        })
    },
    deleteRecord (item) {
      if (confirm('Вы действительно хотите удалить эту запись?')) {
        this.editPost({'delete': item.id})
      }
    },
    save() {
      this.editPost({'new': this.newEntry})
        .then(() => {
          this.newEntry.rda = null
          this.newEntry.dtStart = null
          this.newEntry.dtStop = null
          this.newEntry.periodType = null
        })
    }
  }
}
</script>
