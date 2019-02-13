<template>
    <div class="list" v-if="rankDataTop">

        <h4>AutoCFM RDA rating</h4>


        <div class="view_menu">
            <div class="menu" :class="{selected: band === 'total'}" @click="band = 'total'">RDA</div>
            <div class="menu" v-for="(_band, index) in $options.BANDS" :key="'band' + index" 
                :class="{selected: _band === band}" @click="band = _band">{{_band}}</div>

            <div class="menu tab" :class="{selected: band === 'bandsSum'}" 
                @click="band = 'bandsSum'">RDA Challenge</div>   
            <div class="menu tab" :class="{selected: band === '9BAND'}" 
                @click="switch9BAND()">9BAND RDA</div>   

            <br/>
            <div class="menu left" :class="{selected: mode === 'total'}" 
                @click="mode = 'total'">Mix</div>
            <div class="menu left" v-for="(_mode, idx) in $options.MODES" :key="'mode' + idx"
                @click="mode = _mode" :class="{selected: mode === _mode}">{{_mode}}</div>


            <template v-if="rankDataHunter">
                <div class="menu" :class="{selected: type === 'top'}" @click="setType('top')" >TOP</div>
                <div class="menu" :class="{selected: type === 'hunter'}" 
                    @click="setType('hunter')" >{{callsign}}</div>
            </template>

            <div class="menu right" v-for="(name, _role) in $options.ROLES" :key="'role' + _role"
                :class="{selected: role === _role}" @click="role = _role">
                {{name}}
            </div>
           
       </div>

       <table class="top_100">
            <tr v-for="(row, rowIndex) in rows" :key="'topRow' + rowIndex">
                <td v-for="(item, itemIndex) in row" :key="'topItem' + rowIndex + '_' + itemIndex"
                    :class="{'selected': item && item.callsign === callsign}"
                    @click="$emit('callsign-click', item.callsign)">
                    <span class="rank" v-if="item">{{item.rank}}.</span>
                    <span class="callsign">
                        {{item ? replace0(item.callsign) : '&nbsp;'}}
                    </span>
                    <span class="call_result">{{item ? item.count : '&nbsp;'}}</span>
                </td>
            </tr>
       </table>
    </div>
</template>

<script>
import {ROLES, MODES, orderedBands} from '../ham-radio'

import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

const ROWS_COUNT = 13
const COLUMNS_COUNT = 8

export default {
  ROLES: ROLES,
  MODES: MODES,
  BANDS: orderedBands(),
  ROWS_COUNT: ROWS_COUNT,
  COLUMNS_COUNT: COLUMNS_COUNT,
  name: 'rankTable',
  mixins: [rankDataMixin, replaceZerosMixin],
  props: ['rankDataTop', 'rankDataHunter', 'callsign'],
  data () {
    return {
      role: 'hunter',
      mode: 'total',
      band: 'total',
      type: 'top'
    }
  },
  methods: {
    switch9BAND () {
      this.role = 'hunter'
      this.mode = 'total'
      this.band = '9BAND'
    }
  },
  computed: {
    rows () {
      const rows = []
      const dataSrc = this.type === 'top' ? this.rankDataTop : null 
      if (dataSrc[this.role] && dataSrc[this.role] && dataSrc[this.role][this.mode] &&
        dataSrc[this.role][this.mode][this.band]) {
        const data = dataSrc[this.role][this.mode][this.band]
        const topCount = Math.min(ROWS_COUNT*COLUMNS_COUNT, data.length)
        const rowCount = Math.min(ROWS_COUNT, topCount)
        for (let rc = 0; rc < rowCount; rc++) {
          const row = []
          for (let cc = 0; cc < COLUMNS_COUNT; cc++) {
            const idx = rc + cc*ROWS_COUNT
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


