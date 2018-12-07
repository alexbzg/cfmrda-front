<template>
    <div class="list">
        <h4>CFM QSO</h4>
        <p>Пожалуйста, <b>подтвердите</b>, что вы не хотите получать запросы на подтверждение QSO.</p>
        <input type="button" name="cfm_btn" id="cfm_btn" value="Подтвердить" class="btn"
            @click="submitClick()" v-if="!pending && !success">
        <div v-if="response" id="message" :class="{success: success}" v-html="response"></div>
    </div>
</template>
<script>
import {cfmBlacklist} from '../api'

export default {
  name: 'CfmBlacklist',
  data () {
    return {
      token: this.$route.query.token,
      pending: false,
      success: false,
      response: null
    }
  },
  methods: {
    submitClick () {
      this.pending = true
      cfmBlacklist(this.token)
        .then(() => {
          this.success = true
          this.response = "Вы больше не будете получать запросы на подтверждение QSO."
        })
        .catch((e) => {
          this.success = false
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>
