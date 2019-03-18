<template>
  <div class="list">
    <div id="stats">
        <div id="list_menu">
            <router-link to="/stats/">Количество QSO из RDA</router-link>
        </div>
        <router-view></router-view>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Stats',
  data () {
    return {}
  }
}
</script>
