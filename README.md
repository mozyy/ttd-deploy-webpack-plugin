# TTD Deploy Webpack Plugin

## 命命行参数:
| 短参数 | 长参数 | 说明 | 默认 |
|--|--|--| -- |
| -V | --version                | output the version number  |
| -E | --envs <envs>            | 增加编译环境('{"dev": {}, "prod": {"target": "http:...","package": "name"}}') | (default: {})  |
| -e | --env <env>              | 编译环境(可以使用 dev?level=1&debug=true 来传参)  |
| -n | --envname <env name>     | 项目中的环境变量名(会在项目是生成 \_\_TTD_ENV\_\_ 环境变量) | (default: "\_\_TTD_ENV\_\_")  |
| -t | --target <url>           | 部署地址  |
|    | --no-deploy boolean         | 是否部署 | (default: true)  |
| -d | --dist <directory>       | 打包目录  |
| -p | --package <package name> | 默认包名  |
| -o | --output <directory>     | 输出目录 | (default: "output")  |
| -c | --cookie <string>          | cookie              | fb_user=%E5%91%A8%E5%BF%97%E5%BC%BA  |
| -h | --help                   | 查看帮助说明  |


## 使用

### 安装
npm 安装 `npm install @toolspack/ttd-deploy-webpack-plugin`

### webpack配置
然后在webpack.config.js 中:
```javascript
const TTDDeployWebpackPlugin = require('@toolspack/ttd-deploy-webpack-plugin')

module.exports = {
  entry: {
    app: "./src/main.js"
  },
  plugins: [
    new TTDDeployWebpackPlugin([
      '-E', JSON.stringify({
      dev: {},
      prod:{target: 'http://192.168.88.122:9990/upfile.php?pk_id=30'},
    }),
    '-d', 'dist',
    '-p', 'ttd_manager',
    ]),
  ]
}
```

### 项目中
在 /src/env.js 中:
```javascript
// __TTD_ENV__ 是 TTDDeployWebpackPlugin 插件生成的 环境变量
const env = __TTD_ENV__ // dev, prod

const configs = {
  dev: { // 开发环境
    baseUrl: 'http://192.168.0.252:8011',
  },
  prod: { // 线上
    baseUrl: 'http://pe.totodi.com:13811',
  },
}

const config = configs[env]

export default config
```

### npm命令
在 package.json 中:
```json
{
  "scripts": {
    "start": "webpack -e dev",
    "build": "node build/build.js -e prod",
  },
}
```

### 命令行中
在 cmd 执行 `npm run start -- -e prod?level=1` 可以用 ? 来传更多参数