<template>
    <div>
        <div class="list list1">
            <div id="qso_in_database"><span>{{parseInt(mscData.qsoCount).toLocaleString()}} QSO</span> in our database</div>
            <table id="check_call">
                <tr>
                <td class="btn_space"></td>
                <td>
                    <input type="text" name="check_call_input" id="check_call_input" 
                        v-model="callsign" @change="callsignChange()">
                </td>
                <td class="btn_space">
                    <input type="button" name="check_call_btn" value="OK" class="btn"
                        @click="loadHunter()">
                </td>
                </tr>
                <tr>
                    <td></td><td>callsign</td><td></td>
                </tr>
            </table>

            <div id="callsign_error" v-if="callsignError">
                No callign in the database
            </div>

            <table class="select_view" v-if="callsignValid && hunterData">
                <selector @selector-change="selectorChange">
                </selector>
                <tbody>
                    <tr>
                        <td class="no_border">AutoCFM RDAs</td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.total.count}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank[_band].count}}</td>
                        <td :class="{selected: band === 'bandsSum'}">
                            {{hunterRank.bandsSum.count}}</td>
                    </tr>
                    <tr>
                        <td class="no_border">Место в рейтинге</td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.total.rank}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank[_band].rank}}</td>
                        <td :class="{selected: band === 'bandsSum'}">
                            {{hunterRank.bandsSum.rank}}</td>
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
                                @click="rdaValue === val ? rdaValue = null : rdaValue = val">
                                {{val.displayValue}}
                            </div>
                        </td>
                    </tr>
                    <tr v-if="rdaValue && rdaValue.group === group.group && (rdaQso.hunter || rdaQso.activator)"
                        :key="idxGr + '-actVal'">
                        <td colspan="2">
                            <table id="stat1rda_hunter" v-if="role === 'hunter' && rdaQso.hunter">
                                <tr>
                                    <td id="hunter_activator" colspan="5">RDA hunter</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{rdaValue.value}}</td>
                                    <td class="time top">GMT</td>
                                    <td class="band top">МГц</td>
                                    <td class="call top">CFM QSO</td>
                                    <td class="uploader top">Uploader</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.hunter" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="time">{{item.time}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">
                                        <view-upload-link :id="item.uploadId">
                                            {{item.stationCallsign}}
                                        </view-upload-link>
                                    </td>
                                    <td class="uploader">{{item.uploader}}</td>
                                </tr>
                            </table>

                            <table id="stat1rda_activator" v-if="rdaQso.activator">
                                <tr>
                                    <td id="hunter_activator" colspan="5">RDA activator</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{replace0(rdaValue.value)}}</td>
                                    <td class="band top">МГц</td>
                                    <td class="call top">QSOs</td>
                                    <td class="uploader top">Uploader</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.activator" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">
                                         <view-upload-link :id="item.uploadId">
                                            {{item.count}}
                                        </view-upload-link>
                                    </td>
                                    <td class="uploader">{{item.uploader}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </template>
            </table>

        </div>



    <rank-table :rank-data="rankData" :callsign="callsignValid" @callsign-click="callsignClick"/>

    <div class="list">
      <h4>Latest uploads</h4>
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
                <td class="uploader">{{replace0(item.uploader)}}</td>
                <td class="uploaded">{{item.uploadDate}} <span>{{item.uploadTime}}</span></td>
            </tr>
        </table>
    </div>

    </div>
</template>

<script>
import {getRankings, getHunterDetails, getRecentUploads, getMscData} from '../api'
import storage from '../storage'

import capitalizeMixin from '../capitalize-mixin'
import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

import RankTable from './RankTable.vue'
import Selector from './Selector.vue'
import ViewUploadLink from './ViewUploadLink.vue'

import {orderedBands} from '../ham-radio'

const reStripCallsign = /\d*[A-Z]+\d+[A-Z]+/i
const STORAGE_KEY_CALLSIGN = 'hunter_callsign'

import rdaShort from '../rdaShort.json'

export default {
  BANDS: orderedBands(),
  name: 'Index',
  mixins: [capitalizeMixin, rankDataMixin, replaceZerosMixin],
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
    setCallsignValid () {
      storage.save(STORAGE_KEY_CALLSIGN, this.callsign, 'local')
      this.callsignValid = this.callsign
    },
    loadHunter () {
      if (this.callsignValid) {
        this.showDetails = false
        this.callsignError = false
        getHunterDetails(this.callsign)
          .then((data) => {
            this.hunterData = data
            if (!data) {
              this.callsignError = true
              this.callsignValid = null
              this.$callsignErrorTimeout =
                setTimeout(() => { this.callsignError = false }, 10000)
            }
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
      let csMatch = null
      this.callsignValid = false
      if ((csMatch = reStripCallsign.exec(this.callsign)) !== null) {
        this.callsign = csMatch[0]
        reStripCallsign.lastIndex = 0
        this.capitalize(this, 'callsign')
        this.setCallsignValid()
      }
    }
  },
  computed: {
    qsoFilter () {
      const allModes = this.isMeta(this.mode)
      const allBands = this.isMeta(this.band)
      return (qso) => {
        return (allModes || qso.mode === this.mode) &&
            (allBands || qso.band === this.band)
      }
    },
    hunterRank () {
      function emptyField () {
        return {count: 0, rank: '-' }
      }
      const r = {'total': emptyField(), 'bandsSum': emptyField()}
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
        for (const rda in this.hunterData.qso) {
          if (this.role === 'hunter') {
            if (this.hunterData.qso[rda].hunter) {
              for (const qso of this.hunterData.qso[rda].hunter) {
                if (this.qsoFilter(qso)) {
                  r[rda] = 'cfm'
                  break
                }
              }
            }
          }
          if (!r[rda] && this.hunterData.qso[rda].activator) {
            let count = 0
            for (const qsos of this.hunterData.qso[rda].activator) {
              if (this.qsoFilter(qsos)) {
                count += qsos.count
                if (count > 99) {
                  r[rda] = 'cfm'
                  break
                }
              }
            }
            if (!r[rda] && this.role === 'activator' && count > 0) {
              r[rda] = 'partial'
            }
          }
        }
      }
      return r
    },
    rdaQso () {
      const r = {hunter: null, activator: null}
      if (this.rdaValue && this.hunterData.qso[this.rdaValue.value]) {
        const data = this.hunterData.qso[this.rdaValue.value]
        for (const type in r) {
          if (type in data) {
            const qso = data[type].filter(this.qsoFilter)
            if (qso.length) {
              r[type] = qso
            }
          }
        }
      }
      return r
    }
  }
}
</script>

