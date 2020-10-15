const fs = require('fs');


const request = require('request');

// 发布文件到ttd发包平台
const deployHandler = (filePath, url, cookie) => new Promise((resolve, reject) => {
  console.log(`开始上传文件: ${filePath}`)
  var formData = {
    file: fs.createReadStream(filePath)
  };
  const j = request.jar();
  const requestCookie = request.cookie(cookie);

  j.setCookie(requestCookie, new URL(url).origin);

  request.post({
      url: url,
      formData: formData,
      jar: j,
  }, (err, httpResponse, body) => {
      if (err) {
        reject(new Error(`上传失败: ${err.message}`));
        return
      }
      if (body.includes('上传成功')) {
        console.log(`上传${filePath}成功`)
        resolve(body);
        return
      }
      reject(new Error(`上传失败: ${body}`));
  });
})

module.exports.deployHandler = deployHandler;
