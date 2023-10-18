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
            <tr v-for="item in data" :key="item.rda">
                <td v-if="year === 'total'"
                    class="year">{{item.qso_year}}</td>
                <td 
                    class="rda"
                    @mouseover="year !== 'total' && rdaHover(item)"
                    @mouseout="year !== 'total' && rdaHoverOut(item)">
                    {{item.rda}}
                    <table v-if="item.detail">
                        <tr 
                            v-for="band in item.detail"
                            :key="band[0]"
                            :class="{enabled: band[1] > 49}">
                            <td>{{band[0]}}</td>
                            <td>{{band[1]}}</td>
                        </tr>
                    </table>
                </td>
                <td class="points">{{item.points}}</td>
                <td class="mult">{{item.mult}}</td>
                <td class="total">{{item.total}}</td>
            </tr>
        </table>
  </div>
</template>

<script>
import './style.css'

import { get } from './api'
import { orderedBands } from './ham-radio'

const BANDS = orderedBands()

export default {
  name: 'ActivatorsRatingDetail',
  data () {
    const params = new URLSearchParams(window.location.search.substring(1))
    return {
      year: params.get('year'),
      activator: params.get('activator'),
      data: []
    }
  },
  mounted () {
    get(`/aiohttp/activators_rating/${this.year}/${this.activator}`)
      .then( (rsp) => {
        if (this.year !== 'total')
          for (const item of rsp.data) {
            item.pending = false
            item.detail = null
        }
        this.data = rsp.data
      })
  },
  methods: {
    rdaHover (item) {
      if (!item.detail && !item.pending)
        item.pending = true
        get(`/aiohttp/activators_rating/${this.year}/${this.activator}/${item.rda}`)
          .then( (rsp) => {
            if (item.pending) {
              item.detail = []
              for (const band of BANDS)
                if (band in rsp.data)
                  item.detail.push([band, rsp.data[band]])
            }
        })
    }, 
    rdaHoverOut (item) {
      item.pending = false
      item.detail = null
    }
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
