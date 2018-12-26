<template>
  <div v-async-html="page">
  </div>
</template>
<script>
export default {
  name: 'StaticPage',
  props: ['page'],
  data () {    
    return {}
  }
}
</script>
