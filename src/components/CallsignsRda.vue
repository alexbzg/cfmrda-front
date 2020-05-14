<template>
    <div class="list">
    <div id="our_base">
        <table id="call_search_table">
          <tr @keyup.enter="searchEnabled && doSearch()">
            <td>
                <rda-input id="rda_search" :class="{error: !searchEnabled}" v-model="search.rda">
                </rda-input>
            </td>
            <td>
              <input type="text" id="call_search" v-model="search.callsign" v-capitalize
                :class="{error: !searchEnabled}">
            </td>
            <td>
              <input type="submit" class="btn" value="Search" @click="doSearch()" :disabled="!searchEnabled">
            </td>
          <tr/>
          <tr>
            <td class="note">RDA</td><td class="note">Callsign</td><td></td>
          </tr>
        </table>

        <span v-for="(suffix, idx) in suffixes" :key="idx" @click="doSearch(suffix)" class="other_calls">
            {{suffix}}
        </span>

        <table id="callsign_rda" v-if="callsign || rda">
            <tr>
                <td class="top" colspan="4">
                    <a v-if="callsign && callsign.length" 
                       :href="'https://www.qrz.ru/db/' + callsign"
                       target="_blank" rel="nofollower">{{callsign}}</a>
                    <template v-else>{{rda}}</template>
                </td>
            </tr>
            <tr id="admin_note" v-if="admin && callsign">
                <td id="any_rda">
                    No AutoCFM<br/><input type="checkbox" v-model="meta.disableAutocfm">
                </td>
                <td colspan="2">
                    <textarea v-model="meta.comments"></textarea>
                </td>
                <td id="save_note">
                    <input type="button" name="" value="OK" @click="saveMeta"
                        :disabled="pending">
                </td>
            </tr>

            <tr v-for="(item, idx) in rdaRecords" :key="idx">
                <td class="rda" v-if="!callsign || !callsign.length" @click="doSearch(item.callsign)">{{item.callsign}}</td>
                <td class="rda" v-else>{{item.rda}}</td>
                <td class="time_period">{{item.period}}</td>
                <td class="admin">
                    <template v-if="item.comment"><span>{{item.comment}}</span><br/></template>
                    {{item.source}} {{item.ts}}
                </td>
                <td class="del" >
                    <img src="/images/icon_delete.png" title="Удалить эту строку - Delete this line"
                    v-if="admin" @click="deleteRecord(item)">
                </td>
            </tr>
            <template v-if="admin && callsign && callsign.length">
                <tr>
                    <td colspan="4" class="no_border"><br/><u>Добавление новой записи для <b>{{callsign}}</b></u></td>
                </tr>
                <tr>
                    <td class="rda no_border">
                        <rda-input v-model="newEntry.rda" :class="{error: validationErrors['new.rda']}"
                            placeholder="RDA">
                        </rda-input>
                    </td>
                    <td class="time_period no_border">
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
                    <td class="comment no_border">
                        <input type="text" v-model="newEntry.comment" placeholder="Комментарий" 
                            class="no_latinize">
                    </td>
                </tr>
                <tr>  
                    <td colspan="4" class="no_border">
                        <input type="button" name="save_call_rda" id="save_call_rda" value="Сохранить" class="btn"
                            @click="save()" :disabled="!saveEnabled">
                    </td>
                </tr>
            </template>
        </table>

        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>

        <div id="need_check" v-if="admin && conflict">
            <h4>Необходима проверка</h4>
            <span v-for="(item, idx) in conflict" :key="idx" @click="doSearch(item)">{{item}}</span>
        </div>

    </div>
    </div>
</template>
<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'

import {callsignsRda} from '../api'
import {parseRDA, validCallsignFull} from '../ham-radio'

import ValidationMixin from '../validation-mixin'
import LatinizeMixin from '../latinize-mixin'

import RdaInput from './RDAinput'

export default {
  name: 'CallsignsRda',
  parseRDA: parseRDA,
  components: {RdaInput, Datepicker},
  mixins: [ValidationMixin, LatinizeMixin],
  props: ['extSearchCallsign'],
  data () {
    const newEntry = {
      rda: null,
      dtStart: null,
      dtStop: null,
      periodType: null,
      comment: null
    }
    return {
      search: {
        callsign: null,
        rda: null
      },
      meta: {
        disableAutocfm: false,
        comments: ''
      },
      callsign: null,
      rda: null,
      suffixes: [],
      conflict: null,
      rdaRecords: null,
      pending: false,
      newEntry: newEntry,
      response: null,
      validationSchema: 'callsignsRda',
      validationData: {
        callsign: this.callsign,
        token: this.userToken,
        new: newEntry
      }
    }
  },
  mounted () {
    if (this.extSearchCallsign)
      this.doSearch(this.extSearchCallsign)
    this.validationData.token = this.userToken
    if (this.admin)
      this.getConflict()
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
        this.validated
    }
  },
  watch: {
    userToken (newVal) {
      this.validationData.token = newVal
    },
    callsign (newVal) {
      this.validationData.callsign = newVal
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
    getConflict () {
      this.post({conflict: true, token: this.userToken})
        .then(data => {
          this.conflict = data
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
    saveMeta () {
      this.editPost({meta: this.meta})
    },
    doSearch (searchCallsign) {
      if (searchCallsign && this.search.callsign !== searchCallsign) {
        this.search.callsign = searchCallsign
        this.search.rda = null
      }
      this.callsign = null
      this.rda = null      
      this.rdaRecords = null
      const searchData = {}
      for (const field in this.search) {
        if (this.search[field])
          searchData[field] = this.search[field]
      }
      if (this.admin)
        searchData.token = this.userToken
      if (!this.pending)
        this.post(searchData)
          .then(data => {
            this.suffixes = data.suffixes
            this.rdaRecords = data.rdaRecords
            this.callsign = this.search.callsign
            this.rda = this.search.rda
            if (data.meta) {
              this.meta.disableAutocfm = data.meta.disable_autocfm
              this.meta.comments = data.meta.comments
            } else {
              this.meta.disableAutocfm = false
              this.meta.comments = ''
            }
            const el = document.getElementById('call_search_table')
            el.scrollIntoView()
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
          this.newEntry.comment = null
        })
    }
  }
}
</script>
