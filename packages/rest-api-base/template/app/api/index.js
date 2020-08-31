/**
 * Created by Tusov Evgeniy
 * on 24.08.2020.
 */
const APP_DIR = process.cwd();

const fs = require('fs-extra')
const path = require('path')

const settings = require(path.join(APP_DIR,'components/settings.js'))
const loggerF = require(path.join(APP_DIR,'components/logger.js')).initLoggerF(settings)
const router = require('koa-router')()
const utils = require(path.join(APP_DIR,'libs/utils.js'))

const logger = loggerF.getLogger(loggerF.prefix+'Routes')

const apiVersion = '/:version(v\\d+)?'

router.prefix(/*'/api' + */apiVersion)

// router.use(async (ctx, next) => {
//   let decoded = null
//
//   if (decoded === null ) {
//     await next()
//   } else {
//     ctx.unauthorized('Необходимо выполнить повторную авторизацию')
//   }
// })

router.use(async (ctx, next) => {
  try {
    if (ctx.req.decoded) console.log(utils.hidePassword(ctx.req.decoded))
  } catch (err) {
    console.error(err.message || err)
  }
  await next()
})

let routes = []

async function init() {
  const basePath = path.resolve('./api')
  const lsList = (fs.readdirSync(basePath, {withFileTypes: true})).sort();
  const loaded = [`/versions`]
  router.all('/versions', async (ctx) => {
    ctx.body = settings.get('version')
  })
  for (let i = 0; i < lsList.length; i++) {
    const routeName = lsList[i].name || lsList[i]
    let isDirectory = false
    if (typeof lsList[i]['isDirectory'] !== 'function') {
      const stat = fs.statSync(path.join(basePath, routeName))
      isDirectory = stat.isDirectory()
    } else {
      isDirectory = lsList[i].isDirectory()
    }

    if (routeName.toLowerCase() !== 'rest-api-scripts.js' //&&
    // path.parse(routeName).ext.toLowerCase() === '.js'
    ) {
      const route = require(path.join(basePath, routeName))
      if (route && route.hasOwnProperty('router')) {
        if (path.parse(routeName).name.toLowerCase() === 'root') {
          router.use(route)
          loaded.push(`/`)
        } else {
          router.use(`/${path.parse(routeName).name}`, route)
          loaded.push(`/${path.parse(routeName).name}`)
        }
      }
    }
  }
  routes = router.stack.map(item => {
    let methods = item.methods
    for (let i = 0; i < methods.length; i++) {
      if (methods[i].toUpperCase() === 'HEAD') {
        methods.splice(i, 1);
      }
    }
    let method = 'ALL'
    if (methods.length === 1) {
      method = methods[0].toUpperCase()
    }
    return {method, path: item.path}
  }).sort((a, b) => {
    if (a.path > b.path) return 1;
    if (a.path < b.path) return -1;
    return 0;
  })
  // const paths = routes.map(x => x.path);
  for (let i = 0; i < routes.length; i++) {
    if (routes[i]['method'].toUpperCase() !== 'ALL')
      router.all(routes[i]['path'], utils.methodNotAllowed)
  }
}

init()
  .then(() => {
    logger.info(`Loaded routes:`, `\n\t` + routes.map(x => `${x.method}\t${x.path}`).filter(function (elem, pos, arr) {
      return arr.indexOf(elem) === pos;
    }).join(`\n\t`))
  })
  .catch((err) => {
    logger.error(err.message || err)
    if (err.stack) logger.debug(err.stack)
    process.exit(1);
  });

exports = module.exports = router.middleware()
