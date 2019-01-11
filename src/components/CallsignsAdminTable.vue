<template>
    <table id="new_old">
        <tr>
            <td class="top">Проверен</td>
            <td class="top new">Позывной</td>
            <td class="top old" colspan="2">
                Дополнительные позывные <span class="note_grey">(через пробел)</span>
            </td>
        </tr>
        <tr v-for="(entry, idx) in entries" :key="idx">
            <td><input type="checkbox" v-model="entry.confirmed"></td>
            <td class="new">{{replace0(entry.new)}}</td>
            <td class="old"><textarea v-model="entry.callsignsEdit" v-capitalize></textarea></td>
            <td class="btns"><input type="submit" class="btn" value="OK" @click="saveClick(entry)"></td>
        </tr>
    </table>
</template>

<script>
import ReplaceZerosMixin from '../replace-zeros-mixin'

import {arrayUnique} from '../utils'
import {stripCallsign} from '../ham-radio'

export default {
  name: 'CallsignsAdminTable',
  mixins: [ReplaceZerosMixin],
  props: ['callsigns'],
  data () {
    return {
      entries: this.createEntries()
    }
  },
  watch: {
    callsigns () {
      this.entries = this.createEntries()
    }
  },
  methods: {
    createEntries () {
      return this.callsigns.map((entry) => {
        const callsigns = entry.old.map((item) => {return item.callsign})
        return  {
          new: entry.new,
          confirmed: entry.confirmed,
          old: callsigns,
          callsignsEdit: callsigns.join(' ')
        }})
    },
    saveClick (entry) {
      if (confirm("Сохранить изменения позывных?")) {
        if (entry.callsignsEdit && entry.callsignsEdit.length) {
          entry.callsigns = arrayUnique(entry.callsignsEdit.split(/[;,\s]+/).map(stripCallsign
          ).filter((c) => {return c !== entry.new}))
          entry.callsignsEdit = entry.callsigns.join(' ')
        }
        this.$emit('save-callsigns', entry)
      }
    }
  }
}
</script>


