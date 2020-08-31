const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const PROCESS_DIR = path.join(process.cwd(), '');

let settings = {
  _hash: {},
  get: function (key) {
    return this._hash[key];
  },
  set: function (key, value) {
    this._hash[key] = value;
  }
};
settings.set('env', process.env.NODE_ENV || 'development');
settings.set('app-dir', PROCESS_DIR);
settings.set('app-name', 'node-app')

let pjson = require('../../package.json');
if (pjson) {
  settings.set('app-name', pjson.name)
  let backend_version_int = pjson.version.split('.').map((x, i) => parseInt(x) * (Math.pow(100, 2 - i))).reduce((a, b) => a + b);
  let v = {
    backend: pjson.version,
    backend_int: backend_version_int
  };
  settings.set('version', v);
}

const CONF_FILE = path.join(PROCESS_DIR, `etc/${settings.get('app-name')}/main.json`);
const LOG_CONF_FILE = path.join(PROCESS_DIR, `etc/${settings.get('app-name')}/logger.json`);

if (!fs.existsSync(CONF_FILE)) {
  fs.ensureDirSync(path.dirname(CONF_FILE));
  fs.writeFileSync(
    CONF_FILE,
    JSON.stringify({
      workers: 2,
      http: {
        host: '0.0.0.0',
        port: 9000
      },
      checkToken: true,
    }, null,2) + os.EOL
  )
}

if (fs.existsSync(CONF_FILE)) {
  let data = fs.readFileSync(CONF_FILE, 'utf8');
  let config = JSON.parse(data);
  for (let key in config) {
    if (config.hasOwnProperty(key))
      settings.set(key, config[key]);
  }
  if (!settings.get('base-url')) {
    let cfg = settings.get('http');
    if (cfg) {
      if (cfg.host === '0.0.0.0')
        settings.set('base-url', `http://127.0.0.1:${cfg.port}`)
      else
        settings.set('base-url', `http://${cfg.host}:${cfg.port}`)
    }
    cfg = settings.get('https');
    if (cfg) {
      if (cfg.host === '0.0.0.0')
        settings.set('base-url', `https://127.0.0.1:${cfg.port}`)
      else
        settings.set('base-url', `https://${cfg.host}:${cfg.port}`)
    }
  }
} else {
  fs.ensureDirSync(path.dirname(CONF_FILE));

}

if (fs.existsSync(LOG_CONF_FILE)) {
  let logger_cfg = require(LOG_CONF_FILE);
  settings.set('logger', logger_cfg);
}

exports = module.exports = settings;
