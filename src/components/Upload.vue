<template>
    <div class="list list_small">
        upload
    </div>
   
</template>

<script>
// import api from '../api'

export default {
  name: 'upload',
  data () {
    return {
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userCallsign) {
        vm.$router.push( '/login' )
      }
    })
  },
  methods: {
  }
}
</script>

