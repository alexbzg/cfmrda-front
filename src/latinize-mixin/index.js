const LAT = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>[];\',.'
export const RUS = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮхъжэбю'
const ALPH_LENGTH = LAT.length

function latinize (txt) {
  if (txt && txt.length > 0) {
    for (let i = 0; i < ALPH_LENGTH; i++) {        
      txt = txt.replace(RUS[i], LAT[i])
      if (LAT[i].toLowerCase != LAT[i]) {
        txt = txt.replace(RUS[i].toLowerCase(), LAT[i].toLowerCase())
      }
    }
  }
  return txt
}

export default {
  updated () {
    this.$nextTick(function () {
    const handler = function (e) {
      const latinized = latinize(e.target.value)
      if (e.target.value && e.target.value !== latinized) {
        e.target.value = latinized
        e.target.dispatchEvent(new CustomEvent('input'))
      }
    }
    const dsc = this.$el.querySelectorAll('input[type="text"]:not(.no_latinize):not(.latinized), textarea:not(.no_latinize):not(.latinized)')
    for (const el of dsc) {
      el.addEventListener('input', handler)
      el.classList.add('latinized')
    }
  })}
}
