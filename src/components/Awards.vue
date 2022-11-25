<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/awards/">Правила - Rules</router-link>
        <router-link to="/awards/issued">Выданные дипломы - Issued awards</router-link>
        <router-link to="/awards/gallery">Галерея - Gallery</router-link>
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
