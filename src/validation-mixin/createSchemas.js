import schemasTmplt from './schemas.json'

import {rdaValues} from '../ham-radio'

export default function () {
  let schemasStr = JSON.stringify(schemasTmplt)
  schemasStr = schemasStr.replace(/"\$rdaValues\$"/g, JSON.stringify(rdaValues))
  return JSON.parse(schemasStr)
}
