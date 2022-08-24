<template>
    <div id="issued_awards">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="text"
            name="callsign_input" id="callsign_input"
            v-capitalize
            v-model="searchCallsign"
            @keydown.enter="searchAwards()"/>
        <input type="button"
            name="search_button" id="search_button" value="OK"
            @click="searchAwards()"/><br/>
        <div id="search_results_empty"
            v-if="searchResults && searchResults.length == 0">
            Дипломы не найдены
        </div>
        <div id="search_results"
            v-if="searchResults && searchResults.length > 0">
            <table class="search_award_block"
                v-for="award in searchResults"
                :key="award.title">
                <tr><td colspan="3">
                  <a
                    :href="diploma_href(award.title, searchCallsign)"
                    target="_blank">
                  {{award.title}}<img src="/images/icon_download.jpg" title="Download the award / Cкачать диплом" />
                  </a>
                </td></tr>
                <tr
                    v-for="(item, idx) in award.issued"
                    :key="idx">
                  <td class="tier">{{item[3]}}</td>
                  <td class="number">#{{item[0]}}</td>
                  <td class="date">{{item[2]}}</td>
                </tr>
            </table>
        </div>

        <div v-for="award in awards" :key="award.title" class="award_block" v-if="awardsData">
            <h4>
                {{award.title}}
                <select-array v-if="award.tiers" v-model="award.activeTier"  :options="award.tiers">
                </select-array>
            </h4>
            <template v-for="(issued, idx) in award.latest[award.activeTier]">
                <span class="number" :key="'no_' + idx">{{issued[0]}}</span>&nbsp;
                <!--<a
                    :href="diploma_href(award.title, issued[1])"
                    :key="'lnk_' + idx"
                    target="_blank" title="Скачать диплом / Download the award">-->

                    {{issued[1]}}
                    <span class="date" :key="'dt_' + idx">{{issued[2]}}</span><br :key="'br_' + idx"/>
                <!--</a>-->

            </template>
        </div>
    </div>
</template>

<script>
import {getIssuedAwards} from '../api'

import SelectArray from './SelectArray'

const AWARD_PREFIXES = {
  '9 BAND RDA': '9band_rda',
  '5 BAND RDA': '5band_rda',
  'RDA Challenge': 'rda_challenge'
}

export default {
  name: 'AwardsIssued',
  components: {SelectArray},
  data () {
    return {
      awardsData: null,
      awards: [],
      searchCallsign: null,
      searchResults: null
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
            entry.latest = {}
            for (const tier in data[award]) {
              entry.tiers.push(tier)
              entry.latest[tier] = data[award][tier].slice(-25)
              entry.latest[tier].reverse()
            }
            entry.activeTier = entry.tiers[0]
          }
          this.awards.push(entry)
        }
        if (this.$store.getters.userCallsign) {
          this.searchCallsign = this.$store.getters.userCallsign
          this.searchAwards()
        }
      })
  },
  methods: {
    diploma_href (award, callsign) {
      return `${location.origin}/files/${AWARD_PREFIXES[award]}_${callsign.toLowerCase()}.pdf`
    },
    searchAwards () {
      if (this.searchCallsign && this.awardsData) {
        this.searchResults = []
        for (const award in this.awardsData) {
          const issued = []
          for (const tier in this.awardsData[award]) {
            const issuedAward = this.awardsData[award][tier].find(item => item[1] == this.searchCallsign)
            if (issuedAward) {
              issued.push([...issuedAward, tier])
            }
          }
          if (issued.length > 0) {
            this.searchResults.push({
              title: award,
              issued: issued
            })
          }
        }
      } else {
        this.searchResults = null
      }
    }
  }
}
</script>

