<template>
    <tbody>
        <tr>
            <td colspan="9" class="search_result">
                <slot></slot>
            </td>
        </tr>
        <tr v-for="upload in uploads" :key="upload.id">
            <td class="allow" v-if="admin">
                <input type="checkbox" name="allow_check" id="allow_check" 
                    v-model="upload.enabled" @input="changeEnabled(upload)">
            </td>
            <td class="rda">
                <a href="#">
                    <span v-for="(rda, idx) in upload.rda" :key="idx">{{rda}}</span>
                </a>
            </td>
            <td class="callsign">
                <span v-for="(callsign, idx) in upload.stations" :key="idx">{{callsign}}</span>
            </td>
            <td class="callsign">
                <span v-for="(callsign, idx) in upload.activators" :key="idx">{{callsign}}</span>
            </td>
            <td class="qsos">{{upload.qsoCount}}</td>
            <td class="period">{{upload.dateStart}} - {{upload.dateEnd}}</td>
            <td class="uploader" v-if="admin">{{upload.uploader}}</td>
            <td class="upload_date">{{upload.uploadDate}}</td>
            <td class="del">
                <img src="images/icon_delete.png" title="Удалить этот файл" @click="deleteUpload(upload)">
            </td>
        </tr>
    </tbody>
</template>

<script>
import {GET_UPLOADS_ACTION} from '../store'

export default {
  name: 'UploadsTable',
  props: ['admin', 'uploads'],
  data () {
    return {
    }
  },
  methods: {
    changeEnabled (upload) {
      this.$store.dispatch(GET_UPLOADS_ACTION,
        {enabled: upload.enabled,
        id: upload.id})
    },
    deleteUpload (upload) {
      this.$store.dispatch(GET_UPLOADS_ACTION,
        {delete: 1,
        id: upload.id})
    }
  }
}
</script>


