<template>
    <div>
        <div class="list list1">

            <div id="qso_in_database" v-if="mscData.qsoCount">
                <span>{{mscData.statsDate ?  'stats date/time ' + mscData.statsDate : 'stats update in progress'}}</span>
                {{parseInt(mscData.qsoCount).toLocaleString()}} QSO
            </div>

            <table id="check_call">
                <tr>
                    <td class="btn_space"></td>
                    <td>
                        <input type="text" name="check_call_input" id="check_call_input"
                            v-capitalize v-model="callsign" @input="callsignChange()"
                            @keydown.enter="loadHunter()">
                        <div class="preloader" v-if="loading">
                            <img src="images/spinner3.gif"/>
                        </div>
                    </td>
                    <td class="btn_space">
                        <input type="button" name="check_call_btn" value="OK" class="btn"
                            @click="loadHunter()">
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td id="ex_calls" v-if="hunterData &&
                        (hunterData.oldCallsigns.length ||
                        (callsign && callsign === callsignValid &&
                        callsignValid === $store.getters.userCallsign))">
                        <b>ex-callsigns</b>:
                        <span v-for="item in hunterData.oldCallsigns" :key="item">{{item}} </span>
                        <span id="ex_calls_link" v-if="(callsign && callsign === $store.getters.userCallsign)"
                            @click="showCallsignsEdit = !showCallsignsEdit">
                            ( add/edit )
                        </span>
                    </td>
                    <td></td>
                </tr>
            </table>
            <div id="ex_calls_form" v-if="callsignValid && callsignValid === $store.getters.userCallsign &&
                showCallsignsEdit">
                Укажите (<b>через пробел</b>) свои старые <b>постояные</b> позывные после 1991 года.<br/>
                Временные (спец) позывные вносите, если <b>только</b> вы работали этим позывным.<br/>
                Позывной нужно указывать <b>без дроби</b>.
                <span style="font-size: 14px;">(Например, R7AB/M или 5B4/R7AB и так будет автоматически засчитываться за R7AB)</span>.<br/>
                <b>После утверждения модератором</b> статистика дополнительных позывных будет объединена
                с основным позывным RDA Охотника.<br/>
                <span id="help_eng">
                   Type (<b>separating by spaces</b>) your old <b>constant</b> callsign issued after 1991.
                   Enter temporary (special) callsigns if <b> only </b> you worked as this callsign.<br/>
                   The callsign must be given <b>without a fraction</b>.
                   <span>(For example, R7AB/M ок 5B4/R7AB will be automatically counted for R7AB anyway)</span>
                   .<br/>
                   The statistics of additional callsigns will be merged with the main callsign of RDA Hunter
                   <b>after approval by the moderator</b>.
                </span>
                <textarea v-model="callsignsEdit" v-capitalize></textarea><br/>
                <input type="button" name="check_call_btn" value="OK" class="btn" @click="postCallsigns">
                <div id="callsign_edit_error" v-if="callsignsEditError">{{callsignsEditError}}</div>
            </div>


            <div id="callsign_error" v-if="callsignError">
                No callsign in the database
            </div>

            <table class="select_view" v-if="callsignValid && hunterData">
                <selector @selector-change="selectorChange">
                </selector>
                <tbody>
                    <tr>
                        <td class="no_border">AutoCFM RDA</td>
                        <td>{{hunterRank[_9band].count}}</td>
                        <td>{{hunterRank.bandsSum.count}}</td>
                        <td class="col_no_border"> </td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.total.count}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank[_band].count}}</td>
                    </tr>
                    <tr>
                        <td class="no_border">Место в рейтинге<br/><span class="note">Ranking place</span></td>
                        <td>{{hunterRank[_9band].rank}}</td>
                        <td>{{hunterRank.bandsSum.rank}}</td>
                        <td class="col_no_border"></td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.total.rank}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank[_band].rank}}</td>
                    </tr>
                </tbody>
            </table>

            <span class="show_details" @click="showDetails = !showDetails"
                v-if="callsignValid && hunterData">
                {{showDetails ? 'Свернуть - Close' : 'Подробно по RDA районам для ' + replace0(callsignValid) + ' &nbsp;&nbsp; - &nbsp;&nbsp; Details on RDA regions for ' + replace0(callsignValid) + ' '}}
            </span>

            <table id="rda_table" v-if="showDetails">
            <tr><td colspan="2" id="csv_link">
                <a :href="'/aiohttp/download/qso/' + callsignValid + '/csv'"
                    target="_blank" rel="noopener">
                    <img src="/images/download.png" title="Download your CSV file" />
                </a>
                <a href="/html/csv.html" target="_blank" rel="noopener">
                    <img src="/images/icon_compare_csv.png" title="Compare two CSV files" />
                </a>
                <a href="/html/csv_search.html" target="_blank" rel="noopener">
                    <img src="/images/icon_search_csv.jpg" title="Search CFMD RDA in the CSV file" />
                </a>
            </td></tr>

                <template v-for="(group, idxGr) in rda">
                    <tr :key="idxGr">
                        <td class="rda_letters">{{group.group}}</td>
                        <td>
                            <div v-for="(val, idxVal) in group.values" :key="idxVal" class="rda"
                                :class="{cfm: rdaCfm[val.value] === 'cfm',
                                    partial: rdaCfm[val.value] === 'partial'}"
                                @click="setRdaValue(rdaValue === val ? null : val)">
                                {{val.displayValue}}
                            </div>
                        </td>
                    </tr>
                    <tr v-if="rdaValue && rdaValue.group === group.group && (rdaQso.hunter || rdaQso.activator)"
                        :key="idxGr + '-actVal'">
                        <td colspan="2">


                            <div id="close_stat1rda">
                                <img src="images/icon_close.png" title="Close" @click="setRdaValue(null)">
                            </div>

                            <table id="stat1rda_hunter" v-if="role === 'hunter' && rdaQso.hunter">
                                <tr>
                                    <td id="hunter_activator" colspan="6">RDA hunter</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{rdaValue.value}}</td>
                                    <td class="time top">GMT</td>
                                    <td class="mode top">Mode</td>
                                    <td class="band top">MHz</td>
                                    <td class="call top">CFM QSO</td>
                                    <td class="uploader top">Uploader</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.hunter" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="time">{{item.time}}</td>
                                    <td class="mode">{{item.mode}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">
                                        <view-upload-link :id="item.uploadId">
                                            {{item.stationCallsign}}
                                        </view-upload-link>
                                    </td>
                                    <td class="uploader">{{item.uploader}}
                                        <span v-if="item.uploadType !== 'adif'">({{item.uploadType}})</span>
                                    </td>
                                </tr>
                            </table>

                            <table id="stat1rda_activator" v-if="rdaQso.activator">
                                <tr>
                                    <td id="hunter_activator" colspan="6">RDA activator</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{replace0(rdaValue.value)}}</td>
                                    <td class="mode top">Mode</td>
                                    <td class="band top">MHz</td>
                                    <td class="call top">QSOs</td>
                                    <td class="uploader top">Uploader</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.activator" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="mode">{{item.mode}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">
                                         <view-upload-link :id="item.uploadId" v-if="item.uploadId">
                                            {{item.count}}
                                        </view-upload-link>
                                        <span class="qso_count" v-else>
                                            {{item.count}}
                                        </span>
                                    </td>
                                    <td class="uploader">
                                        {{item.uploader}}
                                        <span v-if="item.uploadType !== 'adif'">({{item.uploadType}})</span>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </template>
            </table>

        </div>


    <div id="banner" v-async-html="'banner/index'">
    </div>

    <ann></ann>

    <rank-table :rank-data-top="rankData" :callsign-rankings="hunterData ? hunterData.rank : null"
        :callsign="callsignValid" :top-loading="rankingsLoading" @callsign-click="callsignClick"
        :callsign-loading="loading"
        :callsign-country="hunterData ? hunterData.country : null"
        />

    <div class="list" v-if="mscData.userActivity">

        <div id="qsl_check_list">
            <h4>Today's CFM RDA stats</h4>
            <table id="cfm_rda_check">
                <tr>
                    <td class="top" rowspan="2"></td>
                    <td class="top" colspan="2">QSL CFM</td>
                </tr>
                <tr>
                    <td class="top top2">
                        на проверке<br/>
                        {{mscData.userActivityTotal.qslWait}}
                    </td>
                    <td class="top top2">
                        проверено<br/>
                        {{mscData.userActivityTotal.qslToday}}
                    </td>
                </tr>
                <tr v-for="item in mscData.userActivity" :key="item.callsign">
                    <td class="callsign">{{item.callsign}}</td>
                    <td class="">{{item.qslWait}}</td>
                    <td class="">{{item.qslToday}}</td>
                </tr>
            </table>
        </div>
    </div>


    <div class="list">
      <h4>Latest uploads</h4>
      Статистика CFM RDA пересчитывается раз в сутки после 00:00 мск
        <table id="last_uploads">
            <tr>
                <td class="rda menu">RDA</td>
                <td class="activator menu">Activator</td>
                <td class="uploader menu">Uploader</td>
                <td class="uploaded menu">Uploaded</td>
            </tr>
            <tr v-for="(item, idx) in recentUploads" :key="idx"
                :class="{not_activator: item.activators && item.activators.filter(act => !act.includes(item.uploader)).length}">
                <td class="rda">
                    <view-upload-link v-for="(rda, rdaIdx) in item.rda" :key="rdaIdx"
                        :id="rda.id">
                        <span v-for="(rdaEntry, rdaEntryIdx) in rda.rda" :key="rdaEntryIdx">
                            {{rdaEntry}}
                        </span>
                    </view-upload-link>
                </td>
                <td class="activator">
                    <template v-if="item.uploadType !== 'LoTW'">
                        <span v-for="(activator, actIdx) in item.activators" :key="actIdx">
                            {{replace0(activator)}}
                        </span>
                    </template>
                </td>
                <td class="uploader">
                    {{replace0(item.uploader)}}
                    <span v-if="item.uploadType !== 'adif'">({{item.uploadType}})</span>
                </td>
                <td class="uploaded">{{item.uploadDate}}
                    <span>{{item.uploadTime}}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="list">
        <div id="deleted_logs">
            <h4>Latest deleted logs</h4>
            <table id="last_uploads">
                <tr>
                    <td class="rda menu">RDA</td>
                    <td class="activator menu">Activator</td>
                    <td class="uploader menu">Deleted by</td>
                    <td class="uploaded menu">Date</td>
                </tr>
                <tr v-for="(item, idx) in deletedUploads" :key="idx">
                    <td class="rda">
                        <span v-for="(rda, rdaIdx) in item.rda" :key="'rda_' + rdaIdx">{{rda}} </span>
                    </td>
                    <td class="activator">
                        <span v-for="(activator, actIdx) in item.activators" :key="'act_' + actIdx" v-if="actIdx < 10">
                            {{replace0(activator)}}
                        </span>
                        <span v-if="item.activators && item.activators.length > 10">...</span>
                    </td>
                    <td class="uploader">{{item.delBy}}</td>
                    <td class="uploaded">{{item.delDate}}<span>{{item.delTime}}</span></td>
                </tr>
            </table>
        </div>
    </div>


    </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

import {getRankings, getHunterDetails, getRecentUploads, oldCallsigns, getQSO, getDeletedUploads} from '../api'
import storage from '../storage'
import {arrayUnique, arraysEqSets} from '../utils'
import {orderedBands, stripCallsign} from '../ham-radio'
import {SET_OLD_CALLSIGNS_ALL} from '../store'

import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'
import latinizeMixin from '../latinize-mixin'

import RankTable from './RankTable.vue'
import Selector from './Selector.vue'
import ViewUploadLink from './ViewUploadLink.vue'
import Ann from './Ann.vue'


const STORAGE_KEY_CALLSIGN = 'hunter_callsign'

import rdaShort from '../rdaShort.json'

export default {
  BANDS: orderedBands(),
  name: 'Index',
  mixins: [rankDataMixin, replaceZerosMixin, latinizeMixin],
  components: {RankTable, Selector, ViewUploadLink, Ann},
  last_req_id: 0,
  pending: {},
  data () {
    const rda = []
    for (const group of rdaShort) {
      const fullGroup = {group: group.group, values: []}
      for (let c = 1; c <= group.last; c++) {
        if ('skip' in group && group.skip.includes(c)) {
          continue
        }
        const displayValue = c < 10 ? '0' + c : c
        const value = {
          value: group.group + '-' + displayValue,
          group: group.group,
          displayValue: displayValue
        }
        fullGroup.values.push(value)
      }
      rda.push(fullGroup)
    }

    const callsign = this.$route.query.callsign ? this.$route.query.callsign :
        storage.load(STORAGE_KEY_CALLSIGN)

    return {
      callsign: callsign,
      callsignError: false,
      callsignValid: callsign,
      rankData: {
        world: null,
        country: null
      },
      rda: rda,
      rdaQso: {hunter: null, activator: null},
      recentUploads: [],
      deletedUploads: [],
      hunterData: null,
      role: 'hunter',
      band: 'total',
      mode: 'total',
      specialMode: null,
      rdaValue: null,
      showDetails: false,
      showCallsignsEdit: false,
      callsignsEdit: null,
      callsignsEditError: null,
      message: null,
      loading: false,
      rankingsLoading: {
        'world': false,
        'country': false
      }
    }
  },
  mounted () {
    this.rankingsLoading.world = true
    getRankings()
      .then((data) => {
        this.rankData.world = data
        this.rankingsLoading.world = false
      })
    getRecentUploads()
      .then((data) => {this.recentUploads = data})
    getDeletedUploads()
      .then((data) => {this.deletedUploads = data})
    this.loadHunter()
  },
  beforeDestroy () {
    if (this.$callsignErrorTimeout) {
      clearTimeout(this.$callsignErrorTimeout)
    }
  },
  methods: {
    postCallsigns () {
      if (this.callsignsEdit && this.callsignsEdit.length) {
        const callsigns = arrayUnique(this.callsignsEdit.split(/[;,\s]+/).map(stripCallsign
          ).filter((c) => {return c !== this.userCallsign && c !== null}))
        this.callsignsEdit = callsigns.join(' ')
        if (!arraysEqSets(callsigns, this.oldCallsigns.all)) {
          this.callsignsEditError = null
          oldCallsigns({token: this.userToken, callsigns: callsigns})
            .then(() => {
              this.showCallsignsEdit = false
              this.$store.commit(SET_OLD_CALLSIGNS_ALL, callsigns)
            })
            .catch((e) => {
              this.callsignsEditError = e
            })
        }
      }
    },
    setCallsignValid () {
      storage.save(STORAGE_KEY_CALLSIGN, this.callsign, 'local')
      this.callsignValid = this.callsign
    },
    loadHunter () {
      const callsign = stripCallsign(this.callsign)
      if (callsign) {
        this.setCallsignValid()
        this.hunterData = null
        this.showDetails = false
        this.callsignError = false
        this.rankData.country = null
        if (this.callsign === this.userCallsign)
          this.callsignsEdit = this.oldCallsigns.all.join(' ')
        for (const req_id in this.$options.pending) {
          this.$options.pending[req_id].cancel = true
        }
        const req_id = this.$options.last_req_id++
        this.loading = true
        this.$options.pending[req_id] = {}
        getHunterDetails(this.callsign)
          .then((data) => {
            if (this.$options.pending[req_id].cancel) {
              return
            }
            this.hunterData = data
            this.updateRdaCfm()
            if (data) {
                if (data.newCallsign) {
                  this.callsign = data.newCallsign
                  this.setCallsignValid()
                }
                if (data && data.country) {
                  this.rankingsLoading.country = true
                  getRankings(data.country.id)
                    .then((data) => {
                      this.rankData.country = data
                      this.rankingsLoading.country = false
                  })
                }
            } else {
              this.callsignError = true
              this.$callsignErrorTimeout =
                setTimeout(() => { this.callsignError = false }, 10000)
            }
          })
        .finally(() => {
          delete this.$options.pending[req_id]
          for (const req_id in this.$options.pending) {
            if (!this.$options.pending[req_id].cancel) {
              return
            }
          }
          this.loading = false
        })
      }
    },
    setRdaValue (value) {
      this.rdaValue = value
      if (value) {
        getQSO([this.callsign, this.role, value.value, this.isMeta(this.mode) ? '' : this.mode,
          this.isMeta(this.band) ? '' : this.band])
          .then((data) => {
            this.rdaQso = data
          })
      } else {
        this.rdaQso = {}
      }
    },
    selectorChange(type, value) {
      if (type === 'special') {
        this.specialMode = value
        if (value) {
          this.role = 'hunter'
          this.band = 'total'
          this.mode = 'total'
        }
      } else {
        this[type] = value
        if (this.specialMode) {
          this.specialMode = null
        }
      }
      this.updateRdaCfm()
      this.setRdaValue(null)
    },
    updateRdaCfm () {
      const r = {}
      this.loading = true
      if (this.hunterData) {
        if (this.role === 'hunter') {
          if (this.hunterData.rda.hunter) {
            for (const rda in this.hunterData.rda.hunter) {
              if (this.specialMode === '9BAND-X') {
                const bands = new Set()
                for (const item of this.hunterData.rda.hunter[rda]) {
                  bands.add(item.band)
                  if (bands.size === 9) {
                    r[rda] = 'cfm'
                    break
                  }
                }
                if (!r[rda] && bands.size > 0) {
                  r[rda] = 'partial'
                }
              } else {
                for (const item of this.hunterData.rda.hunter[rda]) {
                  if (this.rdaFilter(item)) {
                    r[rda] = 'cfm'
                    break
                  }
                }
              }
            }
          }
        }
        else {
          if (this.hunterData.rda.activator) {
            for (const rda in this.hunterData.rda.activator) {
              let count = 0
              for (const item of this.hunterData.rda.activator[rda]) {
                if (this.rdaFilter(item)) {
                  count += item.count
                  if (count > this.activatorThreshold) {
                    r[rda] = 'cfm'
                    break
                  }
                }
              }
              if (!r[rda] && count > 0) {
                r[rda] = 'partial'
              }
            }
          }
        }
      }
      this.loading = false
      this.rdaCfm = r
    },
    callsignClick (callsign) {
      this.callsign = callsign
      this.setCallsignValid()
      this.loadHunter()
    },
    callsignChange () {
      this.callsignValid = null
      this.hunterData = null
      this.showDetails = false
      this.callsignError = false
      const callsign = stripCallsign(this.callsign)
      if (callsign)
        this.callsign = callsign
    }
  },
  computed: {
    ...mapState(['mscData']),
    ...mapGetters(['userCallsign', 'userToken', 'oldCallsigns']),
    _9band () {
      return this.specialMode === '9BAND-X' ? '9BAND-X' : '9BAND'
    },
    rdaFilter () {
      const allModes = this.isMeta(this.mode)
      const allBands = this.isMeta(this.band)
      return (item) => { return (allModes || item.mode === this.mode) &&
        (allBands || item.band === this.band)}
    },
    hunterRank () {
      function emptyField () {
        return {count: 0, rank: '-' }
      }
      const r = {
        'total': emptyField(), 
        'bandsSum': emptyField(), 
        '9BAND': emptyField(),
        '9BAND-X': emptyField()
      }
      if (this.hunterData && this.hunterData.rank && this.hunterData.rank.world &&
        this.hunterData.rank.world[this.role] && this.hunterData.rank.world[this.role][this.mode]) {
        const data = this.hunterData.rank.world[this.role][this.mode]
        for (const field in r) {
            if (data[field]) {
            r[field] = data[field][0]
            }
        }
        for (const band of this.$options.BANDS) {
            r[band] = data[band] ? data[band][0] : emptyField()
        }
      } else {
        for (const band of this.$options.BANDS) {
            r[band] = emptyField()
        }
      }
      return r
    },
    activatorThreshold () {
      return this.isMeta(this.band) ? 99 : 49
    }
  }
}
</script>

