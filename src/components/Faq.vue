<template>
  <div class="list list_small">
    <div id="faq">
      <ol>
        <li><span style="color: #900; font-decoration: underline; font-weight: bold;">Регистрация необходима только для Activator'ов RDA районов</span>.</li>

        <li>Загрузить свой ADIF может любой российский радиолюбитель. Для проверки подлинности регистрирующегося Uploader'a используется <b>публичный e-mail</b>, который показывается на его QRZ.com странице.</li>

        <li>Все загруженные файлы подвергаются <b>постмодерации</b>, особое внимание уделяется файлам с различными позывными Activator'а и Uploader'a (дроби в позывных не учитываются).</li>

        <li><b>Отличие All RDA и All bands</b>.<br/>
        All RDA - КОЛИЧЕСТВО сработанных RDA не зависимо от диапазона в выбранном MODE<br/>
        All bands - СУММА сработанных RDA по диапазонам в выбранном MODE<br/>
        (Если вы Activator, то All bands может быть меньше чем All RDA, т.к. некоторые RDA на диапазоне не набрали 100 зачетных QSO)</li>
      </ol>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Faq',
  data () {
    return {}
  }
}
</script>
