const fs = require('fs');
const path = require('path');


const archiver = require('archiver');


// 压缩指定文件夹: distPath 到 outputPath/packageName.zip
const archiveDist = async (outputPath, distPath, packageName, zipPath="dist") => {
  const outputFile = path.resolve(outputPath, packageName + '.zip')
  console.log(`开始压缩文件: ${distPath} => ${outputFile}`)
  await new Promise((resolve, reject) => fs.stat(outputPath, (err, stats) => {
    if (err || !stats.isDirectory()) {
      console.log(`文件夹${outputPath}不存在, 创建中`)
      fs.mkdir(outputPath, {recursive: true}, (err)=>{
        if (err) {
          reject(new Error(`文件夹创建错误: ${err.message}`))
        } else {
          resolve()
        }
      })
    } else {
      resolve()
    }
  }))

  // 创建一个可写文件流，以便把压缩的数据导入
  var output = fs.createWriteStream(outputFile)
  // archiv对象，设置等级
  var archive = archiver('zip')
  // 管道连接
  archive.pipe(output)
  // 压缩文件夹到压缩包
  archive.directory(distPath, zipPath)
  // 开始压缩
  archive.finalize()
  return new Promise((resolve, reject) => {
    // 监听压缩、传输数据过程中的错误回调
    archive.on('error', function (err) { // 压缩失败
      reject(new Error(`压缩失败: ${err.message}`))
    })
    // 监听压缩、传输数据结束
    output.on('close', function () { // 压缩完成
      // deleteFolder(path.resolve(distPath, 'dist'))
      console.log(`压缩完成: ${distPath} => ${outputFile}`)
      resolve()
    })
  })
}

function deleteFolder (path) {
  var files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file) {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

module.exports.archiveDist = archiveDist;
module.exports.deleteFolder = deleteFolder;
