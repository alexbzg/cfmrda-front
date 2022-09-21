<template>
    <tr>
        <td class="elog" v-if="logger">
            {{logger}}
        </td>
        <td class="elog" v-else>
            <select v-model="logger" @change="loggerSelected()">
                <option disabled selected value="null">Выберите eLog</option>
                <option v-for="(params, logger) in loggers" :key="logger" :value="logger">
                    {{logger}}
                </option>
            </select>
        </td>
        <td class="login">
            <template v-if="logger">
                <input :type="field.includes('assword') ? 'password' : 'text'"
                    v-for="field in loggers[logger].loginDataFields" :key="field"
                    v-model.trim="loginData[field]" :placeholder="field"
                    :class='{error: validationErrors[field]}'/>
            </template>
        </td>
        <td class="ok">
            <input type="submit" class="btn" value="OK" :disabled="!validated || account.pending"
                @click="updateAccount()">
        </td>
        <td class="status">
            <img v-if="account.state in $options.STATES"
                :src="'/images/icon_' + $options.STATES[account.state].image +'.png'"
                :title="$options.STATES[account.state].title"/>
            <img v-if="account.pending" src="/images/spinner2.gif"/>
        </td>
        <td class="del" @click="deleteAccount()">
            <img src="/images/icon_delete.png" title="Удалить строку - Delete this line">
        </td>
        <td class="qso">{{account.qsoCount}}</td>
        <td class="date">{{account.lastUpdated}}</td>
        <td class="update_req">
            <img 
                v-if="update_queue" 
                src="/images/spinner2.gif"/>
            <input 
                v-else 
                type="button" class="btn" value="Обновить - Update" 
                @click="updateRequest"/>
        </td>
    </tr>
</template>

<script>
import validationMixin from '../validation-mixin'

const STATES = {
  0: {
    image: 'connected',
    title: 'Проверено - Checked'
  },
  1: {
    image: 'not_connected',
    title: 'Ошибка - Error'
  }
}

export default {
  STATES: STATES,
  mixins: [validationMixin],
  props: ['account', 'loggers'],
  name: 'LoggersCfmItem',
  data () {
    const loginData = {}
    return {
      logger: this.account.logger,
      loginData: loginData,
      validationData: loginData,
    }
  },
  mounted () {
    this.loginDataInit()
    this.setValidationSchema()
    if (this.validationSchema)
      this.validate()
  },
  methods: {
    setValidationSchema () {
      if (this.logger)
        this.validationSchema = this.loggers[this.logger].schema
    },
    loggerSelected () {
      this.loginDataInit()
      this.setValidationSchema()
      this.validate()
    },
    loginDataInit () {
      for (const field of Object.keys(this.loginData))
        delete this.loginData[field]
      if (this.account && this.account.loginData) {
        for (const field of Object.keys(this.account.loginData))
          this.$set(this.loginData, field, this.account.loginData[field])
      } else if (this.logger) {
        for (const field of this.loggers[this.logger].loginDataFields)
          this.$set(this.loginData, field, null)
      }
    },
    updateAccount () {
        this.$emit('account-update',
          {logger: this.logger, loginData: JSON.parse(JSON.stringify(this.loginData))})
    },
    deleteAccount () {
      this.$emit('account-delete')
    },
    updateRequest () {
      this.$emit('account-request-update')
    }
 },
 computed: {
   update_queue () {
    return this.account.lastUpdated === null || 
        (Date.now() - Date.parse(this.account.lastUpdated))/1000 > 604800
   }
 }
}
</script>

