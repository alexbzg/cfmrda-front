<template>
    <div id="issued_awards">
        <div v-for="(award, idx) in awards" :key="idx" class="award_block">
            <h4>
                {{award.title}}
                <select-array v-if="award.tiers" v-model="award.activeTier"  :options="award.tiers">
                </select-array>
            </h4>
            <template v-for="(issued, idx) in (award.tiers ? awardsData[award.title][award.activeTier] : 
                awardsData[award.title])">
                <span class="number" :key="'no_' + idx">{{issued[0]}}</span> {{issued[1]}} 
                <span class="date" :key="'dt_' + idx">{{issued[2]}}</span><br :key="'br_' + idx"/>
            </template>
        </div>
    </div>
</template>

<script>
import {getIssuedAwards} from '../api'

import SelectArray from './SelectArray'

export default {
  name: 'AwardsIssued',
  components: {SelectArray},
  data () {
    return { 
      awardsData: null,
      awards: []
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

