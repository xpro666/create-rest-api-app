// @remove-on-eject-begin
/**
 * Copyright (c) 2020-present, Evgeniy Tusov
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appDocs: resolveApp('/docs'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'app/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('app'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'app/setupTests'),
  proxySetup: resolveApp('app/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
};

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/rest-api-scripts/config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appDocs: resolveApp('docs'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'app/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('app'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'app/setupTests'),
  proxySetup: resolveApp('app/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('app/rest-api-app-env.d.ts'),
  ownTypeDeclarations: resolveOwn('lib/rest-api-app.d.ts'),
};

const ownPackageJson = require('../package.json');
const restApiScriptsPath = resolveApp(`node_modules/${ownPackageJson.name}`);
const restApiScriptsLinked =
  fs.existsSync(restApiScriptsPath) &&
  fs.lstatSync(restApiScriptsPath).isSymbolicLink();

// config before publish: we're in ./packages/rest-api-scripts/config/
if (
  !restApiScriptsLinked &&
  __dirname.indexOf(path.join('packages', 'rest-api-scripts', 'config')) !== -1
) {
  const templatePath = '../craa-template/template';
  module.exports = {
    dotenv: resolveOwn(`${templatePath}/.env`),
    appPath: resolveApp('.'),
    appBuild: resolveOwn('../../docs'),
    appPublic: resolveOwn(`${templatePath}/public`),
    appHtml: resolveOwn(`${templatePath}/public/index.html`),
    appIndexJs: resolveModule(resolveOwn, `${templatePath}/app/index`),
    appPackageJson: resolveOwn('package.json'),
    appSrc: resolveOwn(`${templatePath}/app`),
    appTsConfig: resolveOwn(`${templatePath}/tsconfig.json`),
    appJsConfig: resolveOwn(`${templatePath}/jsconfig.json`),
    yarnLockFile: resolveOwn(`${templatePath}/yarn.lock`),
    testsSetup: resolveModule(resolveOwn, `${templatePath}/app/setupTests`),
    proxySetup: resolveOwn(`${templatePath}/app/setupProxy.js`),
    appNodeModules: resolveOwn('node_modules'),
    // These properties only exist before ejecting:
    ownPath: resolveOwn('.'),
    ownNodeModules: resolveOwn('node_modules'),
    appTypeDeclarations: resolveOwn(`${templatePath}/app/rest-api-app-env.d.ts`),
    ownTypeDeclarations: resolveOwn('lib/rest-api-app.d.ts'),
  };
}
// @remove-on-eject-end

module.exports.moduleFileExtensions = moduleFileExtensions;
