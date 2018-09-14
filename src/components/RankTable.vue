<template>
    <div class="list" v-if="rankData">
        <h4>{{title}}</h4>

        <table class="select_view">
          <tr>
            <td class="band" :class="{selected: activeType === 'total'}" 
                @click="activeType = 'total'">Все</td>            
            <td class="band" v-for="(band, index) in $options.bands" :key="index" 
                :class="{selected: activeType === band}" 
                @click="activeType = band">{{band}}</td>
            <td class="band" :class="{selected: activeType === 'bandsSum'}" 
                @click="activeType = 'bandsSum'">Сумма</td>   
          </tr>         
       </table> 

       <table class="select_view select_view_mode">
          <tr>
            <td class="selected">Все</td>
            <td>CW</td>
            <td>SSB</td>
            <td>DIG</td>
          </tr>
        </table>


       <table class="top_100">
            <tr v-for="(row, rowIndex) in rows[activeType]" :key="rowIndex">
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

const ROWS_COUNT = 10
const COLUMNS_COUNT = 10

export default {
  bands: orderedBands(),
  name: 'rankTable',
  props: ['rankData', 'callsign', 'title'],
  data () {
    return {
      rows: {},
      activeType: null
    }
  },
  methods: {
    splitRows (activeType) {
      const rows = []
      const topCount = Math.min(ROWS_COUNT*COLUMNS_COUNT, activeType.length)
      const rowCount = Math.min(ROWS_COUNT, topCount)
      for (let rc = 0; rc < rowCount; rc++) {
        const row = []
        for (let cc = 0; cc < COLUMNS_COUNT; cc++) {
          const idx = rc + cc*COLUMNS_COUNT
          row.push(idx < topCount ? activeType[idx] : null)
        }
        rows.push(row)
      }
      return rows
    }
  },
  watch: {
    rankData (newVal) {
      this.rows = {}
      this.$set(this.rows, 'total', this.splitRows(newVal.total))
      for (const band in newVal.bands) {
        this.$set(this.rows, band, this.splitRows(newVal.bands[band]))
      }
      this.$set(this.rows, 'bandsSum', this.splitRows(newVal.bandsSum))
      this.activeType = 'total'
    }
  }
}
</script>


