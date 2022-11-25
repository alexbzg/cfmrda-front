<template>
    <div id="issued_awards">
        <div v-for="award in awards" :key="award.title" class="award_block" v-if="awards.length">
            <h4>
                {{award.title}}
                <select-array v-if="award.tiers" v-model="award.activeTier"  :options="award.tiers">
                </select-array>
            </h4>
            <template v-for="(issued, idx) in issuedAwards[award.title][award.activeTier].slice().reverse()">
                <span class="number" :key="'no_' + idx">{{issued[0]}}</span>{{issued[1]}}<span class="date" :key="'dt_' + idx">{{issued[2]}}</span><br :key="'br_' + idx"/>
            </template>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

import SelectArray from './SelectArray'

export default {
  name: 'AwardsIssued',
  components: {SelectArray},
  data () {
    return {
      awards: []
    }
  },
  computed: {
    ...mapState(['issuedAwards']),
  },
  mounted () {
    this.createAwards()
  },
  methods: {
    createAwards() {
      this.awards = []
      for (const award in this.issuedAwards) {
        const entry = {title: award}
        if (!Array.isArray(this.issuedAwards[award])) {
          entry.tiers = []
          for (const tier in this.issuedAwards[award]) {
            entry.tiers.push(tier)
          }
          entry.activeTier = entry.tiers[0]
        }
        this.awards.push(entry)
      }
    }
  },
  watch: {
    issuedAwards() {
      this.createAwards()
    }
  }
}
</script>

