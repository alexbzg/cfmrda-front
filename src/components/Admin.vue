<template>
  <div class="list">
    <div id="list_menu">
        <router-link to="/admin/uploads">Загрузки ADIF</router-link>
        <router-link to="/admin/qsl">QSL карточки</router-link>
        <router-link to="/admin/callsigns">Позывные</router-link>
    </div>
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
import requireLoginMixin from '../require-login-mixin'
export default {
  name: 'CFM',
  requireAdmin: true,
  mixins: [requireLoginMixin],
  data () {
    return {}
  }
}
</script>
