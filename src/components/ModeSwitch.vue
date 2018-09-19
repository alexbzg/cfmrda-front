<template>
    <table class="select_view select_view_mode">
        <tr>
            <td :class="{selected: mode === 'total'}" @click="select('total')">Все</td>
            <td v-for="(_mode, idx) in $options.MODES" :key="idx"
                @click="select(_mode)" :class="{selected: mode === _mode}">{{_mode}}</td>
        </tr>
    </table>
</template>

<script>
import {MODES} from '../ham-radio'

export default {
  MODES: MODES,
  name: 'modeSwitch',
  data () {
    return {
      mode: 'total'
    }
  },
  methods: {
    select (mode) {
      if (this.mode !== mode) {
        this.mode = mode
        this.$emit('mode-change', mode)
      }
    }
  }
}
</script>


