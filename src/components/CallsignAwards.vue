<template>
    <div id="index_awards"
        v-if="searchResults && searchResults.length > 0">
        <table class="search_award_block"
            v-for="award in searchResults"
            :key="award.title">
            <tr>
                <td>
                    <a
                        :href="diploma_href(award.title, callsign)"
                        target="_blank"
                        title="Download the award / Cкачать диплом">
                        {{award.title + (award.issued[3] ? ' ' + award.issued[3] : '')}}
                    </a>
                </td>
            </tr>
            <tr>
                <td>
                    <template v-if="award.issued[0]">
                        <span class="number">#{{award.issued[0]}}</span>
                    </template>
                    {{award.issued[2]}}
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import {mapState} from 'vuex'

import {head} from '../api'

const AWARD_PREFIXES = {
  '9 BAND RDA': '9band_rda',
  '9 BAND EXTREME': '9band_rda_extreme',
  '5 BAND RDA': '5band_rda',
  'RDA Challenge': 'rda_challenge',
  'RDA Hunter': 'rda_hunter'
}

export default {
  name: 'CallsignAwards',
  props: ['callsign'],
  data () {
    return {
      rda_hunter: null
    }
  },
  mounted() {
    this.update_rda_hunter()
  },
  computed: {
    ...mapState(['issuedAwards']),
    searchResults () {
      if (this.callsign) {
        const sr = []
        for (const award in this.issuedAwards) {
          let issued = null
          for (const tier in this.issuedAwards[award]) {
            const issuedAward = this.issuedAwards[award][tier].find(item => item[1] == this.callsign)
            if (issuedAward) {
              issued = [...issuedAward, tier]
            }
            else {
              break
            }
          }
          if (issued) {
            sr.push({
              title: award,
              issued: issued
            })
          }
        }
        if (this.rda_hunter) {
            sr.unshift(this.rda_hunter)
        }
        return sr
      } else {
        return null
      }
    }
  },
  methods: {
    diploma_href (award, callsign) {
      return `${location.origin}/files/${AWARD_PREFIXES[award]}_${callsign.toLowerCase()}.pdf`
    },
    update_rda_hunter () {
      if (this.callsign) {
        this.rda_hunter = null
        head(this.diploma_href('RDA Hunter', this.callsign))
          .then( (rsp) => {
            this.rda_hunter = {
              title: 'RDA Hunter',
              issued: [null, null,
                new Date(rsp.headers['last-modified']).toLocaleDateString(
                    "ru", {dateStyle: "long"}).slice(0, -3),
                null]
            }
          })
      }
    }
  },
  watch: {
    callsign() {
      this.update_rda_hunter()
    }
  }
}
</script>

