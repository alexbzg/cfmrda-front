<template>
    <div class="list">
    <div id="our_base">

        <input type="text" id="call_search" v-model="searchCallsign" v-capitalize
            :class="{error: !searchEnabled}" @keyup.enter="searchEnabled && doSearch()" > 
        <input type="submit" class="btn" value="Искать" @click="doSearch()"
            :disabled="!searchEnabled">
        <br/>
        <span v-for="(suffix, idx) in suffixes" :key="idx" @click="doSearch(suffix)" class="other_calls">
            {{suffix}}
        </span>

        <table id="callsign_rda" v-if="callsign">
            <tr>
                <td class="top" colspan="5">{{callsign}}</td>
            </tr>
            <tr v-for="(item, idx) in rdaRecords" :key="idx">
                <td class="rda">{{item.rda}}</td>
                <td class="time_period">{{item.period}}</td>
                <td class="admin">{{item.source}} <span>{{item.ts}}</span></td>
                <td class="del" >
                    <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"
                    v-if="admin" @click="deleteRecord(item)">
                </td>
            </tr>
            <tr v-if="admin && callsign">
                <td class="rda no_border">
                    <rda-input v-model="newEntry.rda" :class="{error: !$options.parseRDA(newEntry.rda)}">
                    </rda-input>
                </td>
                <td class="time_period no_border">
                <u>Добавление новой записи для <b>{{callsign}}</b> в базу</u><br/>
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
                <td colspan="2" class="no_border">
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
  data () {
    return {
      searchCallsign: null,
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
  computed: {
    ...mapGetters(['userToken', 'admin']),
    searchEnabled () {
      return validCallsignFull(this.searchCallsign)
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
      if (searchCallsign && this.searchCallsign !== searchCallsign)
        this.searchCallsign = searchCallsign
      this.callsign = null
      this.post({'callsign': this.searchCallsign})
        .then(data => {
          this.suffixes = data.suffixes
          this.rdaRecords = data.rdaRecords
          this.callsign = this.searchCallsign
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
