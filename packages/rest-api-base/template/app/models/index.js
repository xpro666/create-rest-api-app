
const fs = require('fs-extra');
const path = require('path');
const logger = process.logger || console;

let model = {
  // root: require('./root'),
}

function init() {
  const basedir = path.resolve(__dirname)
  const dirList = (fs.readdirSync(basedir, {withFileTypes: true})).sort();
  for (let i = 0; i < dirList.length; i++){
    const dirItem = dirList[i].name || dirList[i]
    if (path.join(basedir, dirItem) !== __filename){
      let isDirectory = false
      if (typeof dirList[i]['isDirectory'] !== 'function'){
        const stat = fs.statSync(path.join(basedir, dirItem))
        isDirectory = stat.isDirectory()
      } else {
        isDirectory = dirList[i].isDirectory()
      }
      if (isDirectory){
        if (fs.existsSync(path.join(basedir, dirItem, 'rest-api-scripts.js'))){
          model[dirItem] = require(path.join(basedir, dirItem, 'rest-api-scripts.js'));
        }
      }else {
        model[path.parse(dirItem).name] = require(path.join(basedir, dirItem));
      }
    }
  }
  logger.info('Loaded models', Object.keys(model), 'from', path.relative(process.cwd(),basedir))
  return model
}

exports = module.exports = init()
