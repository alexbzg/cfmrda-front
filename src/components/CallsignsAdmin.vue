<template>
    <div class="list">
        <div id="new_old">

            <input type="text" id="call_search" v-model="searchValue" v-capitalize> 
            <input type="submit" class="btn" value="Искать" @click="doSearch">

            <callsigns-admin-table :callsigns="callsignsSearch"  v-if="callsignsSearch.length"
                @save-callsigns="saveCallsigns">
            </callsigns-admin-table>

            <callsigns-admin-table :callsigns="callsignsNotConfirmed" @save-callsigns="saveCallsigns">
            </callsigns-admin-table>
        </div>
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
      callsignsSearch: [],
      callsignsNotConfirmed: [],    
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
          this.callsignsNotConfirmed = data.filter((entry) => {return !entry.confirmed})
          this.doSearch()
        })
    },
    doSearch () {
      if (this.searchValue) {
        this.callsignsSearch = this.callsigns.filter((entry) => {
          return entry.new === this.searchValue || 
            entry.old.findIndex((old) => {return old.callsign === this.searchValue}) > -1
        })
        if (this.callsignsSearch.length === 0)
          this.callsignsSearch.push({
            new: this.searchValue,
            old: [],
            confirmed: false
          })
      }
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
    ...mapGetters(['userToken'])
  }
}
</script>
