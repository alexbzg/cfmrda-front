<template>
    <div>
        <div class="list list1">
            <div id="qso_in_database" v-if="mscData.qsoCount">
                <span>{{parseInt(mscData.qsoCount).toLocaleString()}}</span> QSO
            </div>
            <table id="check_call">
                <tr>
                <td class="btn_space"></td>
                <td>
                    <input type="text" name="check_call_input" id="check_call_input" 
                        v-capitalize v-model="callsign" @input="callsignChange()">
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
                    <td id="ex_calls" v-if="hunterData && hunterData.newCallsign">
                        <b>{{callsignValid}} is the ex-callsign of {{hunterData.newCallsign}}</b> 
                    </td>
                    <td></td>
                </tr>
            </table>
            <div id="ex_calls_form" v-if="callsignValid && callsignValid === $store.getters.userCallsign && 
                showCallsignsEdit">
                Укажите (<b>через пробел</b>) свои старые <b>постояные</b> позывные после 1991 года. 
                <b>Временные</b> (спец) позывные вносит <b>только владелец</b> лицензии.<br/>
                Позывной нужно указывать <b>без дроби</b>. 
                <span>(Например, R7AB/M или 5B4/R7AB и так будет автоматически засчитываться за R7AB)</span>.<br/>
                <b>После утверждения модератором</b> статистика дополнительных позывных будет объединена 
                с основным позывным RDA Охотника.<br/>
                <span id="help_eng">
                   Type (<b>separating by spaces</b>) your old <b>constant</b> callsign issued after 1991.
                   <b>Temporary</b> (special) callsigns are typed <b>only by the owner</b> of the license.<br/>
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
                        <td>{{hunterRank['9BAND'].count}}</td>
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
                        <td class="no_border">Место в рейтинге</td>
                        <td>{{hunterRank['9BAND'].rank}}</td>
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
                {{showDetails ? 'Свернуть' : 'Подробно по RDA районам для ' + replace0(callsignValid)}}
            </span>

            <table id="rda_table" v-if="showDetails">
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
                                    <td class="band top">МГц</td>
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
                                    <td class="band top">МГц</td>
                                    <td class="mode top">Mode</td>
                                    <td class="call top">QSOs</td>
                                    <td class="uploader top">Uploader</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.activator" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="mode">{{item.mode}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">
                                         <view-upload-link :id="item.uploadId">
                                            {{item.count}}
                                        </view-upload-link>
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



    <rank-table :rank-data-top="rankData" :callsign-rankings="hunterData ? hunterData.rank : null" 
        :callsign="callsignValid" @callsign-click="callsignClick"/>

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
            <tr v-for="(item, idx) in recentUploads" :key="idx">
                <td class="rda">
                    <view-upload-link v-for="(rda, rdaIdx) in item.rda" :key="rdaIdx"
                        :id="rda.id">
                        <span v-for="(rdaEntry, rdaEntryIdx) in rda.rda" :key="rdaEntryIdx">
                            {{rdaEntry}}
                        </span>
                    </view-upload-link>
                </td>
                <td class="activator">
                    <span v-for="(activator, actIdx) in item.activators" :key="actIdx">
                        {{replace0(activator)}}
                    </span>
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

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import {getRankings, getHunterDetails, getRecentUploads, getMscData, oldCallsigns, getQSO} from '../api'
import storage from '../storage'
import {arrayUnique, arraysEqSets} from '../utils'
import {orderedBands, stripCallsign} from '../ham-radio'
import {SET_OLD_CALLSIGNS_ALL} from '../store'

import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

import RankTable from './RankTable.vue'
import Selector from './Selector.vue'
import ViewUploadLink from './ViewUploadLink.vue'


const STORAGE_KEY_CALLSIGN = 'hunter_callsign'

import rdaShort from '../rdaShort.json'

export default {
  BANDS: orderedBands(),
  name: 'Index',
  mixins: [rankDataMixin, replaceZerosMixin],
  components: {RankTable, Selector, ViewUploadLink},
  data () {
    getRankings() 
      .then((data) => {this.rankData = data})
    getRecentUploads() 
      .then((data) => {this.recentUploads = data})
    getMscData() 
      .then((data) => {this.mscData = data})

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

    const callsign = storage.load(STORAGE_KEY_CALLSIGN)
    return {
      callsign: callsign,
      callsignError: false,
      callsignValid: callsign,
      rankData: {},
      rda: rda,
      rdaQso: {hunter: null, activator: null},
      recentUploads: [],
      mscData: {
        qsoCount: null
      },
      hunterData: null,
      role: 'hunter',
      band: 'total',
      mode: 'total',
      rdaValue: null,
      showDetails: false,
      showCallsignsEdit: false,
      callsignsEdit: null,
      callsignsEditError: null,
      message: null
    }
  },
  mounted () {
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
        if (this.callsign === this.userCallsign)
          this.callsignsEdit = this.oldCallsigns.all.join(' ')
        getHunterDetails(this.callsign)
          .then((data) => {
            this.hunterData = data
            if (!data) {
              this.callsignError = true
              this.$callsignErrorTimeout =
                setTimeout(() => { this.callsignError = false }, 10000)
            }
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
      }
    },
    selectorChange(type, value) {
      this[type] = value
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
    ...mapGetters(['userCallsign', 'userToken', 'oldCallsigns']),
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
      const r = {'total': emptyField(), 'bandsSum': emptyField(), '9BAND': emptyField()}
      if (this.hunterData && this.hunterData.rank && this.hunterData.rank[this.role] &&
        this.hunterData.rank[this.role][this.mode]) {
        const data = this.hunterData.rank[this.role][this.mode]
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
    rdaCfm () {
      const r ={}
      if (this.hunterData) {
        if (this.role === 'hunter') {
          if (this.hunterData.rda.hunter) {
            for (const rda in this.hunterData.rda.hunter) {
              for (const item of this.hunterData.rda.hunter[rda]) {
                if (this.rdaFilter(item)) {
                  r[rda] = 'cfm'
                  break
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
                  if (count > 99) {
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
      return r
    }
  }
}
</script>

