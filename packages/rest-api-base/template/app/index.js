
const { utils } = require('./libs');
const settings = require('./components/settings');
const loggerF = require('./components/logger').initLoggerF(settings);
const logger = loggerF.getLogger(loggerF.prefix+'Main');

process.env.UV_THREADPOOL_SIZE = 128;
process.logger = logger;

const run = () => {
  process.chdir(__dirname);
  process.plugins = {};

  logger.info('===== startService =====', );

  if (utils.compareVersion(process.version.replace('v',''), '10.0.0') < 0) {
    logger.error('Unsupported version of NodeJS, You use v10.0.0 and new')
    stopService()
  }

  // logger.info(typeof 14n);
  if(!settings.get('base-url')) {
    logger.error('Not setup parameter "base-url" in config')
    stopService()
  }
  logger.info(`Base URL: ${settings.get('base-url')}`);
  logger.info(`Log level: ${logger.level}`);
  try {
      let koa = require('./components/koa').getInstance();
      koa.init0();
      process.plugins = require('./plugins');

      process.on('SIGINT', stopService);
  } catch (err){
    logger.error(err.message || err)
    if (err.stack) logger.debug(err.stack)
    stopService()
  }

  function stopService () {
    logger.info('==== stopService ====');
    process.exit();
  }

  process.on('uncaughtException', function (err) {
    logger.error('uncaughtException>', err.stack ? err.stack : err);
  });
  process.on('ExperimentalWarning', function (err) {
    logger.error('ExperimentalWarning>', err.stack ? err.stack : err);
  });

}

exports = module.exports = run;

exports['asCluster'] = () => {
  require('./clusterRun');
}