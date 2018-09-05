<template>
    <div>
        <div class="list">
        <table id="check_call">
            <tr>
            <td>
                <input type="text" name="check_call_input" id="check_call_input" 
                    v-model="callsign" @change="capitalize(vm, 'callsign')">
            </td>
            <td><input type="button" name="check_call_btn" value="OK" class="btn"></td>
            </tr>
            <tr>
            <td>ваш позывной</td><td></td>
            </tr>
        </table>
        </div>

    <rank-table title="TOP 100 - Охотники за RDA районами" :rank-data="rankData.hunters"
        :callsign="callsign"/>


    <rank-table title="TOP 100 - Активаторы RDA районов" :rank-data="rankData.activators"
        :callsign="callsign"/>

    </div>
</template>

<script>
import {getRankings} from '../api'
import capitalizeMixin from '../capitalize-mixin'
import RankTable from './RankTable.vue'

export default {
  name: 'index',
  mixins: [capitalizeMixin],
  components: {RankTable},
  data () {
    getRankings() 
      .then((data) => {this.rankData = data})
    return {
      vm: this,
      callsign: null,
      rankData: {}
    }
  },
  methods: {
  }
}
</script>

