const pjson = require('../package.json');
const appName = pjson.name;

module.exports = {
  apps: [
    {
      name: appName,
      script: "./bin/index.js",
      watch: true,
      ignore_watch: [
        "node_modules",
        "var",
        "test",
        "docs",
        "*.md",
        "*.sh"
      ],
      "env_dev": {
        "NODE_ENV": "development"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
