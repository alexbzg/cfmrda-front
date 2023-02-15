<template>
    <div class="list">

       <h4>The 9BAND CFMRDA Activators rating</h4>


       <div class="rating_menu">
          <select id="activators_rating_year" v-if="years" v-model="year">
            <option v-for="_year in years" :key="_year" :value="_year">
                {{_year}}
            </option>
            <option value="total">
                ALL
            </option>
          </select>
       </div>

       <div class="preloader" v-if="loading"><img src="images/spinner3.gif"/></div>

       <table class="top_100">
            <tr v-for="(row, rowIndex) in rows" 
                :key="'topRow' + rowIndex">
                <td v-for="(item, itemIndex) in row" 
                    :key="'topItem' + rowIndex + '_' + itemIndex">
                    <span class="rank" v-if="item">{{item.act_rank}}.</span>
                    <span class="callsign">
                        <a v-if="item"
                            target="_blank"
                            :href="detailURL(item.activator)">
                            {{item.activator}}
                        </a>
                        <template v-else>&nbsp;</template>
                    </span>
                    <span class="call_result">{{item ? item.rating.toLocaleString() : '&nbsp;'}}</span>
                </td>
            </tr>
       </table>
    </div>
</template>

<script>

import { get } from '../api'

import replaceZerosMixin from '../replace-zeros-mixin'

const ROWS_COUNT = 15
const COLUMNS_COUNT = 7

export default {
  ROWS_COUNT: ROWS_COUNT,
  COLUMNS_COUNT: COLUMNS_COUNT,
  name: 'ActivatorsRankTable',
  mixins: [replaceZerosMixin],
  props: ['callsign'],
  data () {
    return {
      years: null,
      year: null,
      data: null,
      loading: false
    }
  },
  mounted () {
    get('/aiohttp/activators_rating')
        .then( (rsp) => {
            this.years = rsp.data
            this.year = rsp.data[0]
        })
  },
  methods: {
    detailURL (activator) {
      return `/activatorsRatingDetail.html?year=${this.year}&activator=${activator}`
    }
  },
  watch: {
    year () {
        this.data = null
        this.loading = true
        get(`/aiohttp/activators_rating/${this.year}`)
            .then( (rsp) => {
                this.data = rsp.data
            })
            .finally( () => {
                this.loading = false
            })
    }
  },
  computed: {
    rows () {
      const rows = []
      if (this.data) {
        const topCount = Math.min(ROWS_COUNT*COLUMNS_COUNT, this.data.length)
        const rowCount = Math.min(ROWS_COUNT, topCount)
        for (let rc = 0; rc < rowCount; rc++) {
          const row = []
          for (let cc = 0; cc < COLUMNS_COUNT; cc++) {
            const idx = rc + cc*ROWS_COUNT
            row.push(idx < topCount ? this.data[idx] : null)
          }
          rows.push(row)
        }
      }
      return rows
    }
  }
}
</script>


