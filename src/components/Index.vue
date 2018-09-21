<template>
    <div>
        <div class="list">
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
                    <td></td><td>позывной</td><td></td>
                </tr>
            </table>

            <div id="callsign_error" v-if="callsignError">
                Позывной не найден
            </div>

            <div id="mode_switch">
                <mode-switch @mode-change="modeChange" v-if="hunterData">
                </mode-switch>
            </div>

            <table id="summary" v-if="hunterRank.hunter && hunterRank.hunter.total">
                <tr>
                    <td style="border: none;"></td>
                    <td class="summ top" :class="{selected: band === 'total'}"
                        @click="band = 'total'">Все</td>
                    <td class="band top" :class="{selected: _band === band}"
                        v-for="(_band, index) in $options.BANDS" :key="index" 
                        @click="band = _band">{{_band}}</td>
                    <td class="summ top" :class="{selected: band === 'bandsSum'}"
                        @click="band = 'bandsSum'">Сумма</td>
                </tr>
                <tr class="top_row">
                    <td style="border: none;">AutoCFM RDAs</td>
                    <td :class="{selected: band === 'total'}">
                        {{hunterRank.hunter.total.count}}
                    </td>
                    <td :class="{selected: band === _band}"
                        v-for="(_band, index) in $options.BANDS" :key="index">
                        {{hunterRank.hunter.bands[_band].count}}</td>
                    <td :class="{selected: band === 'bandsSum'}">
                        {{hunterRank.hunter.bandsSum.count}}</td>
                </tr>
                <tr>
                    <td style="border: none;">Место в рейтинге Охотников</td>
                    <td :class="{selected: band === 'total'}">
                        {{hunterRank.hunter.total.rank}}
                    </td>
                    <td :class="{selected: band === _band}"
                        v-for="(_band, index) in $options.BANDS" :key="index">
                        {{hunterRank.hunter.bands[_band].rank}}</td>
                    <td :class="{selected: band === 'bandsSum'}">
                        {{hunterRank.hunter.bandsSum.rank}}</td>
                </tr>
                <template v-if="hunterRank.activator.total.count">
                    <tr class="top_row">
                        <td style="border: none;">Активировано RDAs</td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.activator.total.count}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank.activator.bands[_band].count}}</td>
                        <td :class="{selected: band === 'bandsSum'}">
                            {{hunterRank.activator.bandsSum.count}}</td>
                    </tr>
                    <tr>
                        <td style="border: none;">Место в рейтинге Активаторов</td>
                        <td :class="{selected: band === 'total'}">
                            {{hunterRank.activator.total.rank}}
                        </td>
                        <td :class="{selected: band === _band}"
                            v-for="(_band, index) in $options.BANDS" :key="index">
                            {{hunterRank.activator.bands[_band].rank}}</td>
                        <td :class="{selected: band === 'bandsSum'}">
                            {{hunterRank.activator.bandsSum.rank}}</td>
                    </tr>
                </template>

            </table>


            <span class="show_details" @click="showDetails = !showDetails" 
                v-if="hunterData">
                {{showDetails ? 'Свернуть' : 'Подробно по RDA районам для ' + replace0(callsignValid)}}
            </span>

            <table id="rda_table" v-if="showDetails">
                <template v-for="(group, idxGr) in rda">
                    <tr :key="idxGr">
                        <td class="rda_letters">{{group.group}}</td>
                        <td>
                            <div v-for="(val, idxVal) in group.values" :key="idxVal" class="rda" 
                                :class="{cfm: rdaCfm[val.value]}" 
                                @click="rdaValue === val ? rdaValue = null : rdaValue = val">
                                {{val.displayValue}}
                            </div>
                        </td>
                    </tr>
                    <tr v-if="rdaValue && rdaValue.group === group.group && (rdaQso.hunter || rdaQso.activator)"
                        :key="idxGr + '-actVal'">
                        <td colspan="2">
                            <table id="stat1rda_hunter" v-if="rdaQso.hunter">
                                <tr>
                                    <td id="hunter_activator" colspan="5">RDA охотник</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{rdaValue.value}}</td>
                                    <td class="time top">GMT</td>
                                    <td class="band top">МГц</td>
                                    <td class="call top">CFM QSO</td>
                                    <td class="uploader top">Загрузил</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.hunter" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="time">{{item.time}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">{{item.stationCallsign}}</td>
                                    <td class="uploader">{{item.uploader}}</td>
                                </tr>
                            </table>

                            <table id="stat1rda_activator" v-if="rdaQso.activator">
                                <tr>
                                    <td id="hunter_activator" colspan="5">RDA активатор</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">{{rdaValue.value}}</td>
                                    <td class="band top">МГц</td>
                                    <td class="call top">QSOs</td>
                                    <td class="uploader top">Загрузил</td>
                                </tr>
                                <tr v-for="(item, idxIt) in rdaQso.activator" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">{{item.count}}</td>
                                    <td class="uploader">{{item.uploader}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </template>
            </table>

        </div>



    <rank-table title="TOP 100 - Охотники за RDA районами" :rank-data="rankData.hunters"
        :callsign="callsignValid" @callsign-click="callsignClick"/>


    <rank-table title="TOP 100 - Активаторы RDA районов" :rank-data="rankData.activators"
        :callsign="callsignValid" @callsign-click="callsignClick"/>

    </div>
</template>

<script>
import {getRankings, getHunterDetails, getFullRDA} from '../api'
import storage from '../storage'

import capitalizeMixin from '../capitalize-mixin'
import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

import RankTable from './RankTable.vue'
import ModeSwitch from './ModeSwitch.vue'
import {orderedBands} from '../ham-radio'

const reStripCallsign = /\d*[A-Z]+\d+[A-Z]+/i
const STORAGE_KEY_CALLSIGN = 'hunter_callsign'

export default {
  BANDS: orderedBands(),
  name: 'index',
  mixins: [capitalizeMixin, rankDataMixin, replaceZerosMixin],
  components: {RankTable, ModeSwitch},
  data () {
    getRankings() 
      .then((data) => {this.rankData = data})
    getFullRDA()
      .then((data) => {this.rda = data})      
    const callsign = storage.load(STORAGE_KEY_CALLSIGN)
    return {
      callsign: callsign,
      callsignError: false,
      callsignValid: callsign,
      rankData: {},
      rda: {},
      hunterData: null,
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
              this.$callsignErrorTimeout =
                setTimeout(() => { this.callsignError = false }, 10000)
            }
          })
      }
    },
    modeChange (mode) {
      this.mode = mode
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
    },
    getHunterRank (data, band) {
      const rankData = this.getModeBand(data, this.mode, band)
      let rank = {rank: '-', count: 0}
      let found = null
      if (rankData && (found = rankData.find((item) =>
        {return item.callsign === this.callsignValid}))) {
        rank = found
      }
      return rank
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
      const r = {hunter: null, activator: null}
      for (const type in r) {
        const data = this.rankData[type + 's']
        if (this.callsignValid && data) {
          r[type] = {'total': null, 'bandsSum': null}
          for (const band in r[type]) {
            r[type][band] = this.getHunterRank(data, band)
          }
          r[type].bands = {}
          for (const band of this.$options.BANDS) {
            r[type].bands[band] = this.getHunterRank(data, band)
          }
        }
      }
      return r
    },
    rdaCfm () {
      const r ={}
      if (this.hunterData) {
        for (const rda in this.hunterData) {
          if (this.hunterData[rda].hunter) {
            for (const qso of this.hunterData[rda].hunter) {
              if (this.qsoFilter(qso)) {
                r[rda] = true
                break
              }
            }
          }
          if (!r[rda] && this.hunterData[rda].activator) {
            let count = 0
            for (const qsos of this.hunterData[rda].activator) {
              if (this.qsoFilter(qsos)) {
                count += qsos.count
                if (count > 99) {
                  r[rda] = true
                  break
                }
              }
            }
          }
        }
      }
      return r
    },
    rdaQso () {
      const r = {hunter: null, activator: null}
      if (this.rdaValue && this.hunterData[this.rdaValue.value]) {
        const data = this.hunterData[this.rdaValue.value]
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

