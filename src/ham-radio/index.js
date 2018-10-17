import rdaShort from '../rdaShort.json'

export const BANDS = ['1.8', '3.5', '7', '10', '14', '18', '21', '24', '28']

export function orderedBands() {
  return BANDS.slice().sort((a, b) => {
        return Number(a) - Number(b)
      })
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

