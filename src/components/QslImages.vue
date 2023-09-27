<template>
    <span>
        <a href="#" 
            v-for="imgType in ['image', 'imageBack']"
            @click.prevent="showImage(qso, imgType)" 
            :key="'qsl_img_' + qso.id + '_' + imgType"
            v-if="qso.state === null && qso[imgType]">
            <img src="/images/icon_qsl.png" 
                :title="'Просмотр QSL ' + imgSize" 
                ref="img">
        </a>
    </span>
</template>
<script>
export default {
  name: 'QslImages',
  props: ['qso', 'activeImage'],
  data () {
    return {
      imgSize: null
    }
  },
  methods: {
    showImage(qso, imgType) {
      let imgData = {
        qso, 
        src: `/qsl_images/${qso.qslId}_${imgType}_${qso[imgType]}`,
        fileSize: null
      }
      if (this.activeImage && this.activeImage.qso === qso && this.activeImage.src === imgData.src) {
        imgData = null
      }
      this.$emit('show-qsl-image', imgData)
    }
  }
}
</script>
