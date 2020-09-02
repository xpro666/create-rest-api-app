#Create Rest API Application
Create Rest API apps with no build configuration.

- [Creating an App](#creating-an-app) – How to create a new app.
- [User Guide](https://git.orl.ueshka/tusove/create-rest-api-app/) – How to develop apps bootstrapped with Create Rest API App.

Create Rest API App works on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://git.orl.ueshka/tusove/create-rest-api-app/issues/new).

## Quick Overview

```sh
npx create-rest-api-app my-app
cd my-app
npm run dev
```

If you've previously installed `create-rest-api-app` globally via `npm install -g create-rest-api-app`, we recommend you uninstall the package using `npm uninstall -g create-rest-api-app` or `yarn global remove create-rest-api-app` to ensure that npx always uses the latest version.

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then you can execute request to [http://localhost:9000](http://localhost:9000)

## Creating an App

**You’ll need to have Node 8.16.0 or Node 10.16.0 or later version on your local development machine** (but it’s not required on the server). You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

To create a new app, you may choose one of the following methods:

### npx

```sh
npx create-rest-api-app my-app
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) is a package runner tool that comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

### npm

```sh
npm init rest-api-app my-app
```

_`npm init <initializer>` is available in npm 6+_

It will create a directory called `my-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-app
├── README.md
├── node_modules
├── package.json
├── swaggerDef.js
├── .gitignore
├── app
|  ├── api
|  |  └── index.js
|  ├── clusterRun.js
|  ├── components
|  |  ├── auth.js
|  |  ├── db_main.js
|  |  ├── koa.js
|  |  ├── logger.js
|  |  └── settings.js
|  ├── controllers
|  |  └── index.js
|  ├── index.js
|  ├── libs
|  |  ├── eventTimer.js
|  |  ├── index.js
|  |  ├── netutils.js
|  |  └── utils.js
|  ├── models
|  |  └── index.js
|  ├── plugins
|  |  └── index.js
|  └── resourceString.js
├── bin
|  ├── ecosystem.config.js
|  └── index.js
└── test
   └── index.js
```

## License

Create Rest API App is open source software [licensed as MIT](https://git.orl.ueshka/tusove/create-rest-api-app/blob/master/LICENSE).