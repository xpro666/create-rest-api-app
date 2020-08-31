/**
 * Created on 6/15/17.
 */

const regex_IP = new RegExp([
  '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
].join(), 'i');
const regex_HostName = new RegExp([
  '^([a-zA-Z0-9\-]+\.)+([a-zA-Z][a-zA-Z0-9\-]*)$|' +
  '^[a-zA-Z][a-zA-Z0-9\-]*$'
].join());
const regex_subnet_full = new RegExp([
  '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(0) ' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
].join(), 'i');
const regex_subnet_cidr = new RegExp([
  '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.' +
  '(0)\/' +
  '([3][0-2]|[1-2][0-9]|[1-9])$'
].join(), 'i');

const os = require('os');
let ifaces = os.networkInterfaces();

/**
 *
 * @param str_ip
 * @returns {boolean}
 */
function isIpAddress(str_ip) {
  return !!str_ip.match(regex_IP);
}

/**
 *
 * @param hostname
 * @returns {boolean}
 */
function isHostAddress(hostname) {
  return !!hostname.match(regex_IP) || !!hostname.match(regex_HostName);
}

/**
 *
 * @param netmask
 * @returns {boolean}
 */
function isNetmask(netmask) {
  if (typeof netmask === 'number') {
    return netmask > 0 && netmask < 32
  }
  return !!netmask.match(regex_IP) || !!netmask.match(regex_HostName);
}

/**
 *
 * @param port
 * @returns {boolean}
 */
function isPort(port) {
  // console.log(port, port > 0, port <= 0xFFFF);
  return (typeof port === 'number') && port > 0 && port <= 0xFFFF
}

/**
 *
 * @param ifacename
 * @returns {Array}
 */
function getIpAddresses(ifacename) {
  let ip_list = [];
  Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0;
    let reg = new RegExp(ifacename);
    if (reg.test(ifname) || ifname === undefined) {
      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          // console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          // console.log(ifname, iface.address, iface.netmask);
          ip_list.push({address: iface.address, netmask: iface.netmask})
        }
        ++alias;
      });
    }
  });
  return ip_list;
}

/**
 *
 * @param str_ip
 * @returns {*}
 */
function inet_aton(str_ip) {
  // console.log(str_ip);
  if (str_ip.match(regex_IP)) {
    return str_ip.split('.').map((x, i) => parseInt(x) << ((3 - i) * 8)).reduce((a, b) => (a + b) >>> 0);
  } else throw 'inet_aton: Incorrect ip address';
}

/**
 *
 * @param int_ip
 * @returns {string}
 */
function inet_ntoa(int_ip) {
  if (int_ip >= 0 && int_ip <= 0xffffffff) {
    let ip = [];
    ip.push(int_ip >> 24 & 0xFF);
    ip.push(int_ip >> 16 & 0xFF);
    ip.push(int_ip >> 8 & 0xFF);
    ip.push(int_ip >> 0 & 0xFF);
    return ip.join('.');
  } else throw 'inet_ntoa: Incorrect ip address';
}

/**
 *
 * @param str_ip
 * @param count
 * @returns {string}
 */
function inet_inca(str_ip, count) {
  let b = count || 1;
  let int_ip = inet_aton(str_ip);
  return inet_ntoa(int_ip + b);
}

/**
 *
 * @param cidr
 * @returns {string}
 */
function cidrToNetmask(cidr) {
  if (typeof cidr === 'string' && isNetmask(cidr))
    return cidr;
  if (cidr > 32 || cidr < 1) {
    throw 'cidrToNetmask: Incorrect cidr';
  }
  let li_tmpip = 0;
  for (let i = 1; i <= 32; i++) {
    li_tmpip = li_tmpip << 1;
    if (i <= cidr) {
      li_tmpip += 1;
    }
  }
  li_tmpip >>>= 0;
  return inet_ntoa(li_tmpip);
}

/**
 *
 * @param mask
 * @param ip
 * @returns {boolean}
 */
function compareMaskedIp(mask, ip) {
  const ipOctPattern = '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
  let octsMask = mask.split('.');
  for (let i = 0; i < 4; i++) {
    if (i < octsMask.length) {
      if (octsMask[i] === '%')
        octsMask[i] = ipOctPattern;
    } else
      octsMask.push(ipOctPattern);
  }
  mask = octsMask.join('.');
  let regPattern = new RegExp(['^' + mask + '$'].join());

  return !!ip.match(regPattern);
}

/**
 * @return {number}
 */
function NetworkToCidr(network) {
  let i = 0;
  if (typeof network === 'number' && isNetmask(network)) {
    return network;
  }
  if (network.match(regex_IP)) {
    let li_tmpip = inet_aton(network);
    for (let k = 31; k >= 0; k--) {
      if (((li_tmpip >> k) & 1) === 1) {
        i++;
      } else break;
    }
    return i;
  } else throw 'NetworkToCidr: Incorrect network address';
}

/**
 *
 * @param ip
 * @param netmask
 * @returns {*}
 */
function ipToNetwork(ip, netmask) {
  if ((typeof netmask) === 'number') {
    try {
      netmask = cidrToNetmask(netmask);
    } catch (err) {
      throw 'ipToNetwork: Incorrect netmask address';
    }
  }
  let intNetmask;
  try {
    intNetmask = inet_aton(netmask);
  } catch (err) {
    throw 'ipToNetwork: Incorrect netmask address';
  }
  if ((typeof ip) === 'string') {
    return inet_ntoa((inet_aton(ip) & intNetmask) >>> 0);
  } else {
    if ((typeof ip) === 'number') {
      return (ip & intNetmask) >>> 0
    } else throw 'ipToNetwork: Incorrect ip address';
  }
}

/**
 *
 * @param ip
 * @param netmask
 * @returns {*}
 */
function minNetworkIp(ip, netmask) {
  if ((typeof netmask) === 'number') {
    try {
      netmask = cidrToNetmask(netmask);
    } catch (err) {
      throw 'ipToNetwork: Incorrect netmask address';
    }
  }
  let intNetmask;
  try {
    intNetmask = inet_aton(netmask);
  } catch (err) {
    throw 'minNetworkIp: Incorrect netmask address';
  }
  if ((typeof ip) === 'string') {
    return inet_ntoa(((inet_aton(ip) & intNetmask) + 1) >>> 0);
  } else {
    if ((typeof ip) === 'number') {
      return ((ip & intNetmask) + 1) >>> 0
    } else throw 'ipToNetwork: Incorrect ip address';
  }
}

/**
 *
 * @param ip
 * @param netmask
 * @returns {*}
 */
function maxNetworkIp(ip, netmask) {
  if ((typeof netmask) === 'number') {
    try {
      netmask = cidrToNetmask(netmask);
    } catch (err) {
      throw 'ipToNetwork: Incorrect netmask address';
    }
  }
  let intNetmask;
  try {
    intNetmask = inet_aton(netmask);
  } catch (err) {
    throw 'minNetworkIp: Incorrect netmask address';
  }
  let wildcard = ~intNetmask;
  if ((typeof ip) === 'string') {
    return inet_ntoa(((inet_aton(ip) & intNetmask) + wildcard - 1) >>> 0);
  } else {
    if ((typeof ip) === 'number') {
      return ((ip & intNetmask) + wildcard - 1) >>> 0
    } else throw 'ipToNetwork: Incorrect ip address';
  }
}

module.exports = {
  compareMaskedIp: compareMaskedIp,
  isIpAddress: isIpAddress,
  isHostAddress: isHostAddress,
  isNetmask: isNetmask,
  isPort: isPort,

  getIpAddresses: getIpAddresses,

  inet_ntoa: inet_ntoa,
  inet_aton: inet_aton,
  inet_inca: inet_inca,

  cidrToNetmask: cidrToNetmask,
  NetworkToCidr: NetworkToCidr,
  ipToNetwork: ipToNetwork,
  minNetworkIp: minNetworkIp,
  maxNetworkIp: maxNetworkIp
};
