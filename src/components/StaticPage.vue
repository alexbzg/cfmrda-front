<template>
  <div v-async-html="page" @load="load()">
  </div>
</template>
<script>
export default {
  name: 'StaticPage',
  props: ['page'],
  data () {    
    return {}
  },
  methods: {
    load () {
      if (this.$route.hash) {
        let id = this.$route.hash
        id = id.substring(1, id.length)
        const el = document.getElementById(id)
        if (el)
          el.scrollIntoView()
      }
    }
  }
}
</script>
