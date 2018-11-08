<template>
  <div class="list list_small" v-async-html="$route.params.page">
  </div>
</template>
<script>
export default {
  name: 'Faq',
  data () {    
    return {}
  }
}
</script>
