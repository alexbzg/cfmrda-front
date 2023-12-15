import schemasTmplt from './schemas.json'

import {rdaValues} from '../ham-radio'

const replace = {
    rdaValues: JSON.stringify(rdaValues),
    reCallsignBase: String.raw`"^\\d?[A-Z]+\\d+[A-Z]+$"`,
    reCallsignFull: String.raw`"^(:?[A-Z\\d]+\\/)?(:?\\d?[A-Z]+\\d+[A-Z]+|RAEM)(:?\\/[A-Z\\d]+)*$"`
}

export default function () {
  let schemasStr = JSON.stringify(schemasTmplt)
  for (const r in replace) {
    const re = new RegExp(String.raw`"\$${r}\$"`, 'g')
    schemasStr = schemasStr.replace(re, replace[r])
  }
  //return schemasStr
  return JSON.parse(schemasStr)
}
