<template>
    <div class="list">

       <h4>Activators rating</h4>


       <div class="rating_menu">
          <select id="activators_rating_year" v-if="years" v-model="year">
            <option value="current">2024</option>
            <option v-for="_year in years" :key="_year" :value="_year">
                {{_year}}
            </option>
          </select>
          <div 
            class="rating_features"
            v-if="year === 'current'">
            <select 
                id="station_type"
                v-model="clubs">
                <option :value="false">
                    Personal
                </option>
                <option :value="true">
                    Clubs
                </option>
            </select>

            <select 
                id="rating_mode"
                v-model="mode">
                <option
                    v-for="modeEntry in $options.RATING_MODES"
                    :value="modeEntry.value"
                    :key="modeEntry.value">
                    {{modeEntry.label}}
                </option>
            </select>
          </div>
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
import storage from '../storage'

const STORAGE_KEY_ACTIVATORS_RATING_SETTINGS = 'activators_rating_settings'

const ROWS_COUNT = 15
const COLUMNS_COUNT = 7
const RATING_MODES = [
    {value: 'TOTAL', label: 'CW SSB DIGI'},
    {value: 'CW+SSB', label: 'CW SSB'},
    {value: 'CW', label: 'CW'},
    {value: 'SSB', label: 'SSB'},
    {value: 'DIGI', label: 'DIGI'}
    ]

export default {
  ROWS_COUNT: ROWS_COUNT,
  COLUMNS_COUNT: COLUMNS_COUNT,
  RATING_MODES: RATING_MODES,
  name: 'ActivatorsRankTable',
  mixins: [replaceZerosMixin],
  props: ['callsign'],
  data () {
    const ratingSettings = storage.load(STORAGE_KEY_ACTIVATORS_RATING_SETTINGS ) || {}
    return {
      years: null,
      year: null,
      mode: ratingSettings.mode || 'TOTAL',
      clubs: ratingSettings.clubs || false,
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
      return `/activatorsRatingDetail.html?year=${this.year}&activator=${activator}&mode=${encodeURIComponent(this.mode)}`
    },
    update () {
      storage.save(STORAGE_KEY_ACTIVATORS_RATING_SETTINGS, 
        {mode: this.mode, clubs: this.clubs}, 'local')
      this.data = null
      this.loading = true
      const url = this.year == 'current' ?
        `/aiohttp/activators_rating/current/${this.mode}/${this.clubs ? 'clubs' : ''}` :
        `/aiohttp/activators_rating/archive/${this.year}`
      get(url)
        .then( (rsp) => {
            this.data = rsp.data
        })
        .finally( () => {
            this.loading = false
        })
    }
  },
  watch: {
    year () {
      this.update()
    },
    mode () {
      this.update()
    },
    clubs () {
      this.update()
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


