<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/cfm/">QSL card CFM</router-link>
        <router-link to="/cfm/loggers">eLogs CFM</router-link>
    </div>
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
export default {
  name: 'CFM',
  data () {
    return {}
  }
}
</script>
