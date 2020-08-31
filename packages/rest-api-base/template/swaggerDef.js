const pjson = require('./package.json')

module.exports = {
  info: {
    // API informations (required)
    title: `CLASSCARD Rest API - ${pjson.name}`, // Title (required)
    version: pjson.version, // Version (required)
    description: ``,
    contact: {
      email: 'info@ueshka.ru'
    }
  },
  host: 'localhost', // Host (optional)
  schemes: ['http'],
  // basePath: '/', // Base path (optional)
  apis: [
    'test/*.js',
    'test/**/*.js'
  ]
}
