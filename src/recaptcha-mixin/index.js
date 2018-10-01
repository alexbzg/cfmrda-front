import VueRecaptcha from 'vue-recaptcha'

import {RECAPTCHA_SITE_KEY} from '../consts'

export default {
  RECAPTCHA_SITE_KEY: RECAPTCHA_SITE_KEY,
  components: {VueRecaptcha},
  methods: {
    onRecaptchaVerify (response) {
      this.$set(this.validationData, 'recaptcha', response)
    },
    onRecaptchaExpired () {
      this.$set(this.validationData, 'recaptcha', null)
    },
    resetRecaptcha () {
      this.onRecaptchaExpired()
      this.$refs.recaptcha.reset()
    }
  }
}


