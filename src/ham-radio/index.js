import rdaShort from '../rdaShort.json'

export const BANDS = ['1.8', '3.5', '7', '10', '14', '18', '21', '24', '28']

export const BANDS_WL = {'160M': '1.8', '80M': '3.5', '40M': '7', 
        '30M': '10', '20M': '14', '17M': '18', '15M': '21', 
        '12M': '24', '10M': '28'}

export function orderedBands() {
  return BANDS.slice().sort((a, b) => {
        return Number(a) - Number(b)
      })
}

export function bandWl (band) {
  return Object.keys(BANDS_WL).find(wl => BANDS_WL[wl] === band);  
}

export const MODES = ['CW', 'SSB', 'DIGI']
export const ROLES = {hunter: 'Hunter', activator: 'Activator'}

const rdaValues = []
for (const group of rdaShort) {
  for (let c = 1; c <= group.last; c++) {
    if ('skip' in group && group.skip.includes(c)) {
      continue
    }
    rdaValues.push(group.group + '-' + (c < 10 ? '0' + c : c))
  }
}
export {rdaValues}

const reRDA = /([a-z][a-z])[-_ ]?(\d\d)/gi

export function parseRDA (val) {
  let rdaMatch = null
  let r = null
  while ((rdaMatch = reRDA.exec(val)) !== null) {
    let rda = (rdaMatch[1] + '-' + rdaMatch[2]).toUpperCase()
    if (rdaValues.includes(rda)) {
      r = rda
      break
    }
  }
  reRDA.lastIndex = 0
  return r
}


const reSTRIP_CALLSIGN = /\d*[a-zA-Z]+\d+[a-zA-Z]+/

export function stripCallsign(callsign) {
    let match = null
    if (match = reSTRIP_CALLSIGN.exec(callsign))
        return match[0]
    else
        return null
}

const reCALLSIGN_FULL = /^(:?[A-Z\d]+\/)?\d?[A-Z]+\d+[A-Z]+(:?\/[A-Z\d]+)*$/

export function validCallsignFull (callsign) {
  return reCALLSIGN_FULL.test(callsign)
}

