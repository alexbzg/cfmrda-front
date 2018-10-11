var Ajv = require('ajv'); 
var ajv = new Ajv({sourceCode: true}); 
var pack = require('ajv-pack');

var schemas = require('./schemas.json');

var validators = {};
for (var schema in schemas) {
    var validator = ajv.compile(schemas[schema]);
    validators[schema] = pack(ajv, validator);
}

var fs = require('fs');
var path = require('path');
fs.writeFileSync(path.join(__dirname, '/validators.json'), JSON.stringify(validators));

