<template>
    <div class="list">

        <div id="anons">
            <table class="anons_block" v-for="(item, idx) in ann" :key="idx" @click="item.expand = !item.expand">
                <tr>
                  <td class="announcer">{{item.callsign}}<br/><span>{{item.date}}</span></td>
                  <td class="anons_link">{{item.caption}}<br/><span class="date">{{item.period}}</span></td>
                  <td class="anons_del">
                      <img class="delete" src="/images/icon_delete.png" title="Удалить это сообщение" 
                        v-if="admin" @click.stop="deleteAnn(item)">
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="anons_text" v-show="item.expand">
                        <pre>{{item.text}}</pre>
                    </div>
                  </td>
                </tr>
            </table>

            <div id="add_anons">
                <div id="add_anons_link" @click="showForm = !showForm">Добавить анонс RDA экспедиции</div>
                <div id="add_anons_form" v-if="showForm">
                    <span id="anons_note">Раздел предназначен <u>только</u> для анонса RDA-экспедиций.</span>
                    <table id="anons_form">
                        <tr>
                            <td><input type="text" id="anons_title" v-model="newAnn.caption"></td>
                            <td><input type="text" id="anons_date" v-model="newAnn.period"></td>
                        </tr>
                        <tr>
                            <td class="note">название сообщения</td>
                            <td class="note">дата экспедиции</td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <textarea id="anons_text" v-model="newAnn.text"></textarea><br/>
                                <input type="submit" class="btn" value="Отправить" 
                                    :disabled="!validated" @click="postAnn()">
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

        </div>
    </div>

</template>

<script>
import {mapGetters} from 'vuex'

import {getAnn, annPost} from '../api'

import validationMixin from '../validation-mixin'

export default {
  mixins: [validationMixin],
  name: 'Ann',
  data () {
    const newAnn = { 
      text: '',
      period: '',
      caption: ''
    }
    return { 
      ann: [],
      showForm: false,
      newAnn: newAnn,
      pending: false,
      validationSchema: 'ann',
      validationData: {
          new: newAnn,
          token: this.$store.getters.userToken
      },
      response: null
    }
  },
  mounted () {
    this.loadAnn()
    this.validate()
  },
  computed: {
    ...mapGetters(['userToken', 'admin']),
  },
  watch: {
    userToken (newVal) {
      this.validationData.token = newVal
    }
  },
  methods: {
    loadAnn () {
      getAnn()
        .then(data => {
          for (const ann of data)
            ann.expand = false
          this.ann = data
        })
    },
    post (data) {
      this.pending = true
      annPost(data)
        .then(() => {
          this.newAnn.text = ''
          this.newAnn.period = ''
          this.newAnn.caption = ''
          this.loadAnn()
        })
        .catch(e => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    },
    postAnn () {
      this.post(this.validationData)
    },
    deleteAnn (ann) {
      if (confirm("Вы действительно хотите удалить этот анонс?"))
        this.post({token: this.userToken, delete: ann.ts})
    }
  }
}
</script>

