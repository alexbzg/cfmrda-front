<template>
    <div class="list" v-if="rankDataTop">

        <h4>The CFMRDA rating</h4>


        <div class="rating_menu">

          <select id="awards" @change="awardChange" v-model="award">
            <option value="9BAND">9BAND RDA</option>
            <option value="9BAND-X">9BAND RDA EXTREME</option>
            <option value="bandsSum">RDA CHALLENGE</option>
            <option value="rating">CFMRDA RATING</option>
          </select>

          <select id="country" v-model="params.country">
            <option value="world">World</option>
            <option value="country" v-if="callsignCountry">{{callsignCountry.name}}</option>
          </select>

          <select id="place" v-model="params.type">
            <option value="top">TOP</option>
            <option value="callsign">{{callsign}}</option>
          </select>

          <select id="mode" v-if="award != '9BAND' && award !='9BAND-X'" v-model="params.mode">
            <option value="total">MIX</option>
            <option v-for="_mode in $options.MODES" :key="_mode" :value="_mode">{{_mode}}</option>
          </select>

          <select id="band" v-if="award === 'rating'" v-model="params.band">
            <option value="total">ALL</option>
            <option v-for="_band in $options.BANDS" :key="_band" :value="_band">{{_band}}</option>
          </select>

          <select id="role" v-if="award === 'rating'" v-model="params.role">
            <option v-for="_role in ['hunter', 'activator']" :key="_role" :value="_role">
                {{$options.ROLES[_role]}}
            </option>
          </select>

        </div>




       <div class="preloader" v-if="loading"><img src="images/spinner3.gif"/></div>

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

const ROWS_COUNT = 15
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
  props: ['rankDataTop', 'callsignRankings', 'callsignCountry', 'callsign', 'topLoading', 'callsignLoading'],
  data () {
    return {
      award: '9BAND',
      params: {
        role: 'hunter',
        mode: 'total',
        band: '9BAND',
        type: 'top',
        country: 'world'
      },
      sliceLoading: false,
      rankDataSlice: null,
      sliceParams: {
        role: null,
        mode: null,
        band: null,
        country: 'world'
      }
    }
  },
  methods: {
    awardChange () {
      if (this.award === '9BAND' || this.award === '9BAND-X') {
        this.params = {
          role: 'hunter',
          mode: 'total',
          band: this.award,
          type: this.params.type,
          country: this.params.country
        }
      } else if (this.award === 'bandsSum') {
        this.params = {
          role: 'hunter',
          mode: 'total',
          band: 'bandsSum',
          type: this.params.type,
          country: this.params.country
        }
      } else if (this.award === 'rating') {
        this.params = {
          role: 'hunter',
          mode: 'total',
          band: 'total',
          type: this.params.type,
          country: this.params.country
        }
      }
    }

  },
  watch: {
    params: {
      handler () {
        if (this.params.type === 'callsign') {
          if (this.params.role !== this.sliceParams.role || this.params.mode !== this.sliceParams.mode ||
            this.params.band !== this.sliceParams.band || this.params.country !== this.sliceParamsCountry) {
            if (this.callsignRankings && this.callsignRankings[this.params.country] &&
              this.callsignRankings[this.params.country][this.params.role] &&
              this.callsignRankings[this.params.country][this.params.role][this.params.mode] &&
              this.callsignRankings[this.params.country][this.params.role][this.params.mode][this.params.band]) {
              this.sliceParams.role = this.params.role
              this.sliceParams.mode = this.params.mode
              this.sliceParams.band = this.params.band
              this.sliceParams.country = this.params.country
              const sliceCentre = this.callsignRankings[this.params.country][this.params.role][this.params.mode][this.params.band][0].row
              const sliceRadius = Math.ceil(COLUMNS_COUNT * ROWS_COUNT / 2)
              const sliceStart = Math.max(1, sliceCentre - sliceRadius)
              this.sliceLoading = true
              getRankingsSlice([this.params.role, this.params.mode, this.params.band,
                sliceStart, sliceCentre + sliceRadius,
                this.params.country === 'country' ? this.callsignCountry.id : null])
                .then((data) => {
                  this.rankDataSlice = data
                  this.sliceLoading = false
                })
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
      const dataSrc = this.params.type === 'top' ? this.rankDataTop[this.params.country] : this.rankDataSlice
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
    },
    loading () {
      return this.callsignLoading || (this.params.type === 'top' ? this.topLoading[this.params.country] :
        this.sliceLoading)
    }
  }
}
</script>


