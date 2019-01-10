<template>
    <div class="list">
        <div id="new_old">

            <input type="text" id="call_search" v-model="searchValue"> 
            <input type="submit" class="btn" value="Искать" @click="doSearch">

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
        </div>
    </div>

</template>
<script>
import {mapGetters} from 'vuex'

import {qslAdmin} from '../api'


export default {
  name: 'CallsignsAdmin',
  data () {
    this.loadList()
    return {
      callsigns: [],
      searchTerm: null,
      callsignsSearch: [],
      pending: false,
      success: false,
      response: null
    }
  },
  methods: {
    post(data) {
      data.token = this.$store.getters.userToken
      return qslAdmin(data)
    },
    loadList() {
      this.post({})
        .then((data) => {
          for (const qsl of data) {
            qsl.cfm = false
            qsl.not_cfm = false
          }
          this.qslList = data
        })
    },
    buttonClick () {
      this.pending = true
      this.response = null
      this.post({qsl: this.qsl})
        .then(() => {
          this.loadList()
        })
        .catch((e) => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    ...mapGetters(['userToken']),
    qsl () {
      const r = []
      for (const qsl of this.qslList) {
        if (qsl.cfm || qsl.not_cfm) {
          r.push({id: qsl.id, 
            state: !!qsl.cfm,
            comment: qsl.comment})
        }
      }
      return r
    }
  }
}
</script>
