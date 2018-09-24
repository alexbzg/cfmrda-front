<template>
    <tbody>
        <tr>
            <td class="no_border"></td>
            <td class="menu" colspan="2" v-for="(name, _role) in $options.ROLES" :key="_role"
                :class="{selected: role === _role}" @click="select('role', _role)">
                {{name}}
            </td>
            <td class="no_border" colspan="3"> </td>
            <td class="menu" :class="{selected: mode === 'total'}" 
                @click="select('mode', 'total')">Все</td>
            <td class="menu" v-for="(_mode, idx) in $options.MODES" :key="idx"
                @click="select('mode', _mode)" :class="{selected: mode === _mode}">{{_mode}}</td>
        </tr>
        <tr>
            <td class="separator" colspan="12"/>
        </tr>
        <tr>
            <td class="no_border"></td>
            <td class="menu" :class="{selected: band === 'total'}" 
                @click="select('band', 'total')">Все</td>            
            <td class="menu" v-for="(_band, index) in $options.BANDS" :key="index" 
                :class="{selected: _band === band}" 
                @click="select('band',_band)">{{_band}}</td>
            <td class="menu" :class="{selected: band === 'bandsSum'}" 
                @click="select('band', 'bandsSum')">Сумма</td>   
        </tr>
    </tbody>
</template>

<script>
import {ROLES, MODES, orderedBands} from '../ham-radio'

export default {
  ROLES: ROLES,
  MODES: MODES,
  BANDS: orderedBands(),
  name: 'selector',
  data () {
    return {
      role: 'hunter',
      mode: 'total',
      band: 'total'
    }
  },
  methods: {
    select (type, value) {
      if (this[type] !== value) {
        this[type] = value
        this.$emit('selector-change', type, value)
      }
    }
  }
}
</script>


