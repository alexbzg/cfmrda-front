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

            <mode-switch @mode-change="modeChange" v-if="hunterData">
            </mode-switch>

            <table id="summary" v-if="hunterData">
                <tr>
                    <td style="border: none;"></td>
                    <td class="summ top" :class="{selected: band === 'total'}"
                        @click="band = 'total'">Все</td>
                    <td class="band top" :class="{selected: _band === band}"
                        v-for="(_band, index) in $options.bands" :key="index" 
                        @click="band = _band">{{band}}</td>
                    <td class="summ top" :class="{selected: band === 'bandsSum'}"
                        @click="band = 'bandsSum'">Сумма</td>
                </tr>
                <tr>
                    <td style="border: none;">AutoCFM RDAs</td>
                    <td :class="{selected: band === 'total'}">
                        {{selectedHunter.total.count}}
                    </td>
                    <td :class="{selected: _band == band}"
                        v-for="(_band, index) in $options.bands" :key="index">
                        {{selectedHunter.bands[band].count}}</td>
                    <td :class="{selected: band == 'bandsSum'}">
                        {{selectedHunter.bandsSum.count}}</td>
                </tr>
                <tr>
                    <td style="border: none;">В рейтинге Охотников</td>
                    <td :class="{selected: band == 'total'}">
                        {{selectedHunter.total.rank}}
                    </td>
                    <td :class="{selected: band == band}"
                        v-for="(band, index) in $options.bands" :key="index">
                        {{selectedHunter.bands[band].rank}}</td>
                    <td :class="{selected: band == 'bandsSum'}">
                        {{selectedHunter.bandsSum.rank}}</td>
                </tr>
            </table>


            <span class="show_details" @click="showDetails = !showDetails" 
                v-if="(hunterDetails.hunter || hunterDetails.activator) && rda">
                {{showDetails ? 'Свернуть' : 'Подробно по RDA районам для ' + callsign}}
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
                    <tr v-if="rdaValue && rdaValue.group === group.group && (hunterItems || activatorItems)"
                        :key="idxGr + '-actVal'">
                        <td colspan="2">
                            <table id="stat1rda_hunter" v-if="hunterItems">
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
                                <tr v-for="(item, idxIt) in hunterItems" :key="idxIt">
                                    <td class="date">{{item.date}}</td>
                                    <td class="time">{{item.time}}</td>
                                    <td class="band">{{item.band}}</td>
                                    <td class="call">{{item.stationCallsign}}</td>
                                    <td class="uploader">{{item.uploader}}</td>
                                </tr>
                            </table>

                            <table id="stat1rda_activator" v-if="activatorItems">
                                <tr>
                                    <td id="hunter_activator" colspan="5">RDA активатор</td>
                                </tr>
                                <tr>
                                    <td class="rda_top">AL-15</td>
                                    <td class="band top">МГц</td>
                                    <td class="call top">QSOs</td>
                                    <td class="uploader top">Загрузил</td>
                                </tr>
                                <tr>
                                    <td class="date">12 july 1996</td>
                                    <td class="band">1.8</td>
                                    <td class="call">53</td>
                                    <td class="uploader">R7DA</td>
                                </tr>
                                <tr>
                                    <td class="date">23 sept 2015</td>
                                    <td class="band">1.8</td>
                                    <td class="call">75</td>
                                    <td class="uploader">R7DA</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </template>
            </table>

        </div>



    <rank-table title="TOP 100 - Охотники за RDA районами" :rank-data="rankData.hunters"
        :callsign="callsign" @callsign-click="callsignClick"/>


    <rank-table title="TOP 100 - Активаторы RDA районов" :rank-data="rankData.activators"
        :callsign="callsign" @callsign-click="callsignClick"/>

    </div>
</template>

<script>
import {getRankings, getHunterDetails, getFullRDA} from '../api'
import capitalizeMixin from '../capitalize-mixin'
import RankTable from './RankTable.vue'
import {orderedBands} from '../ham-radio'

const reStripCallsign = /\d*[A-Z]+\d+[A-Z]+/i

export default {
  bands: orderedBands(),
  name: 'index',
  mixins: [capitalizeMixin],
  components: {RankTable},
  data () {
    getRankings() 
      .then((data) => {this.rankData = data})
    getFullRDA()
      .then((data) => {this.rda = data})      
    return {
      callsign: null,
      callsignError: false,
      callsignValid: false,
      rankData: {},
      rda: {},
      hunterData: null,
      band: 'total',
      mode: 'total'.
      rdaValue: null,
      showDetails: false,
      message: null
    }
  },
  beforeDestroy () {
    if (this.$callsignErrorTimeout) {
      clearTimeout(this.$callsignErrorTimeout)
    }
  },
  methods: {
    loadHunter () {
      if (this.callsignValid) {
        this.showDetails = false
        this.selectedHunter = null
        getHunterDetails(this.callsign)
          .then((data) => {
            this.hunterDetails = data
            if (!this.band) {
              this.band = 'total'
            }
          })
          .catch(() => {
              this.callsignError = true
              this.$callsignErrorTimeout =
                setTimeout(() => { this.callsignError = false }, 10000)
          })
      }
    },
    callsignClick (callsign) {
      this.callsign = callsign
      this.callsignValid = true
      this.loadHunter()
    },
    callsignChange () {
      let csMatch = null
      this.callsignValid = false
      if ((csMatch = reStripCallsign.exec(this.callsign)) !== null) {
        this.callsign = csMatch[0]
        reStripCallsign.lastIndex = 0
        this.capitalize(this, 'callsign')
        this.callsignValid = true        
      }
    },
    getSelectedHunterRank (rankType, isBand) {
      const rankData = isBand ? this.rankData.hunters.bands[rankType] : this.rankData.hunters[rankType]
      let rank = {rank: '-', count: 0}
      let found = null
      if (rankData && (found = rankData.find((item) =>
        {return item.callsign === this.callsign}))) {
        rank = found
      }
      if (isBand) {
        this.selectedHunter.bands[rankType] = rank
      } else {
        this.selectedHunter[rankType] = rank
      }
    }
  },
  computed: {
    isBand () {
      return this.band !== 'total' && this.band !== 'bandsSum'
    },
    rdaCfm () {
      const r ={}
      if (!this.band || !this.hunterDetails.hunter) {
        return r
      }
      for (const rda in this.hunterDetails.hunter) {
        if (this.isBand) {
          if (this.hunterDetails.hunter[rda][this.band]) {
            r[rda] = true
          }
        } else {
            r[rda] = true
        }
      }
      return r
    },
    hunterItems () {
      if (this.rdaValue && this.hunterDetails.hunter[this.rdaValue.value]) {
        if (this.isBand) {
          return this.hunterDetails.hunter[this.rdaValue.value][this.band]
        } else {
          let r = []
          for (const band in this.hunterDetails.hunter[this.rdaValue.value]) {
            r = r.concat(this.hunterDetails.hunter[this.rdaValue.value][band])
          }
          return r
        }
      }
    },
    activatorItems () {
      return false
    }

  }
}
</script>

