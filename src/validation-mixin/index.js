import jsen from 'jsen'

import schemasTmplt from './schemas.json'

let schemasStr = JSON.stringify(schemasTmplt)

import {rdaValues} from '../ham-radio'

schemasStr = schemasStr.replace(/"\$rdaValues\$"/g, JSON.stringify(rdaValues))
const schemas = JSON.parse(schemasStr)

const validators = {}
for (const name in schemas) {
  validators[name] = jsen(schemas[name], {greedy: true})
}

/*
import validatorFunctions from './validators.json'
const validators = {}
for (const name in validatorFunctions) {

}
*/
export default {
  data () {
    return {
      validationData: {},
      validationSchema: null,
      validationErrors: { dumbField: 1 }
    }
  },
  methods: {
    validate() {
      const valid = validators[this.validationSchema](this.validationData)
      this.validateCallback(valid, validators[this.validationSchema].errors)
    },
    validateCallback (valid, errors) {
      this.$set(this, 'validationErrors', {})
      if (!valid) {
          /*
        for (const item of errors) {
          this.$set(this.validationErrors, item.dataPath.substr(1), item.message)
        }*/
        for (const item of errors) {
          this.$set(this.validationErrors, item.path, item.keyword)
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
      return Object.keys(this.validationErrors).length === 0
    }
  }
}
