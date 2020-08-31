const cluster = require("cluster");
const os = require("os");

const logger = process.logger || console;

const numCPUs = os.cpus.length || 0;
const startTime = process.hrtime();
const startsecs = 3;

let terminating = false;
function terminate() {
  if (terminating) return;
  terminating = true;

  cluster.removeListener('disconnect', onDisconnect);

  for (let id of Object.keys(cluster.workers)) {
    logger.debug(`Sending kill signal to worker ${id}`);
    cluster.workers[id].kill('SIGTERM');
  }
}

function onDisconnect(worker) {
  let timeSinceStart = process.hrtime(startTime);
  timeSinceStart = timeSinceStart[0] + timeSinceStart[1] / 1e9;
  if (timeSinceStart < startsecs) {
    logger.error(`Worker ${worker.process.pid} has died before startsecs is over. stop all.`)
    process.exitCode = worker.process.exitCode || 1;
    terminate();
  } else {
    logger.debug(`Worker ${worker.process.pid} has died. Forking...`)
    cluster.fork();
  }
}

if (cluster.isMaster) {
  process.on('SIGTERM', terminate);
  process.on('SIGINT', terminate);
  process.on('uncaughtException', function (err) {
    logger.error('uncaughtException>', err.stack ? err.stack : err);
  });
  process.on('ExperimentalWarning', function (err) {
    logger.error('ExperimentalWarning>', err.stack ? err.stack : err);
  });


  const settings = require('./components/settings');
  logger.debug(`This machine has ${numCPUs} CPUs.`);
  for (let i = 0; i < settings.get('workers') || (Math.ceil(0.75 * numCPUs)); i++) {
    cluster.fork();
  }

  cluster.on('online', worker => {
    logger.debug(`Worker ${worker.process.pid} is online`);
  })

  cluster.on('disconnect', onDisconnect);

  // cluster.on('exit', (worker, code, signal) => {
  //   logger.debug(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
  //   onDisconnect(worker);
  // })
} else {
  const app = require('./index');
  app(cluster.worker.id);
//   const settings = require('./settings')
//   const loggerF = require('./logger').initLoggerF(settings)
//   const auth = require('./auth')()
//   const api = require('./../api')
//
//   const http = require('http')
//   const https = require('https')
//   const start = new Date();
//   const koa = new Koa(settings, loggerF, auth, api);
//   const callback = koa.app.callback();
//
//   let cfg = settings.get('http');
//   let httpServer;
//   if (cfg) {
//     httpServer = http.createServer();
//
//     httpServer.on('request', callback)
//     httpServer.on('checkContinue', function (req, res) {
//       req.checkContinue = true
//       callback(req, res)
//     })
//
// // custom koa settings
// // defaults to http://nodejs.org/api/http.html#http_server_maxheaderscount
//     httpServer.maxHeadersCount = koa.app.maxHeadersCount || 1000
//     httpServer.timeout = koa.app.timeout || 120000
//
//     httpServer.listen(cfg.port, cfg.host, function (err) {
//       if (err) throw err
//       koa.logger.debug('%s listening on port %s, started in %sms',
//         koa.app.name || 'koa app',
//         this.address().port,
//         Date.now() - start)
//     })
//   }
//   // koa.init0()
}
