<template>
    <tr>
        <td class="elog">{{logger.logger}}</td>
        <td class="login">
            <input :type="field === 'password' ? 'password' : 'text'" 
                v-for="field in logger.loginDataFields" :key="field" 
                v-model="loginData[field]" :placeholder="field"                
                :class='{error: validationErrors[field]}'/>
        </td>
        <td class="ok">
            <input type="submit" class="btn" value="OK" :disabled="!validated || logger.pending" @click="update">
        </td>
        <td class="status">
            <img v-if="logger.state in $options.STATES" 
                :src="'/images/icon_' + $options.STATES[logger.state].image +'.png'" 
                :title="$options.STATES[logger.state].title"/>
            <img v-if="logger.pending" src="/images/spinner2.gif"/> 
        </td>
        <td class="qso">{{logger.qsoCount}}</td>
        <td class="date">{{logger.lastUpdated}}</td>
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
  props: ['logger'],
  name: 'LoggersCfmItem',
  data () {
    const loginData = this.logger.loginData ? 
        JSON.parse(JSON.stringify(this.logger.loginData)) : {}
    if (!this.loggerLoginData)
      for (const field of this.logger.loginDataFields)
        loginData[field] = null
    return { 
      loginData: loginData,
      validationData: loginData,
      validationSchema: this.logger.schema
    }
  },
  mounted () {
    this.validate()
  },
  methods: {
    update () {
      this.$emit('logger-update', JSON.parse(JSON.stringify(this.loginData)))
    }
  }
}
</script>

