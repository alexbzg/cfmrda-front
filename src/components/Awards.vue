<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/awards/rules">Правила/Rules</router-link>
        <router-link to="/awards/">Выданные дипломы/Issued awards</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'Awards',
  data () {
    return {}
  }
}
</script>
