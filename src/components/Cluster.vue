<template>
    <div id="rda_cluster">    
        <div id="cluster_submenu" v-if="showFilter">
            <span class="band" v-for="(band, idx) in  $options.BANDS" :key="idx"
                :class="{active: filter.bands[band]}">
                {{band}}<br/><input type="checkbox" v-model="filter.bands[band]">
            </span>
            <span class="mode space" :class="{active: filter.modes.mix}">
                MIX<br/><input type="checkbox" v-model="filterSetting.modes.mix">
            </span>
            <span class="mode" v-for="(mode, idx) in $options.MODES" :key="idx" 
                :class="{active: filter.modes[mode]">
                {{mode}}<br/><input type="checkbox" v-model="filter.modes[mode]">
            </span>
            <span class="all_rda space" :class="{active: filter.allRda}"> 
                All RDA<br/><input type="checkbox" v-model="showFilterSettings.allRda">
            </span>
            <span class="dxped space" :class="{active: filter.dxped}">
                +DXped<br/><input type="checkbox" v-model="filter.dxped">
            </span>
            <span class="sound space" :class="{active: filter.sound}">
                Sound<br/><input type="checkbox" v-model="filter.sound">
            </span>       
        </div>

        <div id="icon_select">
            <img src="/images/icon_select.png" @click="showFilter = !showFilter" />
        </div>   

        <table id="cluster">
            <tr>
                <td class="top time">{{time}}z</td>
                <td class="top band">MHz</td>
                <td class="top mode">Mode</td>
                <td class="top callsign">Callsign</td>
                <td class="top rda">RDA</td>
                <td class="top text">Text</td>
                <td class="top spotter">Spotter</td>
            </tr>
            <tr v-for="(item, idx) in dxFiltered">
                <td class="time">{{item.time}}</td>
                <td class="band">
                    <span>{{item.freq.toFixed(1).substr(0, item.freq.toFixed(1).length - 5)}}</span>
                    {{item.freq.toFixed(1).substr( -5 )}}
                </td>
                <td class="mode">{{item.mode}}</td>
                <td class="callsign">
                    <a :href="'http://qrz.ru/db/' + item.cs" target="_blank" rel="noopener">
                        {{item.cs}}
                    </a>
                </td>
                <td class="rda">{{item.awards.RDA ? item.awards.RDA.value : ''}}</td>
                <td class="text">
                    <a v-if="item.dxped" :href="item.dxped.link" target="_blank" rel="noopener">
                        INFO
                    </a>
                    {{item.text}}
                </td>
                <td class="spotter">{{item.de}}</td>
            </tr>
        </table>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import {getHunterDetails, getDx} from '../api'
import {orderedBands, MODES} from '../ham-radio'
import {SET_DX_FILTER_MUTATION} from '../store'

export default {
  BANDS: orderedBands(),
  MODES: MODES,
  name: 'Cluster',
  data () {
    return { 
      awardsData: null,
      awards: [],
      filter: this.$store.getters.dxFilter  
    }
  },
  computed: {
    ..mapGetters['dxFilter']
  },
  watch: {
    filter: {
      handler: function (val) {
        if (JSON.stringify(val) === JSON.stringify(this.dxFilter))
          return
        this.$store.commit(SET_DX_FILTER_MUTATION, val)
        this.filter = this.dxFilter
      },
      deep: true
    }
  },
  mounted () {
    getIssuedAwards()
      .then(data => {
        this.awardsData = data
        for (const award in data) {
          const entry = {title: award}
          if (!Array.isArray(data[award])) {
            entry.tiers = []
            for (const tier in data[award])
              entry.tiers.push(tier)
            entry.activeTier = entry.tiers[0]
          }
          this.awards.push(entry)
        }
      })
  }
}
</script>

