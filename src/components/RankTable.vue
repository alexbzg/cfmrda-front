<template>
    <div class="list" v-if="rankData">
        <h4>{{title}}</h4>

        <table class="select_view">
          <tr>
            <td class="band" :class="{selected: band === 'total'}" 
                @click="band = 'total'">Все</td>            
            <td class="band" v-for="(_band, index) in $options.BANDS" :key="index" 
                :class="{selected: _band === band}" 
                @click="band = _band">{{_band}}</td>
            <td class="band" :class="{selected: band === 'bandsSum'}" 
                @click="band = 'bandsSum'">Сумма</td>   
          </tr>         
       </table> 

       <mode-switch @mode-change="modeChange">
       </mode-switch>

       <table class="top_100">
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                <td v-for="(item, itemIndex) in row" :key="itemIndex"
                    :class="{'selected': item && item.callsign === callsign}"
                    @click="$emit('callsign-click', item.callsign)">
                    <span class="rank" v-if="item">{{item.rank}}.</span>
                    <span class="callsign">
                        {{item ? item.callsign : '&nbsp;'}}
                    </span>
                </td>
            </tr>
       </table>
    </div>
</template>

<script>
import {orderedBands} from '../ham-radio'
import ModeSwitch from './ModeSwitch.vue'
import RankDataMixin from '../rank-data-mixin'

const ROWS_COUNT = 10
const COLUMNS_COUNT = 10

export default {
  BANDS: orderedBands(),
  name: 'rankTable',
  components: {ModeSwitch},
  mixins: [RankDataMixin],
  props: ['rankData', 'callsign', 'title'],
  data () {
    return {
      mode: 'total',
      band: 'total'
    }
  },
  methods: {
    modeChange (mode) {
      this.mode = mode
    }
  },
  computed: {
    rows () {
      const rows = []
      const data = this.getModeBand(this.rankData, this.mode, this.band)
      if (data) {
        const topCount = Math.min(ROWS_COUNT*COLUMNS_COUNT, data.length)
        const rowCount = Math.min(ROWS_COUNT, topCount)
        for (let rc = 0; rc < rowCount; rc++) {
          const row = []
          for (let cc = 0; cc < COLUMNS_COUNT; cc++) {
            const idx = rc + cc*COLUMNS_COUNT
            row.push(idx < topCount ? data[idx] : null)
          }
          rows.push(row)
        }
      }
      return rows
    }
  }
}
</script>


