<template>
    <select-array :value="value" @input="selectChange" :options="$options.BANDS">
    </select-array>
</template>
<script>

import {orderedBands} from '../ham-radio'
import SelectArray from './SelectArray'

export default {
  BANDS: orderedBands(),
  name: 'SelectBand',
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
