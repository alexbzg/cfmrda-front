<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/cfm/">CFM RDA by email</router-link>
        <!--router-link to="/cfm/paper">CFM RDA by paper QSL</router-link-->
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
