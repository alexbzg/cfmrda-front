<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/cfm/email">Email CFM</router-link>
        <router-link to="/cfm/paper">Paper QSL CFM</router-link>
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
