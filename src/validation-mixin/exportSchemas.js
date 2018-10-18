import fs from 'fs'
import createSchemas from './createSchemas'

if (process.argv.length > 2) {
  const schemas = JSON.stringify(createSchemas())
  fs.writeFile(process.argv[2], schemas, (err) => {
    if (err) throw err
    console.log('OK')
  })
}
