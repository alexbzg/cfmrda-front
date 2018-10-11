<template>
  <div class="list">
    <table id="admin">
    <tr>
        <td class="menu allow" v-if="userAdmin">Допущено</td>
        <td class="menu rda">RDA</td>
        <td class="menu callsign">Позывной</td>
        <td class="menu qsos">QSOs</td>
        <td class="menu period">Период активации</td>
        <td class="menu uploader" v-if="userAdmin">Загрузил</td>
        <td class="menu upload_date">Дата загрузки</td>
        <td class="menu del"></td>
    </tr>
    <tr id="search">
        <td class="allow" v-if="userAdmin"></td>
        <td class="rda">
            <input type="text" name="rda_input" id="rda_input" 
                v-model="search.rda" :class="{error: search.rdaError}"
                @change="searchRdaChange">
        </td>
        <td class="callsign">
            <input type="text" name="call_input" id="call_input" v-model="search.station">
        </td>
        <td class="qsos"></td>
        <td class="period"></td>
        <td class="uploader" v-if="userAdmin">
            <input type="text" name="uploader_input" id="uploader_input" v-model="search.uploader">
        </td>
        <td class="upload_date">
            <datepicker v-model="search.uploadDate"></datepicker>
        </td>
        <td class="del">
            <input type="button" name="search_btn" id="search_btn" value="Найти" class="btn"
                @click="doSearch">
        </td>
    </tr>
    </table>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'

import Datepicker from 'vuejs-datepicker'

export default {
  name: 'ManageUploads',
  components: {Datepicker},
  data () {
    return {
      search: {
        rda: null,
        station: null,
        uploader: null,
        uploadDate: null
      }
    }
  },
  computed: {
    ...mapGetters(['userAdmin'])
  },
  methods: {
    searchRdaChange () {
    },
    doSearch () {
    }
  }
}
</script>
