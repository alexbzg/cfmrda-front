<template>
    <select :value="value" @input="selectChange($event)">
        <option v-for="(band, idx) in options" :key="idx">{{band}}</option>
    </select>
</template>
<script>

export default {
  name: 'SelectArray',
  props: ['value', 'options'],
  data () {
    return {}
  },
  methods: {
   selectChange (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>
