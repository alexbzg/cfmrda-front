<template>
    <tr>
        <td class="elog">{{logger.logger}}</td>
        <td class="login">
            <input type="text" id="lotw_login" v-model="loginData.login"
                :class='{error: validationErrors.login}'/>
        </td>
        <td class="pass">
            <input type="password" id="lotw_pass" v-model="loginData.password"
                :class='{error: validationErrors.password}'/>
        </td>
        <td class="ok">
            <input type="submit" class="btn" value="OK" :disabled="!validated" @click="update">
        </td>
        <td class="status">
            <img v-if="logger.state in $options.STATES" 
                :src="'/images/icon_' + $options.STATES[logger.state].image +'.png'" 
                :title="$options.STATES[logger.state].title">
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
    const loginData = JSON.parse(JSON.stringify(this.logger.loginData))
    return { 
      loginData: loginData,
      validationData: loginData,
      validationSchema: this.logger.schema
    }
  },
  methods: {
    update () {
      this.$emit('logger-update', JSON.parse(JSON.stringify(this.loginData)))
    }
  }
}
</script>

