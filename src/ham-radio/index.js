export const BANDS = ['1.8', '3.5', '7', '10', '14', '18', '21', '24', '28']

export function orderedBands() {
  return BANDS.slice().sort((a, b) => {
        return Number(a) - Number(b)
      })
}

export const MODES = ['CW', 'SSB', 'DIGI']
