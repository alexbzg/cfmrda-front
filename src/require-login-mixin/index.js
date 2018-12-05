export default {
   beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userCallsign) {
        vm.$router.push('/login')
      }
      if (vm.requireAdmin && !vm.$store.getters.admin) {
        vm.$router.push('/')
      }
    })
  }
}
