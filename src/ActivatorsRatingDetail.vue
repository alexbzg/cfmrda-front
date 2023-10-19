<template>
    <div id="app" v-if="data.length" class="list">
        <b>{{activator}} {{year === 'total' ? 'ALL' : year}}</b><br/>
        {{pointsTotal}} points * {{data.length}} RDA = {{pointsTotal*data.length}}

        <table id="rda_log">
            <tr>
                <td v-if="year === 'total'"
                    class="menu year">Year</td>
                <td class="menu rda">RDA</td>
                <td class="menu points">Qso</td>
                <td class="menu mult">Mult</td>
                <td class="menu total">Points</td>
            </tr>
            <tbody
                v-for="item in data"
                :key="item.rda"
                >
                <tr>
                    <td v-if="year === 'total'"
                        class="year">{{item.qso_year}}</td>
                    <td
                        class="rda">
                        {{item.rda}}

                    </td>
                    <td class="points"
                        @click="(year !== 'total') && detailClick(item)"
                        :class="{show_detail: showDetail === item}"
                        >
                        {{item.points}}
                    </td>
                    <td class="mult">{{item.mult}}</td>
                    <td class="total">{{item.total}}</td>
                </tr>
                <tr v-if="item.detail && (showDetail === item)">
                    <td colspan="4" class="bands_td">
                        <table class="bands">
                            <tr>
                                <th
                                    v-for="band in $options.BANDS"
                                    :key="band"
                                    :class="{enabled: item.detail[band] > 49}"
                                    >
                                    {{bandWl(band)}}
                                </th>
                            </tr>
                            <tr>
                                <td
                                    v-for="band in $options.BANDS"
                                    :key="band"
                                    :class="{enabled: item.detail[band] > 49}"
                                    >
                                    {{item.detail[band]}}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
  </div>
</template>

<script>
import './style.css'

import { get } from './api'
import { orderedBands, bandWl } from './ham-radio'

const BANDS = orderedBands()

export default {
  name: 'ActivatorsRatingDetail',
  BANDS: BANDS,
  data () {
    const params = new URLSearchParams(window.location.search.substring(1))
    return {
      year: params.get('year'),
      activator: params.get('activator'),
      showDetail: null,
      data: []
    }
  },
  mounted () {
    get(`/aiohttp/activators_rating/${this.year}/${this.activator}`)
      .then( (rsp) => {
        this.data = rsp.data
      })
  },
  methods: {
    detailClick (item) {
      if (this.showDetail === item)
        this.showDetail = null
      else {
        this.showDetail = item
        if (!item.detail && !item.pending) {
          item.pending = true
          get(`/aiohttp/activators_rating/${this.year}/${this.activator}/${item.rda}`)
            .then( (rsp) => this.$set(item, 'detail', rsp.data) )
            .finally( () =>  item.pending = false )
        }
      }
    },
    bandWl
  },
  computed: {
    pointsTotal () {
      return this.data.map( (item) => item.total ).reduce( (a, b) => a + b, 0 )
    }
  }
}
</script>

<style>
</style>
