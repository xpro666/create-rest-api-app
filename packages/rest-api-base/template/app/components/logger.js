/**
 *
 * */
const path      = require('path');
const fs        = require('fs-extra');
const merge     = require('merge').recursive;
let log4js = require('log4js');
const cluster   = require('cluster');
// const settings  = require('./settings');

const PROCESS_DIR = path.join(process.cwd(), '/');

const logger = function (settings) {
  const def_path = `var/log/${settings.get('app-name') || 'node'}`;

  let conf = merge(true,
    {
      replaceConsole: true,
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %[%p %c%] - %m'
          }
        },
        everythink: {
          type: 'dateFile',
          layout: {
            type: 'pattern',
            pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] %p %c - %m'
          },
          filename: path.join(settings.get('app-dir') || PROCESS_DIR, settings.get('logdir') || def_path, 'main.log'),
          maxLogSize: 10 * 1024 * 1024,
          pattern: '.yyyy-MM-dd',
          backups: 15,
          compress: true
        },
        error: {
          type: 'dateFile',
          layout: {
            type: 'pattern',
            pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] %p %c - %m'
          },
          filename: path.join(settings.get('app-dir') || PROCESS_DIR, settings.get('logdir') || def_path, 'error.log'),
          maxLogSize: 10 * 1024 * 1024,
          pattern: '.yyyy-MM-dd',
          backups: 15,
          compress: true
        },
        'error-filter': { type: 'logLevelFilter', appender: 'error', level: 'error', maxLevel: 'error' },
        'access-log': {
          type: 'dateFile',
          layout: {
            type: 'pattern',
            pattern: '[%d{yyyy-MM-ddThh:mm:ss.SSSO}] %m'
          },
          filename: path.join(settings.get('app-dir') || PROCESS_DIR, settings.get('logdir') || def_path, 'access-log.log'),
          maxLogSize: 10 * 1024 * 1024,
          pattern: '.yyyy-MM-dd',
          backups: 10,
          compress: true
        }
      },
      categories: {
        default: {
          appenders: ['console', 'everythink', 'error-filter'],
          level: (settings.get('loglevel') || ((settings.get('env') === 'development') ? 'DEBUG' : 'INFO')).toUpperCase()
        },
        error: {
          appenders: ['error', 'error-filter'],
          level: 'ERROR'
        },
        'console': {
          appenders: ['console'],
          level: (settings.get('loglevel') || ((settings.get('env') === 'development') ? 'DEBUG' : 'INFO')).toUpperCase()
        },
        'App.AccessLog': {
          appenders: ['access-log'],
          level: (settings.get('loglevel') || ((settings.get('env') === 'development') ? 'DEBUG' : 'INFO')).toUpperCase()
        }
      }
    }
    , settings.get('logger') || {});

  // console.log(conf.appenders['everythink'].filename)
  for (let i = 0; i < conf.appenders.length; i++) {
    if (conf.appenders.hasOwnProperty('everythink') && conf.appenders[i].hasOwnProperty('filename')) {
      if (!fs.existsSync(path.dirname(conf.appenders['everythink'].filename))) {
        fs.mkdirpSync(path.dirname(conf.appenders['everythink'].filename));
      }
    }
    if (!fs.existsSync(path.join(PROCESS_DIR, settings.get('logdir') || def_path))) {
      fs.mkdirpSync(path.join(PROCESS_DIR, settings.get('logdir') || def_path))
    }
  }
  log4js.configure(conf);

  const logger = log4js.getLogger('console'); // any category will work
  console.log = logger.info.bind(logger)
  console.info = logger.info.bind(logger)
  console.debug = logger.debug.bind(logger)
  console.error = logger.error.bind(logger)

  log4js.path = path.join(settings.get('app-dir') || PROCESS_DIR, settings.get('logdir') || def_path)
  log4js.prefix = settings.get('log-app-prefix') || 'App.'
  if (cluster.worker) {
    log4js.prefix = settings.get('log-app-prefix') || 'App' + `[${cluster.worker.id}].`
  }


  console.log('Logger loaded')

  return log4js;
}

let loggerF

exports.initLoggerF = function (settings) {
  if (loggerF === undefined) loggerF = new logger(settings)
  return loggerF
}
module.exports = exports
