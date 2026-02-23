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
  '9BRDA': '9band_rda',
  'EXTREME': '9band_rda_extreme',
  '5BRDA': '5band_rda',
  'Challenge': 'rda_challenge',
  'Hunter': 'rda_hunter',
  'Activator': 'rda_activator'
}

export default {
  name: 'CallsignAwards',
  props: ['callsign'],
  data () {
    return {
      hunter_activator: {
        Hunter: null,
        Activator: null
      }
    }
  },
  mounted() {
    this.update_hunter_activator()
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
        if (this.hunter_activator.Hunter) {
            sr.unshift(this.hunter_activator.Hunter)
        }
        if (this.hunter_activator.Activator) {
            sr.push(this.hunter_activator.Activator)
        }
        return sr
      } else {
        return null
      }
    }
  },
  methods: {
    diploma_href (award, callsign) {
      return `${location.origin}/files/${AWARD_PREFIXES[award]}_${callsign.toLowerCase()}.jpg`
    },
    update_hunter_activator () {
      if (this.callsign) {
        this.hunter_activator = {Hunter: null, Activator: null}
        for (const award in this.hunter_activator)
          head(this.diploma_href(award, this.callsign))
            .then( (rsp) => {
                this.$set(this.hunter_activator, award, {
                title: award,
                issued: [null, null,
                    new Date(rsp.headers['last-modified']).toLocaleDateString(
                        "ru", {dateStyle: "long"}).slice(0, -3),
                    null]
                })
            })
      }
    }
  },
  watch: {
    callsign() {
      this.update_hunter_activator()
    }
  }
}
</script>

