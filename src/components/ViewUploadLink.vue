<template>
    <a :href="'/viewUpload.html?id=' + id" target="_blank">
        <slot></slot>
    </a>
</template>
<script>
export default {
  name: 'ViewUploadLink',
  props: ['id'],
  data () {
    return {}
  }
}
</script>
