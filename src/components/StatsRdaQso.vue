<template>
    <div id="stats_qso">

        <radio-btns-mode v-model="mode">
        </radio-btns-mode>

        <div id="links_to_rda">
            <span v-for="group in rdaGroups" :key="group.group" @click="scrollToGroup(group.first)">
                {{group.group}}
            </span>
        </div>

        <table id="table_stats">
            <tr>
                <td class="top"></td>
                <td class="top">All</td>
                <td class="top" :class="{plus: idx === $options.BANDS.length - 1}"
                    v-for="(band, idx) in $options.BANDS" :key="idx">
                    {{band}}
                </td>
            </tr>
            <tr>
                <td colspan="11" class="no_border" style="padding: 0;">
                    <div id="window_stats">
                        <table id="table_stats_list">
                            <tr v-for="_rda in rda" :key="_rda" :ref="_rda">
                                <td class="rda">{{_rda}}</td>
                                <td>{{getQso(_rda, 'total', mode)}}</td>
                                <td v-for="band in $options.BANDS" :key="band">
                                    {{getQso(_rda, band, mode)}}
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import rdaShort from '../rdaShort.json'
import {orderedBands} from '../ham-radio'
import {getStat} from '../api'

import RadioBtnsMode from './RadioBtnsMode'

export default {
  BANDS: orderedBands(),
  name: 'StatsRdaQso',
  components: {RadioBtnsMode},
  data () {
    const rda = []
    const rdaGroups = []
    for (const group of rdaShort) {
      const groupEntry = {group: group.group}
      for (let c = 1; c <= group.last; c++) {
        if ('skip' in group && group.skip.includes(c)) {
          continue
        }
        const value = group.group + '-' + (c < 10 ? '0' + c : c)
        if (!('first' in groupEntry)) {
          groupEntry.first = value
        }
        rda.push(value)
      }
      rdaGroups.push(groupEntry)
    }
    return {
      rda: rda,
      rdaGroups: rdaGroups,
      qso: {},
      mode: 'total'
    }
  },
  mounted () {
    getStat()
      .then(data => {this.qso = data['qso by rda']})
  },
  methods: {
    getQso (rda, band, mode) {
      if (rda in this.qso && band in this.qso[rda] && mode in this.qso[rda][band])
        return this.qso[rda][band][mode]
      else
        return 0
    },
    scrollToGroup (rda) {
      this.$refs[rda][0].scrollIntoView()
    }
  }
}
</script>

