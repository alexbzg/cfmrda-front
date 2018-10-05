<template>
    <div id="app" v-if="uploadData.length" class="list">
        <h4>{{uploadData[0].rda}}</h4>
        <table id="rda_log">
            <tr>
                <td class="menu number">#</td>
                <td class="menu date">Date</td>
                <td class="menu time">GMT</td>
                <td class="menu band">Band</td>
                <td class="menu mode">Mode</td>
                <td class="menu call">Calsign</td>
                <td class="menu station_call">Activator</td>
            </tr>
            <tr v-for="(item, idx) in uploadData" :key="idx">
                <td class="number">{{idx + 1}}</td>
                <td class="date">{{item.date}}</td>
                <td class="time">{{item.time}}</td>
                <td class="band">{{item.band}}</td>
                <td class="mode">{{item.mode}}</td>
                <td class="call">{{item.callsign}}</td>
                <td class="station_call">{{item.stationCallsign}}</td>
            </tr>
        </table>
  </div>
</template>

<script>
import './style.css'

import {getUpload} from './api'

export default {
  name: 'viewUpload',
  data () {
    const uploadID = (new URLSearchParams(window.location.search.substring(1))).get("id")
    if (uploadID) {
      getUpload(uploadID) 
        .then((data) => {this.uploadData = data})
    }
    return {
      uploadData: []
    }
  },
  components: {
  }
}
</script>

<style>
</style>
