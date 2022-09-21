<template>
    <tbody>
        <tr>
            <td class="no_border" colspan="4"></td>
            <td class="menu" :class="{selected: mode === 'total'}"
                @click="select('mode', 'total')">Mix</td>
            <td class="menu" v-for="(_mode, idx) in $options.MODES" :key="idx"
                @click="select('mode', _mode)" :class="{selected: mode === _mode}">{{_mode}}</td>
            <td class="no_border" colspan="2"> </td>
            <td class="menu" colspan="2" v-for="(name, _role) in $options.ROLES" :key="_role"
                :class="{selected: role === _role}" @click="select('role', _role)">
                {{name}}
            </td>
        </tr>
        <tr>
            <td class="separator" colspan="14"/>
        </tr>
        <tr>
            <td class="no_border"></td>
            <td class="menu no_click extreme">
                 9 BAND<br/>
                 <span>
                    <input 
                        type="checkbox"
                        v-model="special_9BAND_X"
                        />
                    extreme
                </span>
            </td>
            <td class="menu no_click">Challenge</td>
            <td class="col_no_border"></td>
            <td class="menu" :class="{selected: band === 'total'}"
                @click="select('band', 'total')">RDA</td>
            <td class="menu" v-for="(_band, index) in $options.BANDS" :key="index"
                :class="{selected: _band === band}"
                @click="select('band',_band)">{{_band}}</td>
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
      band: 'total',
      special: null
    }
  },
  methods: {
    select (type, value) {
      if (this[type] !== value) {
        if (this.special) {
          this.special = null
        }
        this[type] = value
        this.$emit('selector-change', type, value)
      }
    }
  },
  computed: {
    special_9BAND_X: {
      get() {
        return this.special == '9BAND-X'
      },
      set (val) {
        if (!val) {
          this.special = null
        } else {
          this.special = '9BAND-X'
          this.role = 'hunter'
          this.mode = 'total'
          this.band = 'total'
        }
        this.$emit('selector-change', 'special', this.special)
      }
    }
  }
}
</script>


