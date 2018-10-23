<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/uploads/new">Загрузить ADIF</router-link>
        <router-link to="/uploads/manage">Мои загрузки</router-link>
    </div>
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
export default {
  name: 'Uploads',
  data () {
    return {}
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userCallsign) {
        vm.$router.push('/')
      }
    })
  }
}
</script>
