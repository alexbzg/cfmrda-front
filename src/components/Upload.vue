<template>
    <div class="list list_small">
      <div id="upload">
        <div id="upload_form">
          <span class="red">Загружать файлы ADI необходимо только <b>раздельно</b> по каждому RDA-району!</span><br/><br/>
          <b>Позывной RDA экспедиции</b><br/>
          <input type="text" name="callsign_input" id="callsign_input"><br/>
          <b>RDA район</b><br/>
          <input type="text" name="rda_input" id="rda_input"><br/>
          <input type="button" name="upload_btn" id="upload_btn" value="Загрузить новый ADI файл" class="btn"><br/>
        </div> 

        <div id="uploading_info">
          Идёт загрузка файла...<br/>
          <img id="uploading" src="images/spinner.gif" border="0" />
        </div>

        <div id="check_upload">
          <p>
            <u>Проверьте правильность информации</u>:<br/>
            Позывной: <span>R7AB/M</span><br/>
            RDA-район: <span>RO-40</span><br/>
            Файл: <span>r7ab_RO40.adif</span>
          </p>
          <input type="radio" name="ok_del_input" id="ok_input"> 
          <span>Да, всё верно</span> 
          <input type="radio" name="ok_del_input" id="del_input"> 
          <span>Нет, есть ошибка.</span> Удалить.<br/>
          <input type="button" name="login_btn" id="ok_btn" value="OK" class="btn">
        </div>
      </div>
    </div>   
</template>

<script>
// import api from '../api'

export default {
  name: 'upload',
  data () {
    return {
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userCallsign) {
        vm.$router.push( '/login' )
      }
    })
  },
  methods: {
  }
}
</script>

