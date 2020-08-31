const util = require('util');
// const pdf = require('html-pdf')

function padZero(num, count) {
  if (['string','number'].indexOf(typeof num) < 0)
    throw new Error('Incorrect input number');
  let res = num + ""
  while (res.length < count){
    res = "0" + res
  }
  return res
}

function customStatusError (status, message) {
  let error = new Error()
  error.status = status
  error.message = message
  throw error
}

const datePattern = '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[0-9]|[1-2][0-9]|3[0-1])'
const timePattern = '(?:0[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9]):(?:[0-5][0-9])'
const msPattern = '\\.[0-9]{1,3}'
const tzPattern = '(?:Z|[+\\-](?:[0-5][0-9]):(?:[0-5][0-9]))'

function formatDate (date) {
  if (typeof date === 'string') {
    date = new Date(Date.parse(date))
  }
  const day = date;
  let dd = day.getDate();
  let mm = day.getMonth() + 1; //January is 0!

  const yyyy = day.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return dd + "." + mm + "." + yyyy;
}

function formatDateMonth (date) {
  if (typeof date === 'string') {
    date = new Date(Date.parse(date))
  }
  const day = date;
  let mm = day.getMonth() + 1; //January is 0!

  const yyyy = day.getFullYear();
  if (mm < 10) {
    mm = "0" + mm;
  }
  return mm + "." + yyyy;
}

function formatDateTimeMonth (date) {
  if (typeof date === 'string') {
    date = new Date(Date.parse(date))
  }
  const day = date;
  let dd = day.getDate();
  let mm = (day.getMonth() + 1); //January is 0!
  const yyyy = day.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  let hh = day.getHours()
  let mi = day.getMinutes()
  let ss = day.getSeconds()
  if (hh < 10) {
    hh = '0' + hh;
  }
  if (mi < 10) {
    mi = '0' + mi;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  return dd +'.'+ mm +'.'+ yyyy +' '+ hh+':'+mi+':'+ss;
}

/**
 *
 * @param date {Date, string, number}
 * @returns {string}
 */
function DateToLocaleISOString(date) {
  if (!(date instanceof Date)) {
    let pDate = date;
    if (typeOf(date) !== 'number') pDate = Date.parse(date);
    if (isNaN(pDate)) {
      throw new Error('Incorrect input date: '+ date)
    }
    date = new Date(pDate)
  }

  const yyyy = date.getFullYear();
  let mm = (date.getMonth() + 1); //January is 0!
  let dd = date.getDate();
  let hh = date.getHours()
  let mi = date.getMinutes()
  let ss = date.getSeconds()
  let zzz = date.getUTCMilliseconds()
  const tzOffset = date.getTimezoneOffset()

  const sDate = [yyyy, padZero(mm, 2), padZero(dd, 2)].join('-');
  const sTime = [padZero(hh,2),padZero(mi,2),padZero(ss,2)].join(':');
  const sTZ = (tzOffset >= 0)? '+':'-' + padZero((Math.abs(tzOffset) / 60) >> 0, 2) +':'+ padZero((tzOffset % 60),2);

  return sDate+'T'+sTime+'.'+padZero(zzz,3)+sTZ
}

function DateToLocaleDateString(date) {
  const dateISOString = DateToLocaleISOString(date)
  return dateISOString.slice(0,10)
}

function DateToLocaleTimeString(date) {
  const dateISOString = DateToLocaleISOString(date)
  return dateISOString.slice(12,19)
}

/**
 *
 * @param s
 * @param def {number, null}
 * @returns {number, null}
 */
function getIntDef(s, def) {
  let res = parseInt(s);
  if (isNaN(res)) res = def;
  return res;
}

function jsonFilter (k, v) {
  if (v && typeof v === "object") {
    if (v.toJSON_) {
      v = v.toJSON_()
    }
  }
  return v;
}

function upperFirstLetter (str) {
  str = str.toLowerCase()
  return str[0].toUpperCase() + str.substring(1)
}

function cloneObject (obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  let temp = {}; // give temp the original obj's constructor
  if (typeof obj === 'object' && obj.hasOwnProperty('length')) {
    temp = []
    for (let key in obj) {
      if (obj.hasOwnProperty(key))
        temp.push(cloneObject(obj[key]))
    }
  } else {
    temp = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key))
        temp[key] = cloneObject(obj[key]);
    }
  }

  return temp;
}

function setTimer (timeout, cb) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
      if (cb) {
        cb(null)
      }
    }, timeout)
  })
}

function resetTimer (t_obj) {
  if (t_obj) {
    let cb = t_obj._onTimeout;
    clearTimeout(t_obj);
    setImmediate(cb);
  }
}

function hidePassword (obj) {
  const hide = '*****';
  const keywords = [
    'pass',
    'passwd',
    'password',
    'passwords'
  ];
  if (typeof obj !== 'object') {
    return hide;
  } else {
    let temp
    if (obj.isArray) {
      temp = []
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === 'object') {
          temp = ( hidePassword(obj[i]) )
        } else {
          temp.push(obj[i])
        }
      }
    } else {
      temp = cloneObject(obj)
      for (let i = 0; i < Object.keys(temp).length; i++) {
        let key = Object.keys(temp)[i];
        if (keywords.indexOf(key.toLowerCase()) >= 0) {
          temp[key] = hidePassword(temp[key]);
        }
      }
    }
    return temp;
  }
}

function getRandomInt (max, min) {
  min = min || 0
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function htmlToPdfBuffer (html, options) {
//   return new Promise(function (resolve, reject) {
//     pdf.create(html, options).toBuffer(function (err, buffer) {
//       if (err) {
//         reject(err)
//       } else {
//         if (Buffer.isBuffer(buffer)) {
//           resolve(buffer)
//         } else {
//           let err = new Error()
//           err.message = 'Returned data by converter is not Buffer'
//         }
//       }
//     })
//   })
// }

function compareArrays (arrA, arrB) {
  let result = (arrA.length === arrB.length)
  if (result) {
    for (let i = 0; i < arrA.length; i++) {
      result = false
      for (let j = 0; j < arrB.length; j++) {
        if (arrA[i] === arrB[j]) {
          result = true
        }
      }
      if (!result) break;
    }
  }
  return result
}

const revToInt = (rev) => {
  let res = 0
  const revReg = /([a-z]+)([0-9]+)?/i
  if (rev !== undefined && rev !== null) {
    const match = rev.match(revReg)
    if (match !== null && match[0]) {
      switch (match[1]) {
        case 'rc':
          const rcVersion = Number(match[2]) || 0
          res -= 99 - rcVersion
          if (res > -1) res = -1
          break
        case 'alpha':
          const alphaVersion = Number(match[2]) || 0
          res -= 9999 - alphaVersion
          if (res > -1000) res = -1000
          break
        case 'beta':
          const betaVersion = Number(match[2]) || 0
          res -= 999 - betaVersion
          if (res > -100) res = -100
          break
      }
    }
  }
  return res
}

function verToNumber (version) {
  let verParts = version.toString().replace(',','.').split('-');
  let verInt = verParts[0].split('.')//.map(x => Number(x))
    .map((x, i, arr) => parseInt(x) * Math.pow(100, arr.length - i - 1) * ((arr.length - i - 1) ? 100 : 1))
    .reduce((a, b) => a + b)
  let revInt = 0;
  // console.log(verParts)
  if (verParts.length >= 2){
    revInt = revToInt(verParts[1])
  }
  return {
    verInt,
    revInt
  }
}

function compareVersion (versionA, versionB) {
  let verIntA = verToNumber(versionA)
  let verIntB = verToNumber(versionB)
  let res = 0
  if (verIntA.verInt > verIntB.verInt){
    res = 1
  }
  if (verIntA.verInt < verIntB.verInt){
    res = -1
  }
  if (res === 0){
    if (verIntA.revInt > verIntB.revInt){
      res = 1
    }
    if (verIntA.revInt < verIntB.revInt){
      res = -1
    }
  }
  return res
}

function fixedEncodeURI (str) {
  return encodeURI(str)
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']')
    .replace(/\+/g, '%2B');
}

async function methodNotAllowed (ctx)  {
  customStatusError(405, 'Method Not Allowed')
}

function typeOf(input) {
  return ({}).toString.call(input).slice(8,-1).toLowerCase();
}

const utils = {
  typeOf: typeOf,
  cloneObject: cloneObject,
  customStatusError: customStatusError,
  padZero: padZero,
  getIntDef: getIntDef,

  hidePassword: hidePassword,
  setTimer:setTimer,
  resetTimer: resetTimer,
  compareArrays: compareArrays,

  jsonFilter: jsonFilter,
  getRandomInt: getRandomInt,

  // '(?:[T ](?:(?:)?)?'
  reDate: new RegExp('^'+datePattern+'$', 'i'),
  reTime: new RegExp(`^${timePattern}$`, 'i'),
  reDateTime: new RegExp(`^${datePattern}(?:[T ](?:${timePattern}))$`, 'i'),
  reDateTimeISO: new RegExp(`^${datePattern}(?:[T ](?:${timePattern}(?:${msPattern}(?:${tzPattern})?)))$`, 'i'),
  reDateTimeISOLite: new RegExp(`^${datePattern}(?:[T ](?:${timePattern}(?:${msPattern}(?:${tzPattern})?)?))?$`, 'i'),
  dateFormat: require('dateformat'),
  formatDate: formatDate,
  formatDateMonth: formatDateMonth,
  formatDateTimeMonth: formatDateTimeMonth,
  DateToLocaleISOString: DateToLocaleISOString,
  DateToLocaleDateString: DateToLocaleDateString,
  DateToLocaleTimeString: DateToLocaleTimeString,
  upperFirstLetter: upperFirstLetter,
  fixedEncodeURI: fixedEncodeURI,

  verToNumber: verToNumber,
  revToInt: revToInt,
  compareVersion: compareVersion,
  methodNotAllowed: methodNotAllowed,
  // resStrings: require('./resourceString.js')
  // htmlToPdfBuffer: htmlToPdfBuffer
};

module.exports = Object.assign(
  utils,
  require('util')
)
