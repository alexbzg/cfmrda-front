<template>
  <div id="paper_qsl">
    <table id="paper_qsl_check">
        <tr>
            <td class="top qsl_hold">Hold</td>
            <td class="top qsl_callsign">Callsign</td>
            <td class="top qsl_rda_callsign">Activator</td>
            <td class="top qsl_rda">RDA</td>
            <td class="top qsl_rda_qrz">CFMRDA</td>
            <td class="top qsl_date">Date</td>
            <td class="top qsl_gmt">GMT</td>
            <td class="top qsl_band">Band</td>
            <td class="top qsl_mode">Mode</td>
            <td class="top qsl_card">QSL</td>
            <td class="top qsl_cfm"> CFM </td>
            <td class="top qsl_not_cfm">REJECT</td>
            <td class="top qsl_comm">Comment</td>
        </tr>
        <tbody v-for="item in qslList" :key="'qsl_' + item.id">
            <tr :class="{cfm_checked: item.cfm, not_cfm_checked: item.not_cfm, hold: item.hold }">
                <td class="qsl_hold">
                    <input type="checkbox" 
                        v-model="item.hold"
                        @change="holdQsl(item)"
                        /><br/>
                    <span class="holder" v-if="item.hold">{{item.admin}}</span>
                </td>
                <td class="qsl_callsign" @keyup.enter="submit" >{{item.callsign}}</td>
                <td class="qsl_rda_callsign">
                    <router-link :to="'/callsignsRda/' + item.stationCallsign.replace('/', '%2F')" target="_blank">
                        {{item.stationCallsign}}
                    </router-link>
                </td>
                <td class="qsl_rda" :class="{wrong: item.callsignRda && !item.callsignRda.includes(item.rda)}">
                    {{item.rda}}
                </td>
                <td class="qsl_rda_qrz">
                    <template v-for="(rda, idx) in item.callsignRda">
                        <span :key="'rda_' + idx">{{rda}}</span><br :key="idx"/>
                    </template>
                </td>
                <td class="qsl_date">{{item.date}}</td>
                <td class="qsl_date">{{item.time}}</td>
                <td class="qsl_band">{{bandWl(item.band)}}</td>
                <td class="qsl_mode">{{item.mode}}</td>
                <td class="qsl_card">
                    <qsl-images :qso="item" :active-image="activeImage"  @show-qsl-image="showImage">
                    </qsl-images>
                </td>
                <td class="qsl_cfm">
                    <input type="checkbox" 
                        v-model="item.cfm"
                        @change="item.not_cfm = item.cfm ? false : item.not_cfm"
                        :disabled="item.hold"
                        >
                </td>
                <td class="qsl_not_cfm">
                    <input type="checkbox" 
                        v-model="item.not_cfm"
                        @change="item.cfm = item.not_cfm ? false : item.cfm"
                        :disabled="item.hold"
                        >
                </td>
                <td class="qsl_comm">
                    <div class="moderator" v-if="item.cfm || item.not_cfm">{{userCallsign}}</div>
                    <div class="user_comment" v-if="item.commentQsl">{{item.commentQsl}}</div>
                    <textarea v-if="item.not_cfm" v-model="item.comment">
                    </textarea>
                </td>
            </tr>
            <tr v-if="activeImage && activeImage.qso === item">
                <td colspan="13" class="qsl_image">
                    <div id="rotate_btns">
                      <img id="icon_rotate_left" src="/images/icon_rotate_left.jpg"
                        @click="setImageRotate('left')"
                        title="Повернуть QSL" />
                      <img id="icon_rotate_right" src="/images/icon_rotate_right.jpg"
                        @click="setImageRotate('right')"
                        title="Повернуть QSL" /><br/>
                    </div>
                    <img 
                        :src="activeImage.src" 
                        @click="activeImage = null"
                        @load="imageLoad"
                        :title="activeImage.fileSize"
                        :class="{rotate_left: imageRotate === 'left',
                            rotate_right: imageRotate ===  'right'}"/>
                </td>
            </tr>
        </tbody>
        <tr>
            <td colspan="14" class="cfm_btn">
                <input type="button" name="cfm_btn" id="cfm_btn" value="OK" class="btn"
                    @click="buttonClick()" :disabled="pending || qsl.length === 0">
            </td>
        </tr>
    </table>
    <form target="_blank" action="http://www2.dxsoft.com/rda/rdasearch.php" method="post" ref="rdAwardForm">
        <input type="hidden" name="callsign"/>
    </form>
    <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'

import {qslAdmin} from '../api'
import QslImages from './QslImages'

import {bandWl} from '../ham-radio'

export default {
  name: 'QslAdmin',
  components: {QslImages},
  data () {
    this.loadList()
    return {
      qslList: [],
      pending: false,
      success: false,
      response: null,
      activeImage: null,
      imageRotate: null
    }
  },
  methods: {
    bandWl (band) {
      return bandWl(band)
    },
    holdQsl (item) {
      if (item.hold) {
        item.cfm = false
        item.not_cfm = false
      }
    },
    post(data) {
      data.token = this.$store.getters.userToken
      return qslAdmin(data)
    },
    setImageRotate (dir) {
      this.imageRotate = (this.imageRotate === dir ? null : dir)
    },
    loadList() {
      this.post({})
        .then((data) => {
          for (const qsl of data) {
            qsl.cfm = false
            qsl.not_cfm = false
            qsl.hold_srv = qsl.hold
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
    },
    showRdaLog (callsign) {
      this.$refs.rdAwardForm.callsign.value = callsign
      this.$refs.rdAwardForm.submit()
    },
    showImage (imgData) {
      this.activeImage = imgData
      this.imageRotate = null
    },
    imageLoad (evt) {
      this.activeImage.fileSize = "Размер файла: " + 
        ~~(performance.getEntriesByName(evt.target.src)[0].transferSize / 1024) + 'Mb'
    }
  },
  computed: {
    ...mapGetters(['userToken', 'userCallsign']),
    qsl () {
      const r = []
      for (const qsl of this.qslList) {
        if (qsl.cfm || qsl.not_cfm || qsl.hold !== qsl.hold_srv) {
          r.push({id: qsl.id,
            hold: qsl.hold,
            state: qsl.cfm ? true : (qsl.not_cfm ? false : null),
            qslId: qsl.qslId,
            comment: qsl.comment})
        }
      }
      return r
    }
  }
}
</script>
