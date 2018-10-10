import jsen from 'jsen'

import schemasTmplt from './schemas.json'
import rdaShort from '../rdaShort.json'

let schemasStr = JSON.stringify(schemasTmplt)

const rdaValues = []

for (const group of rdaShort) {
  for (let c = 1; c <= group.last; c++) {
    if ('skip' in group && group.skip.includes(c)) {
      continue
    }
    rdaValues.push(group.group + '-' + (c < 10 ? '0' + c : c))
  }
}
schemasStr = schemasStr.replace('"$rdaValues$"', JSON.stringify(rdaValues))
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
