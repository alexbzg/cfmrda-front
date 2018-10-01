<template>
    <div class="list" v-if="rankData">

        <h4>AutoCFM RDA TOP {{$options.ROWS_COUNT * $options.COLUMNS_COUNT}}</h4>

            <table class="select_view">
                <selector @selector-change="selectorChange">
                </selector>
            </table>

       <table class="top_100">
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
                <td v-for="(item, itemIndex) in row" :key="itemIndex"
                    :class="{'selected': item && item.callsign === callsign}"
                    @click="$emit('callsign-click', item.callsign)">
                    <span class="rank" v-if="item">{{item.rank}}.</span>
                    <span class="callsign">
                        {{item ? replace0(item.callsign) : '&nbsp;'}}
                    </span>
                </td>
            </tr>
       </table>
    </div>
</template>

<script>
import Selector from './Selector.vue'
import rankDataMixin from '../rank-data-mixin'
import replaceZerosMixin from '../replace-zeros-mixin'

const ROWS_COUNT = 10
const COLUMNS_COUNT = 10

export default {
  ROWS_COUNT: ROWS_COUNT,
  COLUMNS_COUNT: COLUMNS_COUNT,
  name: 'rankTable',
  components: {Selector},
  mixins: [rankDataMixin, replaceZerosMixin],
  props: ['rankData', 'callsign'],
  data () {
    return {
      role: 'hunter',
      mode: 'total',
      band: 'total'
    }
  },
  methods: {
    selectorChange (type, value) {
      this[type] = value
    }
  },
  computed: {
    rows () {
      const rows = []
      if (this.rankData[this.role] && this.rankData[this.role] && this.rankData[this.role][this.mode] &&
        this.rankData[this.role][this.mode][this.band]) {
        const data = this.rankData[this.role][this.mode][this.band]
        const topCount = Math.min(ROWS_COUNT*COLUMNS_COUNT, data.length)
        const rowCount = Math.min(ROWS_COUNT, topCount)
        for (let rc = 0; rc < rowCount; rc++) {
          const row = []
          for (let cc = 0; cc < COLUMNS_COUNT; cc++) {
            const idx = rc + cc*COLUMNS_COUNT
            row.push(idx < topCount ? data[idx] : null)
          }
          rows.push(row)
        }
      }
      return rows
    }
  }
}
</script>


