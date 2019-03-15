<template>
    <div class="radio_btns_mode">
        <div :class="{selected: value === 'total'}" @click="switchMode('total')">Mix</div>
        <template v-if="!hideModes">
            <div v-for="(_mode, idx) in $options.MODES" :key="'mode' + idx"
                @click="switchMode(_mode)" :class="{selected: value === _mode}">{{_mode}}</div>
        </template>
    </div>
</template>
<script>

import {MODES} from '../ham-radio'

export default {
  MODES: MODES,
  name: 'RadioBtnsMode',
  props: ['value', 'hideModes'],
  data () {
    return {}
  },
  methods: {
   switchMode (mode) {
      this.$emit('input', mode)
    }
  }
}
</script>
