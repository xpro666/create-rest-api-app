/**
 * Created by Tusov Evgeniy
 * on 07.05.2018.
 */

const jwt = require('jsonwebtoken')
const fs = require('fs-extra')
const path = require('path');
const merge = require('merge').recursive;
// const loggerF   = require('./logger');


exports = module.exports = function (settings) {
  settings = settings || require('./settings')
  return new Auth(settings/*, loggerF*/);
};

class Auth {
  constructor(settings) {
    // this.logger = loggerF.getLogger('App.auth');
    const cfg = merge({
      private: 'etc/certs/auth.key',
      public: 'etc/certs/auth.pub',
      privateRefresh: 'etc/certs/authRefresh.key',
      publicRefresh: 'etc/certs/authRefresh.pub',
      expires: 12 * 60 * 60,
    }, settings.get('auth') || {});

    this.privKey = path.join(settings.get('app-dir'),  cfg.private );
    this.pubKey = path.join(settings.get('app-dir'), cfg.public );
    this.privKeyRefresh = path.join(settings.get('app-dir'), cfg.privateRefresh );
    this.pubKeyRefresh = path.join(settings.get('app-dir'), cfg.publicRefresh );
    this.Key = 'f96cd5775097816567bd637fd6996dc6e5ed4949a206c351fa7187c07aa3a278';
    this.KeyRefresh = 'bb4bfc35f0bbb7b8a8153cdab18fbbb04267859f78ddb10bb21cdf3d26996f87';
    this.expires = cfg.expires ;
    this.refresh_expires = cfg.refresh_expires || this.expires * 2;
  }

  /**
   *
   * @param data
   * @returns {{expiresIn: (*|string|number), token: *, refreshToken: *, refreshExpiresIn: (*|number)}}
   */
  sign(data) {
    let opts = {
      expiresIn: this.expires
    };
    let opts_refresh = {
      expiresIn: this.refresh_expires
    };
    let cert;
    let certRefresh;
    if (!fs.existsSync(this.privKey) || !fs.lstatSync(this.privKey).isFile()
      || !fs.existsSync(this.pubKey) || !fs.lstatSync(this.pubKey).isFile()) {
      cert = this.Key;
    } else {
      cert = fs.readFileSync(this.privKey);
      opts.algorithm = 'RS256';
    }
    if (!fs.existsSync(this.privKeyRefresh) || !fs.lstatSync(this.privKeyRefresh).isFile()
      || !fs.existsSync(this.pubKeyRefresh) || !fs.lstatSync(this.pubKeyRefresh).isFile()) {
      certRefresh = this.KeyRefresh
    } else {
      certRefresh = fs.readFileSync(this.privKeyRefresh);
      opts_refresh.algorithm = 'RS256';
    }
    return {
      token: jwt.sign(data, cert, opts),
      expiresIn: this.expires,
      refreshToken: jwt.sign(data, certRefresh, opts_refresh),
      refreshExpiresIn: this.refresh_expires,
    }
  }

  /**
   *
   * @param token
   * @returns {void|*}
   */
  checkToken(token) {
    let opts = {};
    let cert;
    if (!fs.existsSync(this.privKey) || !fs.lstatSync(this.privKey).isFile()
      || !fs.existsSync(this.pubKey) || !fs.lstatSync(this.pubKey).isFile()) {
      cert = this.Key;
    } else {
      cert = fs.readFileSync(this.pubKey);
      opts.algorithm = 'RS256';
    }
    return jwt.verify(token, cert, opts)
  }

  /**
   *
   * @param token
   * @returns {*}
   */
  checkRefreshToken(token) {
    let opts = {};
    let cert;
    if (!fs.existsSync(this.privKeyRefresh) || !fs.lstatSync(this.privKeyRefresh).isFile()
      || !fs.existsSync(this.pubKeyRefresh) || !fs.lstatSync(this.pubKeyRefresh).isFile()) {
      cert = this.KeyRefresh;
    } else {
      cert = fs.readFileSync(this.pubKeyRefresh);
      opts.algorithm = 'RS256';
    }
    return jwt.verify(token, cert, opts)
  }
}
