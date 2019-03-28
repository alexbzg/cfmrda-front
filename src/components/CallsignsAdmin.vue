<template>
    <div id="new_old">

        <input type="text" id="call_search" v-model.trim="searchValueEdit" v-capitalize> 
        <input type="submit" class="btn" value="Искать" @click="searchValue = searchValueEdit">
        <div v-if="callsignsSearch" class="searchClose">
            <img src="images/icon_close.png" title="Закрыть результаты поиска" 
                @click="searchValue = null"/>
        </div>
        <callsigns-admin-table :callsigns="callsignsSearch"  v-if="callsignsSearch"
            @save-callsigns="saveCallsigns">
        </callsigns-admin-table>

        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
        <callsigns-admin-table :callsigns="callsignsNotConfirmed" @save-callsigns="saveCallsigns">
        </callsigns-admin-table>
    </div>
</template>
<script>
import {mapGetters} from 'vuex'

import {oldCallsignsAdmin} from '../api'

import CallsignsAdminTable from './CallsignsAdminTable'   

export default {
  name: 'CallsignsAdmin',
  components: {CallsignsAdminTable},
  data () {
    this.loadList()
    return {
      callsigns: [],
      searchValue: null,
      searchValueEdit: null,
      pending: false,
      success: false,
      response: null
    }
  },
  methods: {
    post(data) {
      data.token = this.$store.getters.userToken
      return oldCallsignsAdmin(data)
    },
    loadList() {
      this.post({})
        .then((data) => {
          this.callsigns = data
        })
    },
    saveCallsigns (entry) {
      this.pending = true
      this.response = null
      this.post({confirm: entry})
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
    callsignsSearch () {
      if (this.searchValue) {
        const r = this.callsigns.filter((entry) => {
          return entry.new === this.searchValue || 
            entry.old.findIndex((old) => {return old.callsign === this.searchValue}) > -1
        })
        if (r.length === 0)
          r.push({
            new: this.searchValue,
            old: [],
            confirmed: false
          })
        return r
      } else
        return null
    },
    callsignsNotConfirmed () {
      return this.callsigns.filter((entry) => {return !entry.confirmed})
    }
  }
}
</script>
