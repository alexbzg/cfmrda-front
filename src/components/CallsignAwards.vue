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
                        {{award.title}} {{award.issued[3]}}
                    </a>
                </td>
            </tr>
            <tr>
                <td>
                  #{{award.issued[0]}} <span class="date">{{award.issued[2]}}</span>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import {mapState} from 'vuex'

const AWARD_PREFIXES = {
  '9 BAND RDA': '9band_rda',
  '9 BAND EXTREME': '9band_rda_extreme',
  '5 BAND RDA': '5band_rda',
  'RDA Challenge': 'rda_challenge'
}

export default {
  name: 'CallsignAwards',
  props: ['callsign'],
  data () {
    return {
    }
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
        return sr
      } else {
        return null
      }
    }
  },
  methods: {
    diploma_href (award, callsign) {
      return `${location.origin}/files/${AWARD_PREFIXES[award]}_${callsign.toLowerCase()}.pdf`
    }
  }
}
</script>

