<template>
    <div>
        <div class="list">
        <table id="check_call">
            <tr>
            <td>
                <input type="text" name="check_call_input" id="check_call_input" 
                    v-model="callsign" @change="callsignChange()">
            </td>
            <td>
                <input type="button" name="check_call_btn" value="OK" class="btn"
                    @click="loadHunter()" :disabled="!callsignValid">
            </td>
            </tr>
            <tr>
            <td>ваш позывной</td><td></td>
            </tr>
        </table>
    </div>

     <table id="rda_table" v-if="hunterDetails && rda">
        <tr v-for="(group, idxGr) in rda" :key="idxGr">
            <td class="rda_letters">{{group.group}}</td>
            <td>
                <div v-for="(val, idxVal) in group.values" :key="idxVal" class="rda" :class="{cfm: false}">
                    {{val.displayValue}}
                </div>
            </td>
        </tr>
     </table>


    <rank-table title="TOP 100 - Охотники за RDA районами" :rank-data="rankData.hunters"
        :callsign="callsign"/>


    <rank-table title="TOP 100 - Активаторы RDA районов" :rank-data="rankData.activators"
        :callsign="callsign"/>

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
      callsignValid: false,
      rankData: {},
      rda: {},
      hunterDetails: null,
      message: null
    }
  },
  methods: {
    loadHunter () {
      if (this.callsignValid) {
        this.hunterDetails = null
        getHunterDetails(this.callsign)
          .then((data) => {this.hunterDetails = data})
          .catch(() => {this.message = 'Позывной не найден.'})
      }
    },
    callsignChange () {
      let csMatch = null
      this.validCallsign = false
      if ((csMatch = reStripCallsign.exec(this.callsign)) !== null) {
        this.callsign = csMatch[0]
        this.capitalize(this, 'callsign')
        this.callsignValid = true
      }
    }
  }
}
</script>

