#Getting Started
Create Rest API App is an officially supported way to create Rest API applications. 
It offers a modern build setup with no configuration.
<br/>

##Quick Start
```
npx create-rest-api-app my-app
cd my-app
npm run dev
```
>If you've previously installed create-rest-api-app globally via npm install -g create-rest-api-app, 
>we recommend you uninstall the package using npm uninstall -g create-rest-api-app to ensure that npx 
>always uses the latest version.

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with 
npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then you can execute request to [http://localhost:9000](http://localhost:9000)

## Selecting a template
You can now optionally start a new app from a template by appending `--template [template-name]` to the creation command.

If you don't select a template, we'll create your project with our base template.

Templates are always named in the format `craa-template-[template-name]`, however you only need to provide the `[template-name]` to the creation command.

```
npx create-rest-api-app my-app --template [template-name]
```
>You can find a list of available templates by searching for "craa-template-*" on npm.

Our Custom Templates documentation describes how you can build your own template.

##Selecting a package manager
When you create a new app, the CLI will use Yarn to install dependencies (when available). If you have Yarn installed, but would prefer to use npm, you can append --use-npm to the creation command. For example:
```
npx create-rest-api-app my-app --use-npm
```
## Output
Running any of these commands will create a directory called `my-app` inside the current folder. Inside that directory, it will generate the initial project structure and install the transitive dependencies:
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
