<template>
    <div class="list" v-if="rankDataTop">

        <h4>AutoCFM RDA rating</h4>


        <div class="view_menu">
            <div class="menu" :class="{selected: params.band === '9BAND'}" 
                @click="switch9BAND()">9BAND</div>
            <div class="menu menu_info"><router-link to="/static/faq#count_9band">i</router-link></div>

            <div class="menu tab" :class="{selected: params.band === 'bandsSum'}" 
                @click="params.band = 'bandsSum'">Challenge</div>
            <div class="menu menu_info"><router-link to="/static/rules#challenge">i</router-link></div>

            <div class="menu tab" :class="{selected: params.band === 'total'}" 
                @click="params.band = 'total'">RDA</div>
            <div class="menu" v-for="(_band, index) in $options.BANDS" :key="'band' + index" 
                :class="{selected: _band === params.band}" @click="params.band = _band">{{_band}}</div>

            <br/>

            <radio-btns-mode v-model="params.mode" :hide-modes="params.band === '9BAND'">
            </radio-btns-mode>

            <div class="menu" :class="{selected: params.type === 'top'}" 
                @click="params.type = 'top'" >TOP</div>
            <div class="menu" :class="{selected: params.type === 'callsign'}" 
                v-if="callsignRankings && callsignRankings[params.role] &&
                    callsignRankings[params.role][params.mode] &&
                    callsignRankings[params.role][params.mode][params.band]"
                @click="params.type = 'callsign'" >{{callsign}}</div>

            <template v-if="params.band !== '9BAND' && params.band !== 'bandsSum'">
                <div class="menu right" v-for="(_role, idx) in ['activator', 'hunter']" :key="'role' + idx"
                    :class="{selected: params.role === _role}" @click="params.role = _role">
                    {{$options.ROLES[_role]}}
                </div>
            </template>
           
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
import {getRankingsSlice} from '../api'

import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

import RadioBtnsMode from './RadioBtnsMode.vue'

const ROWS_COUNT = 13
const COLUMNS_COUNT = 7

export default {
  ROLES: ROLES,
  MODES: MODES,
  BANDS: orderedBands(),
  ROWS_COUNT: ROWS_COUNT,
  COLUMNS_COUNT: COLUMNS_COUNT,
  name: 'rankTable',
  components: {RadioBtnsMode},
  mixins: [rankDataMixin, replaceZerosMixin],
  props: ['rankDataTop', 'callsignRankings', 'callsign'],
  data () {
    return {
      params: {
        role: 'hunter',
        mode: 'total',
        band: '9BAND',
        type: 'top'
      },
      rankDataSlice: null,
      sliceParams: {
        role: null,
        mode: null,
        band: null
      }
    }
  },
  methods: {
    switch9BAND () {
      this.params = {
        role: 'hunter',
        mode: 'total',
        band: '9BAND',
        type: this.params.type
      }
    }
  },
  watch: {
    params: {
      handler () {
        if (this.params.type === 'callsign') {
          if (this.params.role !== this.sliceParams.role || this.params.mode !== this.sliceParams.mode ||
            this.params.band !== this.sliceParams.band) {
            if (this.callsignRankings && this.callsignRankings[this.params.role] &&
              this.callsignRankings[this.params.role][this.params.mode] &&
              this.callsignRankings[this.params.role][this.params.mode][this.params.band]) {
              this.sliceParams.role = this.params.role
              this.sliceParams.mode = this.params.mode
              this.sliceParams.band = this.params.band
              const sliceCentre = this.callsignRankings[this.params.role][this.params.mode][this.params.band][0].row
              const sliceRadius = Math.ceil(COLUMNS_COUNT * ROWS_COUNT / 2)
              const sliceStart = Math.max(1, sliceCentre - sliceRadius)
              getRankingsSlice([this.params.role, this.params.mode, this.params.band, 
                sliceStart, sliceCentre + sliceRadius])
                .then((data) => {this.rankDataSlice = data})
            } else {
              this.params.type = 'top'
            }
          }
        }
      },
      deep: true
    }
  },
  computed: {
    rows () {
      const rows = []
      const dataSrc = this.params.type === 'top' ? this.rankDataTop : this.rankDataSlice
      if (dataSrc && dataSrc[this.params.role] && dataSrc[this.params.role] && dataSrc[this.params.role][this.params.mode] &&
        dataSrc[this.params.role][this.params.mode][this.params.band]) {
        const data = dataSrc[this.params.role][this.params.mode][this.params.band]
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


