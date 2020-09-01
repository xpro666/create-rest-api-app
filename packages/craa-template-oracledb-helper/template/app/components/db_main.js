/**
 * Created by Tusov Evgeniy
 * on 05.03.2018.
 */

const merge = require('merge').recursive;
const oracledbHelper = require('oracledb-helper');
const { utils } = require('../libs');
const settings = require('./settings');
const loggerF = require('./logger').initLoggerF(settings);
const logger = loggerF.getLogger(loggerF.prefix+'OraMain');

const resString = merge(true, {
  badOpenSession: 'Ошибка открытия сессии к БД',
},utils.resStrings || {})

let hOraHelper;

function tryBigInt(aValue) {
  let res = NaN
  try {
    res = BigInt(aValue)
  } catch (err) {
  }
  return res
}

let config = merge({
  extendedMetaData: true,
  err_regs: [
    /ora-(01403):\s*(.+)/gi
  ],
  usePool: false,
  poolMin: 0,
  poolMax: 20,
  connTimeout: 5000,
  params:
    {
      connectString: 'orcl.orl.ueshka/XE',
      schema: 'school',
      autoClose: false
    },
  instanceTimelife: 600
}, settings.get('main-db') || {});

if (!hOraHelper) {
  hOraHelper = new oracledbHelper.OraHelper(logger, config);

  /**
   *
   * @param sessionId
   * @param username
   * @param password
   * @returns {oracledbHelper.UserInstance}
   */
  hOraHelper['getDB'] = async function (sessionId, username, password) {
    const instance = await this.getInstance(sessionId, {
      "params": {
        "dbUser": username,
        "dbPass": password
      }
    })
    if (instance && instance.instance instanceof oracledbHelper.UserInstance) return instance.instance
    else utils.customStatusError(500, resString.badOpenSession);
  }
}

exports = module.exports = hOraHelper;

