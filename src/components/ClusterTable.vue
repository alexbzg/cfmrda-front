<template>
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
        <tr v-for="(item, idx) in dx" :key="idx">
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
</template>

<script>
import {mapState} from 'vuex'

import {DX_LISTENERS_MUTATION} from '../store'

export default {
  name: 'ClusterTable',
  props: ['rows', 'listener'],
  data () {
    return { 
      time: '00:00'
    }
  },
  computed: {
    dx () {
      return this.$store.getters.dx.slice(0, this.rows)
    },
    ...mapState(['dxNewSpot', 'dxFilter'])
  },
  mounted () {
    this.listenCluster(true)
    this.updateTime()
    this.sound = new Audio('/note.mp3')
  },
  beforeDestroy () {
    this.listenCluster(false)
    if (this.updateTimeTO)
      clearTimeout(this.updateTimeTO)
  },
  methods: {
    playSound () {
      if (this.sound)
        this.sound.play()
          .catch(() => {
          })
    },
    listenCluster (val) {
      const lst = {}
      lst[this.listeners] = val
      this.$store.commit(DX_LISTENERS_MUTATION, lst)
    },
    updateTime () {
      const n = new Date()
      let min = n.getUTCMinutes()
      if ( min < 10 ) min = "0" + min
      let hr = n.getUTCHours()
      if ( hr < 10 ) hr = "0" + hr
      this.time = hr + ':' + min;
      this.updateTimeTO = setTimeout(this.updateTime, (60 - n.getUTCSeconds()) * 1000)
    }
  },
  watch: {
    dxNewSpot: function (newS) {
      //eslint-disable-next-line no-console
      console.log('new spot watch fired ' + new Date() + ' ' +  newS)
      if (newS && this.dxFilter.sound) {
        this.playSound()
        //eslint-disable-next-line no-console
        console.log('Sound! ' + new Date())
      }
    }
  }
}
</script>

