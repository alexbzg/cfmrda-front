import _ from 'underscore'

export default {
  data () {
    return {
      validationData: {},
      validationSchema: null,
      validationErrors: {}
    }
  },
  methods: {
    validate() {
      this.$store.getters.validate(this.validationSchema, this.validationData, this.validateCallback)
    },
    validateCallback (valid, errors) {
      this.$set(this, 'validationErrors', {})
      if (!valid) {
        for (const item of errors) {
          this.$set(this.validationErrors, item.dataPath.substr(1), item.message)
        }
        if (this.validationErrors.recaptcha) {
          this.$refs.recaptcha.execute()
        }
      }
    }
  },
  watch: {
    validationData: {
      handler: function () { this.validate() },
      deep: true
    },
    validationSchema: {
      handler: function () {
        const vm = this
        vm.$nextTick(function () {
          vm.validate()
        })
      }
    }
  },
  computed: {
    validated() {
      return _.isEmpty(this.validationErrors)
    }
  }
}
