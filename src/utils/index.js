// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
//from Underscore.js
export function debounce(func, wait, immediate) {
  var timeout
  return function() {
    var context = this, args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args);
  }
}

export function isEmpty (obj) {
  return Object.keys(obj).length === 0
}

export function arrayUnique (a) {
  return a.filter((item, index) => {return a.indexOf(item) === index})
}

export function arraysEqSets (a, b) {
  if (a === null && b === null)
    return true
  if (a === null || b === null)
    return false
  if (a.length !== b.length)
    return false
  return a.filter((i) => {return b.indexOf(i)<0}).length === 0
}
