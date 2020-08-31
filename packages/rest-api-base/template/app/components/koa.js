/**
 *
 * */
'use strict'
// const path = require('path')
const koa = require('koa')
const cors = require('@koa/cors');
const koaLogger = require('koa-logger')
const bodyParser = require('koa-body')
const respond = require('koa-respond')
const mount = require('koa-mount')
const compose = require('koa-compose')
// const geoip = require('geoip-lite')
// const koa_static = require('koa-static');

const utils = require('../libs/utils')
const netutils = require('../libs/netutils')

// const getRawBody = require('raw-body');
// const contentType = require('content-type');

class Koa {
  constructor (settings,
               loggerF,
               Auth,
               api) {
    this.logger = loggerF.getLogger(loggerF.prefix+'Koa')
    let logger = this.logger
    const loggerAccess = loggerF.getLogger(loggerF.prefix+'AccessLog')

    this.settings = settings

    async function errorHandler (ctx, next) {
      try {
        const start = Date.now();
        await next()
        const ms = Date.now() - start;
        const geo = null; //geoip.lookup(ctx.request.headers["x-real-ip"] || ctx.req.connection.remoteAddress)
        loggerAccess.info(ctx.request.headers["x-real-ip"] || ctx.req.connection.remoteAddress, (geo && geo.hasOwnProperty('country')) ? geo.country : 'unknown',
          (geo && geo.hasOwnProperty('region')) ? geo.region : 'unknown', (geo && geo.hasOwnProperty('city')) ? geo.city : 'unknown',
          ctx.method, ctx.status, ctx.url, `${ms} ms`, ctx.request.headers['user-agent'])
        // logger.debug('eh 1> %s url:%s - time: %s ms', ctx.method, ctx.url, ms);
      } catch (err) {
        logger.error('eh! c> %s url:%s', ctx.method, ctx.url)
        logger.error('eh! c>', err, err.message || '_')
        logger.error('eh! c>', ctx.request.ip)

        ctx.status = (typeof err === 'string') ? 400 : 500
        ctx.body = {success: false, data: err}
      }
    }

    async function checkToken (ctx, next) {
      let tokenOk = ( !settings.get('checkToken')) || false

      if (settings.get('checkToken') === undefined || settings.get('checkToken')) {
        let clientToken
        if (ctx.header.hasOwnProperty('authorization')) {
          const regex = /bearer (.*)/gi
          const match = regex.exec(ctx.header['authorization'])
          clientToken = (match) ? match[1] : '';
        }
        try {
          const decoded = await Auth.checkToken(clientToken)
          ctx.request.decoded = decoded
          tokenOk = true
        } catch (err) {
          if (/\/versions/i.test(ctx.url)
            || /\/auth\/token.*/i.test(ctx.url)
          ) {
            tokenOk = true
          } else {
            logger.error(err.message || err)
            // if (err.stack) logger.debug(err.stack)
            // tokenOk = false
          }
        }
      }
      if (tokenOk) {
        await next()
      }
      else {
        utils.customStatusError(401, 'Ошибка проверки авторизации')
      }
    }

    async function checkHeader (ctx, next) {
      const availableAgents = [
      ]
      const headerRegex = /(.+)\/([0-9]+(.[0-9]+)*(-[a-zA-Z]+[0-9]+)*)\s*(.+)?/gi
      const match = headerRegex.exec(ctx.request.headers['app-version'] || ctx.request.headers['user-agent'])
      let  agentInfo = {
        agent: undefined,
        version: undefined,
        os: undefined
      }
      if (match) {
        agentInfo = {
          agent: match[1].toLowerCase(),
          version: match[2],
          os: ( match[5] !== undefined) ? match[5] : ctx.request.headers['user-agent']
        }
      }
      if (availableAgents.indexOf(agentInfo.agent) < 0 && true &&
        !(/\/versions/i.test(ctx.url))
      ) {
        utils.customStatusError(406, 'User-Agent is not available')
      }
      // if (agentInfo['agent'] && 'mobilecyber' !== agentInfo['agent'].toLowerCase()){
      //   if (/iOS/ism.test(agentInfo['os'])){
      //     if(utils.compareVersion(agentInfo['version'], '1.6.6218') < 0){
      //       utils.customStatusError(400, 'Вы используете старую версию приложения. Обновите приложение для продолжения работы.')
      //     }
      //   } else if (/lk/ism.test(agentInfo['agent'])){
      //     if(utils.compareVersion(agentInfo['version'], '0.9.5') < 0){
      //       utils.customStatusError(400, 'Вы используете старую версию Личного кабинета. Обновите или перезагрузите вкладку. При повторном появлении сообщения дополнительно выполните очистку данных кэш.')
      //     }
      //   } else {
      //    if(utils.compareVersion(agentInfo['version'], '0.38-beta119') < 0){
      //      utils.customStatusError(400, 'Вы используете старую версию приложения. Обновите приложение для продолжения работы.')
      //    }
      //   }
      // }
      ctx.request.agentInfo = agentInfo
      await next()
    }

    async function restHandler (ctx, next) {
      ctx.set('Content-Type', 'application/json')
      let status
      let description
      // ctx.status = 200;

      try {
        if (ctx.method === 'GET') {
          // this.p = this.query.p ? JSON.parse(this.query.p) : {};
          ctx.p = ctx.query
        }

        await next()
        if (ctx.respond === false) { // streaming mode
          return
        }
        if (ctx.status === 200 && !ctx.body) ctx.status = 204
        if (ctx.status === 200 || ctx.status === 204) {
          status = 'success'
        } else {
          status = 'error'
        }
      } catch (err) {
        status = 'error'
        description = (typeof err === 'string') ? err : err.message

        // set explicit status
        if (ctx.status !== 401 && ctx.status === 404) {
          if (err.status !== undefined && typeof err.status === 'number') {
            ctx.status = err.status
          } else {
            ctx.status = (typeof err === 'string') ? 400 : 500
          }
        }
        logger.error('rest c>', (err.message || err), ctx.status, ctx.request.ip)
        if (err.stack) logger.debug('rest c>', err.stack)
      }

      if (ctx.method === 'POST' ||
        ctx.method === 'DELETE' ||
        ctx.method === 'PUT' ||
        status === 'error'
      ) {
        if (status === 'error') {
          ctx.status = (ctx.status === 200) ? 400 : ctx.status
        }

        if (ctx.status !== 200 && ctx.status !== 204) {
          const respType = ctx.response.header['content-type']
          if (respType.search(/text\/html/) !== -1) return
          ctx.body = {message: (typeof ctx.body === 'object' && ctx.body.message) ? ctx.body.message : description}
        }
      }

      // otherwise DELETE sends empty body
      if (ctx.status === 204 && ctx.body) {
        ctx.status = 200
      }
      if (ctx.status >= 200 && ctx.status <= 299){
        let data = utils.cloneObject(ctx.body)
        if (data && data.hasOwnProperty('success')) {
          delete data['success']
        }
        ctx.body = {
          success: (ctx.body && ctx.body.hasOwnProperty('success')) ? ctx.body.success : true,
          data
        }
      } else if (ctx.status >= 300 && ctx.status <= 399){

      } else {
        let error = utils.cloneObject(ctx.body)
        if (error && error.hasOwnProperty('success')) {
          delete error['success']
        }
        ctx.body = {
          success: (ctx.body.hasOwnProperty('success')) ? ctx.body.success : false,
          error
        }
      }
      // ctx.body = JSON.stringify(ctx.body/*, utils.jsonFilter*/)
      // logger.error('rh> %s url:%s', this.method, this.url, this.status);
    }

    async function handler404 (ctx, next) {
      await next
      if (ctx.status === 404) {
        ctx.notFound('Not Found')
      }
    }

    async function logger_koa (ctx, next) {
      try {
        logger.debug('in >', utils.inspect(ctx.req.headers['content-length']))
        let rawBody = Buffer.from('null')
        if (ctx.req.headers.hasOwnProperty('content-length')) {
          // rawBody = yield getRawBody(this.req, {
          //   length: this.req.headers['content-length'],
          //   limit: '1mb',
          //   encoding: contentType.parse(this.req).parameters.charset
          // });
        }
        // logger.debug('in >', util.inspect(this));
        logger.debug('in > body', utils.inspect(ctx.request.body))
        logger.debug('in > query', utils.inspect(ctx.request.query))
        logger.debug('in > raw', rawBody.toString())

        await next()
        logger.debug('in > params', utils.inspect(ctx.params))
      } catch (err) {
        logger.error(err)
        // logger.debug('in >', utils.inspect(ctx))
        throw err
      }
    }

    let middlewareStack = [
      koaLogger((str) => {
        logger.debug(str)
        // console.log(str)
      }),
      cors(),
      respond(),
      logger_koa,
      errorHandler,
      restHandler,
      checkToken,
      // checkHeader,
      bodyParser({
        textLimit: '15mb',
        // strict: false,
        parsedMethods: [ 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        multipart: true
      }),
      mount('/', api), // compose(api)),
      handler404
    ]

    let app = new koa()
    require('koa-qs')(app)

    app.use(compose(middlewareStack))
    this.app = app
  }

  init0 () {
    const fs = require('fs-extra')
    const http = require('http')
    const https = require('https')
    let self = this

    // geoip.startWatchingDataUpdate(function () {
    //   console.log(arguments)
    // })

    let cfg = self.settings.get('http');
    self.logger.debug(cfg);
    if (cfg) {
      self.httpServer = http.createServer(self.app.callback())
      self.httpServer.listen(cfg.port, cfg.host, () => {
        self.logger.info(`HTTP listen on ${self.settings.get('http').host}:${self.settings.get('http').port}`)
      })
    }
    cfg = self.settings.get('https')
    if (cfg) {
      let credentials = {
        key: fs.readFileSync(cfg.key),
        cert: fs.readFileSync(cfg.cert)
      }
      self.httpServer = https.createServer(credentials, self.app.callback())
      self.httpServer.listen(cfg.port, cfg.host, () => {
        self.logger.info(`HTTPS listen on ${self.settings.get('https').host}:${self.settings.get('https').port}`)
      })
    }
  };
}

let handlerKoa;

function getInstance(settings, loggerF, auth, api) {
  if (!handlerKoa) {
    settings = require('./settings');
    loggerF = require('./logger').initLoggerF(settings);
    auth = require('./auth')();
    api = require('./../api');
    handlerKoa = new Koa(settings, loggerF, auth, api);
  }
  return handlerKoa
}

exports = module.exports = Koa;

exports['getInstance'] = getInstance;
