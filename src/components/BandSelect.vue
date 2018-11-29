<template>
    <select :value="value" @input="bandChange($event)">
        <option v-for="(band, idx) in $options.BANDS" :key="idx">{{band}}</option>
    </select>
</template>
<script>
import {orderedBands} from '../ham-radio'

export default {
  BANDS: orderedBands(),
  name: 'BandSelect',
  props: ['value'],
  data () {
    return {}
  },
  methods: {
    bandChange (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>
