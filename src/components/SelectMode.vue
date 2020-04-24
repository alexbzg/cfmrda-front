<template>
    <select-array :value="value" @input="selectChange" :options="$options.MODES">
    </select-array>
</template>
<script>

import {MODES} from '../ham-radio'
import SelectArray from './SelectArray'

export default {
  MODES: MODES,
  name: 'SelectMode',
  components: {SelectArray},
  props: ['value'],
  data () {
    return {}
  },
  methods: {
   selectChange (value) {
     this.$emit('input', value)
   }
  }
}
</script>
