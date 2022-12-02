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
                <td class="rda">{{item.rda}}</td>
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
            this.data = rsp.data
        })
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
