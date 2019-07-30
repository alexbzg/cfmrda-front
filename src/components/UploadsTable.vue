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
                    v-model="upload.enabled" @click="changeEnabled(upload, $event)">
            </td>
            <td class="rda">
                <view-upload-link :id="upload.id">
                    <template v-if="upload.extLoggerId">
                        {{upload.uploadType}}
                    </template>
                    <template v-else>
                        <span v-for="(rda, idx) in upload.rda" :key="idx">{{rda}}</span>
                    </template>
                </view-upload-link>
            </td>
            <td class="callsign">
                <template v-if="!upload.extLoggerId">
                    <span v-for="(callsign, idx) in upload.stations" :key="idx">
                        {{replace0(callsign)}}
                    </span>
                </template>
            </td>
            <td class="callsign">
                <span v-for="(callsign, idx) in upload.activators" :key="idx">{{replace0(callsign)}}</span>
            </td>
            <td class="qsos">{{upload.qsoCount}}</td>
            <td class="period">{{upload.dateStart}} - {{upload.dateEnd}}</td>
            <td class="uploader" v-if="admin">{{replace0(upload.uploader)}}
                <span v-if="upload.uploadType !== 'adif'">({{upload.uploadType}})</span>
            </td>
            <td class="upload_date">{{upload.uploadDate}}</td>
            <td class="del">
                <img src="images/icon_delete.png" title="Удалить этот файл" @click="deleteUpload(upload)">
            </td>
        </tr>
    </tbody>
</template>

<script>
import ViewUploadLink from './ViewUploadLink.vue'

import ReplaceZerosMixin from '../replace-zeros-mixin'

export default {
  name: 'UploadsTable',
  components: {ViewUploadLink},
  mixins: [ReplaceZerosMixin],
  props: ['admin', 'uploads', 'pending'],
  data () {
    return {
    }
  },
  methods: {
    changeEnabled (upload, event) {
      if (confirm("Вы действительно хотите изменить допуск файла?")) {
        this.$emit('edit-uploads',
          {enabled: !upload.enabled,
          id: upload.id})
      } else 
        event.preventDefault()
    },
    deleteUpload (upload) {
      if (confirm("Вы действительно хотите удалить файл?")) {
        this.$emit('edit-uploads',
          {delete: 1,
          id: upload.id})
      }
    }
  }
}
</script>


