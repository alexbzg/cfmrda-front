<template>
  <input type="text" :value="value" v-capitalize @input="rdaChange($event)" :placeholder="placeholder"/>
</template>
<script>
import {parseRDA} from '../ham-radio'

export default {
  name: 'RdaInput',
  props: ['value', 'placeholder'],
  data () {
    return {}
  },
  methods: {
    rdaChange (e) {
      const rda = parseRDA(e.target.value)
      this.$emit('input', rda ? rda : e.target.value)
    }
  }
}
</script>
