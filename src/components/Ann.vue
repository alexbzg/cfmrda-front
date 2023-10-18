<template>
    <div class="list">

        <div id="anons">
            <table class="anons_block" v-for="(item, idx) in announces" :key="idx" @click="item.expand = !item.expand">
                <tr>
                  <td class="announcer">
                    {{item.user}}<br/>
                  </td>
                  <td class="anons_link">
                    {{item.caption}}<br/>
                    <span class="date">
                        {{item.period}}
                    </span>
                  </td>
                  <td class="anons_del">
                    <template v-if="(userCallsign === item.user) || admin">
                      <img 
                        class="edit" 
                        src="/images/icon_edit.png" 
                        title="Изменить это сообщение" 
                        @click.stop="updateAnnounce(item)"/>
                      <img 
                        class="delete" 
                        src="/images/icon_delete.png" 
                        title="Удалить это сообщение" 
                        @click.stop="deleteAnnounce(item.id)"/>
                    </template>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="anons_text" v-show="item.expand">
                        <pre v-html="item.text"/>
                    </div>
                  </td>
                </tr>
            </table>

            <div id="add_anons">
                <div id="add_anons_link" @click="showForm = !showForm">Добавить анонс RDA экспедиции</div>
                <div id="add_anons_form" v-if="showForm">
                    <span id="anons_note">Раздел предназначен <u>только</u> для анонса RDA-экспедиций.</span>
                    <form @submit.prevent="sendAnnounce">
                      <table id="anons_form">
                        <tr>
                            <td>
                                <input required
                                    minLength="4"
                                    type="text" 
                                    id="anons_title" 
                                    v-model="editAnnounce.caption"
                                    class="no_latinize"/>
                            </td>
                            <td>
                                <input required
                                    type="date" 
                                    id="anons_date_start" 
                                    v-model="editAnnounce.start"
                                    :min="today()"
                                    @change="startChange"
                                    class="no_latinize"/>
                            </td>
                            <td>
                                <input required
                                    type="date" 
                                    id="anons_date_end" 
                                    :min="today()"
                                    v-model="editAnnounce.end"
                                    @change="endChange"
                                    class="no_latinize"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="note">название сообщения</td>
                            <td class="note">начало экспедиции</td>
                            <td class="note">конец экспедиции</td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <textarea 
                                    id="anons_text" 
                                    v-model="editAnnounce.text" 
                                    class="no_latinize">
                                </textarea><br/>
                                <input 
                                    type="submit" 
                                    class="btn" 
                                    value="Отправить" 
                                    :disabled="!userToken || pending">
                            </td>
                        </tr>
                    </table>
                  </form>
                </div>
            </div>

        </div>
    </div>

</template>

<script>
import {mapGetters} from 'vuex'

import {get, dataSend} from '../api'

const RE_TNXQSO_URL = new RegExp('https://(?:www\\.)?tnxqso\\.com/\\S*', "g")

export default {
  name: 'Ann',
  data () {
    const today = this.today()
    return { 
      pending: false,
      announces: [],
      showForm: false,
      editAnnounce: {
        caption: '',
        start: today,
        end: today,
        text: ''
      },
      response: null
    }
  },
  mounted () {
    this.loadAnnounces()
  },
  computed: {
    ...mapGetters(['userToken', 'admin', 'userCallsign']),
  },
  methods: {
    today () {
      return new Date().toISOString().substring(0, 10)
    },
    dateStringToLocaleString (s) {
      return new Date(Date.parse(s)).toLocaleDateString(undefined, 
                    {day: 'numeric', 
                    month: 'long', 
                    year: 'numeric'})
    },
    loadAnnounces () {
      get('/json/ann.json')
        .then(response => {
          for (const ann of response.data) {
            ann.expand = false
            ann.text = ann.text.replace(RE_TNXQSO_URL, '<a href="$&">$&</a>')
            if (ann.start === ann.end) 
                ann.period = this.dateStringToLocaleString(ann.start)
            else {
                const period = [ann.start, ann.end].map(s => this.dateStringToLocaleString(s))
                const period_split = period.map(s => s.split(" ", 3))
                if (period_split[0][2] !== period_split[1][2])
                    ann.period = `${period[0]} \u2014 ${period[1]}`
                else if (period_split[0][1] !== period_split[1][1])
                    ann.period = `${period_split[0][0]} ${period_split[0][1]} \u2014 ` + 
                        `${period_split[1][0]} ${period_split[1][1]} ${period_split[0][2]} г.`
                else 
                    ann.period = `${period_split[0][0]} \u2014 ${period_split[1][0]} ` + 
                        `${period_split[0][1]} ${period_split[0][2]} г.`
            }
          }
          this.announces = response.data
        })
    },
    send (data, method) {
      this.pending = true
      data.token = this.userToken
      return dataSend('announce', data, method)
        .then(() => {
          this.loadAnnounces()
        })
        .catch(e => {
          this.response = e.message
        })
        .finally(() => {
          this.pending = false
        })
    },
    sendAnnounce () {
      this.send(
        {announce: this.editAnnounce}, 
        this.editAnnounce.id ? 'PUT' : 'POST')
        .then(() => {
          const today = this.today()
          this.editAnnounce = {
            caption: '',
            start: today,
            end: today,
            text: ''
          }
          this.editAnnounce.caption = ''
        })
    },
    deleteAnnounce (id) {
      if (confirm("Вы действительно хотите удалить этот анонс?"))
        this.send({id}, 'DELETE')
    },
    updateAnnounce (announce) {
      const {id, user, caption, start, end, text} = announce
      this.editAnnounce = {id, user, caption, start, end, text}
      this.showForm = true
    },
    startChange () {
      if (this.editAnnounce.end < this.editAnnounce.start)
        this.editAnnounce.end = this.editAnnounce.start
    },
    endChange () {
      if (this.editAnnounce.end < this.editAnnounce.start)
        this.editAnnounce.start = this.editAnnounce.end
    }
  }
}
</script>

