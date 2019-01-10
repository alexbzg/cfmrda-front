<template>
    <div class="list">
        <div id="autologin">
            <h6>Спасибо, что воспользовались сервисом CFMRDA.ru</h6>
            <span id="new_user">
                Чтобы вы не "мучались" с регистрацией, <b>мы уже зарегистрировали вас</b> на сайте:<br/>
                Ваш логин - <span class="log_pass">{{user.callsign}}</span><br/>
                Ваш пароль - <span class="log_pass">{{user.password}}</span><br/>
            </span>
            <br/>
            <router-link id="autologin_link" to="/uploads">
                Загрузите, пожалуйста, ваш лог в базу данных CFMRDA.ru
            </router-link> 
            <div id="autologin_info">
                Этим вы:<br/>
                1. Сделаете доброе дело, подтвердив свой RDA для охотников.<br/>
                2. Оградите себя от запросов на подтверждение RDA.
            </div>
            С уважением, команда CFMRDA.ru<br/>
            <span class="note">При желании вы можете сменить пароль через форму 
                <router-link to="/login">Восстановление пароля</router-link>.
            </span>
        </div>
    </div>
</template>
<script>
export default {
  name: 'AutoRegistration',
  props: ['user'],
  data () {    
    return {}
  }
}
</script>
