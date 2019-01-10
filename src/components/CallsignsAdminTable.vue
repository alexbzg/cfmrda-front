<template>
    <table id="new_old">
        <tr>
            <td class="top">Проверен</td>
            <td class="top new">Позывной</td>
            <td class="top old" colspan="2">
                Дополнительные позывные <span class="note_grey">(через пробел)</span>
            </td>
        </tr>
        <tr>
            <td><input type="checkbox" checked></td>
            <td class="new">R7AB</td>
            <td class="old"><textarea>RN6BN RA6AUV EZ6AKL</textarea></td>
            <td class="btns"><input type="submit" class="btn" value="OK"></td>
        </tr>
        <tr>
            <td><input type="checkbox"></td>
            <td class="new">R7CL</td>
            <td class="old"><textarea>RN6BN</textarea></td>
            <td class="btns"><input type="submit" class="btn" value="OK"></td>
        </tr>
    </table>
</template>

<script>
import ReplaceZerosMixin from '../replace-zeros-mixin'

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
        const callsigns = entry.old.map((item) => {
            return item.callsign
          })
        return {
          new: entry.new,
          confirmed: entry.confirmed,
          old: callsigns,
          callsignsEdit: callsigns.join(' ')
        })
    },
    saveClick (entry) {
      if (confirm("Сохранить изменения позывных?")) {
        if (entry.callsignsEdit && entry.callsignsEdit.length) {
          const callsigns = arrayUnique(entry.callsignsEdit.split(/[;,\s]+/).map(stripCallsign
          ).filter((c) => {return c !== entry.new}))
          entry.callsignsEdit = callsigns.join(' ')
          if (!arraysEqSets(callsigns, entry.old.this.hunterData.oldCallsigns)) {
          this.callsignsEditError = null
          oldCallsigns({token: this.userToken, callsigns: callsigns})
            .catch((e) => {
              this.callsignsEditError = e
            })
        }
      }
       this.$emit('save-callsigns', entry)
    },
    deleteUpload (upload) {
      if (confirm("Вы действительно хотите удалить файл?")) {
        this.$emit('edit-uploads',
          {delete: 1,
          id: upload.id})
      }
    }
  }
}
</script>


