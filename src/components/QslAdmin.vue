<template>
  <div id="paper_qsl">
    <table id="paper_qsl_check">
        <tr>
            <td class="top qsl_callsign">Callsign</td>
            <td class="top qsl_new_callsign">New callsign</td>
            <td class="top qsl_rda_callsign">RDA activator</td>
            <td class="top qsl_rda">RDA</td>
            <td class="top qsl_date">Date</td>
            <td class="top qsl_time">GMT</td>
            <td class="top qsl_band">MHz</td>
            <td class="top qsl_mode">Mode</td>
            <td class="top qsl_card">QSL</td>
            <td class="top qsl_cfm">CFM</td>
            <td class="top qsl_not_cfm">NOT CFM</td>
            <td class="top qsl_comm">Comment</td>
        </tr>
        <tbody v-for="item in qslList" :key="item.id">
            <tr :class="{cfm_checked: item.cfm, not_cfm_checked: item.not_cfm}">
                <td class="qsl_callsign">{{item.callsign}}</td>
                <td class="qsl_new_callsign">{{item.newCallsign}}</td>
                <td class="qsl_rda_callsign">{{item.stationCallsign}}</td>
                <td class="qsl_rda">{{item.rda}}</td>
                <td class="qsl_date">{{item.date}}</td>
                <td class="qsl_time">{{item.time}}</td>
                <td class="qsl_band">{{item.band}}</td>
                <td class="qsl_mode">{{item.mode}}</td>
                <td class="qsl_card">
                    <a href="#" @click="showImage = item">
                        <img src="/images/icon_qsl.png" title="Просмотр QSL">
                    </a>
                </td>
                <td class="qsl_cfm">
                    <input type="checkbox" v-model="item.cfm" 
                        @change="item.not_cfm = item.cfm ? false : item.not_cfm">
                </td>
                <td class="qsl_not_cfm">
                    <input type="checkbox" v-model="item.not_cfm" 
                        @change="item.cfm = item.not_cfm ? false : item.cfm">
                </td>
                <td class="qsl_comm">
                    <textarea v-if="item.not_cfm" v-model="item.comment">
                    </textarea>
                </td>
            </tr>
            <tr v-if="showImage === item">
                <td colspan="12" class="qsl_image">
                    <img :src="'/qsl_images/' + item.id + '_' + item.image" @click="showImage = null"/>
                </td>
            </tr>
        </tbody>
        <tr>
            <td colspan="12" class="cfm_btn">
                <input type="button" name="cfm_btn" id="cfm_btn" value="OK" class="btn"
                    @click="buttonClick()" :disabled="pending || qsl.length === 0">
            </td>
        </tr>
    </table>
    <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'

import {qslAdmin} from '../api'


export default {
  name: 'QslAdmin',
  data () {
    this.loadList()
    return {
      qslList: [],
      pending: false,
      success: false,
      response: null,
      showImage: null
    }
  },
  methods: {
    post(data) {
      data.token = this.$store.getters.userToken
      return qslAdmin(data)
    },
    loadList() {
      this.post({})
        .then((data) => {
          for (const qsl of data) {
            qsl.cfm = false
            qsl.not_cfm = false
          }
          this.qslList = data
        })
    },
    buttonClick () {
      this.pending = true
      this.response = null
      this.post({qsl: this.qsl})
        .then(() => {
          this.loadList()
        })
        .catch((e) => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    ...mapGetters(['userToken']),
    qsl () {
      const r = []
      for (const qsl of this.qslList) {
        if (qsl.cfm || qsl.not_cfm) {
          r.push({id: qsl.id, 
            state: !!qsl.cfm,
            comment: qsl.comment})
        }
      }
      return r
    }
  }
}
</script>
