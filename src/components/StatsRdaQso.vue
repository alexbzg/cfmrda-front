<template>
<div id="stats_qso">

    <table id="mode_stats">
        <tr>
            <td class="top menu active">MIX</td>
            <td class="top menu">CW</td>
            <td class="top menu">SSB</td>
            <td class="top menu">DIGI</td>
        </tr>
    </table>


    <table id="table_stats">
        <tr>
            <td class="top"></td>
            <td class="top">All</td>
            <td class="top">1.8</td>
            <td class="top">3.5</td>
            <td class="top">7</td>
            <td class="top">10</td>
            <td class="top">14</td>
            <td class="top">18</td>
            <td class="top">21</td>
            <td class="top">24</td>
            <td class="top plus">28</td>
        </tr>
        <tr>
            <td colspan="11" class="no_border" style="padding: 0;">
                <div id="window_stats">

                <table id="table_stats_list">
                    <tr>
                        <td class="rda">AD-01</td>
                        <td>352</td>
                        <td>5</td>
                        <td>45</td>
                        <td>121</td>
                        <td>255</td>
                        <td>11</td>
                        <td>0</td>
                        <td>53</td>
                        <td>0</td>
                        <td>1</td>
                    </tr>
                </table>
                </div>
            </td>
        </tr>
    </table>
</div>

</template>

<script>
import rdaShort from '../rdaShort.json'
import {orderedBands} from '../ham-radio'


export default {
  name: 'StatsRdaQso',
  data () {
    const msg = { 
      text: null
    }
    const token = this.$store.getters.userToken
    if (token) {
      msg.token = token
    } else {
      msg.recaptcha = null
      msg.email = storeEmail.load()
    }
    return { 
      msg: msg,
      pending: false,
      validationSchema: 'contactSupport',
      validationData: msg,
      response: null
    }
  },
  mounted () {
    this.validate()
  },
  computed: {
    ...mapGetters(['userToken']),
  },
  watch: {
    userToken: function (newVal) {
      this.msg.token = newVal
      if (!newVal) {
        this.msg.recaptcha = null
        this.msg.email = storeEmail.load()
      }
    }
  },
 methods: {

    sendClick: debounce(function () {
      this.send()
    }, 300, true),

    send () {

      if (this.msg.email) {
        storeEmail.save(this.msg.email)
      }
      this.pending = true
      
      contactSupport(this.msg)
        .then(() => {
          this.response = 'Ваше сообщение было отправлено.'
          this.msg.text = null
        })
        .catch((e) => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

