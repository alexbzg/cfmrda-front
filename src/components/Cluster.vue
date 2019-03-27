<template>
    <div class="list">
    <div id="rda_cluster">    
        <div id="cluster_submenu" v-if="showFilter">
            <span class="band" v-for="band in  $options.BANDS" :key="band"
                :class="{active: filter.bands[band]}">
                {{band}}<br/><input type="checkbox" v-model="filter.bands[band]">
            </span>
            <span class="mode space" :class="{active: filter.modes.mix}">
                MIX<br/><input type="checkbox" v-model="filter.modes.mix">
            </span>
            <span class="mode" v-for="mode in $options.MODES" :key="mode" 
                :class="{active: filter.modes[mode]}">
                {{mode}}<br/><input type="checkbox" v-model="filter.modes[mode]">
            </span>
            <span class="all_rda space" :class="{active: filter.allRda}"> 
                All RDA<br/><input type="checkbox" v-model="filter.allRda">
            </span>
            <span class="dxped space" :class="{active: filter.dxped}">
                +DXped<br/><input type="checkbox" v-model="filter.dxped">
            </span>
            <span class="sound space" :class="{active: filter.sound}">
                Sound<br/><input type="checkbox" v-model="filter.sound">
            </span>       
        </div>

        <div id="icon_select">
            <img src="/images/icon_select.png" @click="showFilter = !showFilter" />
        </div>   

        <cluster-table rows="20" listener="cluster"></cluster-table>

    </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import {SET_DX_FILTER_MUTATION} from '../store'
import {orderedBands, MODES} from '../ham-radio'


import ClusterTable from './ClusterTable'


export default {
  BANDS: orderedBands(),
  MODES: MODES,
  name: 'Cluster',
  components: {ClusterTable},
  data () {
    return { 
      filter: this.$store.getters.dxFilter(),
      showFilter: false,
    }
  },
  computed: {
    ...mapGetters(['dxFilter', 'dx'])
  },
  watch: {
    filter: {
      handler: function (val) {
        if (JSON.stringify(val) === JSON.stringify(this.dxFilter()))
          return
        this.$store.commit(SET_DX_FILTER_MUTATION, val)
        this.filter = this.dxFilter()
      },
      deep: true
    }
  }
}
</script>

