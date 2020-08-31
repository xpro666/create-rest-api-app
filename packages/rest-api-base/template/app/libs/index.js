const fs = require('fs-extra');
const path = require('path');

let libs = {};

function Libs() {
  const basedir = path.resolve(__dirname);
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
          libs[dirItem] = require(path.join(basedir, dirItem, 'rest-api-scripts.js'));
        }
      } else {
        libs[path.parse(dirItem).name] = require(path.join(basedir, dirItem));
      }
    }
  }
  return libs
}

exports = module.exports = Libs();
