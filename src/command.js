const { Command } = require('commander');
const { version } = require('../package.json')

const initCommand = (options, config)=>{
  const program = new Command();
  program.version(version);

  program
    .option('-E, --envs <envs>', `增加编译环境('{"dev": {}, "prod": {"target": "http:...","package": "name"}}')`, (c, p) =>
      ({...p, ...JSON.parse(c)}), {})
    .option('-e, --env <env>', '编译环境')
    .option('-n, --envname <env name>', '项目中的环境变量名', '__TTD_ENV__')
    // ttd 发包平台 http://192.168.88.122:9990/rd.php
    // .option('-t, --target <url>', '部署地址')
    .option('--no-deploy', '是否部署')
    .option('-d, --dist <directory>', '打包目录')
    .option('-p, --package <package name>', '默认包名')
    .option('-o, --output <directory>', '输出目录', 'output')
    .option('-c, --cookie <string>', 'cookie', 'fb_user=%E5%91%A8%E5%BF%97%E5%BC%BA') // `fb_user=${encodeURIComponent('周志强')}\`

    if (config && config.allowUnknownOption) {
        program.allowUnknownOption();
    }

  program.parse(options, { from: 'user' });
  program.parse(process.argv);

  return program
}

// 获得command的参数
const getOpts = (program) => {
  const {envname, env, output, dist, package: packageDefault, envs, deploy, cookie} = program;
  const envConfig = envs[env]
  const packageName = (envConfig && envConfig.package) || packageDefault
  const target = envConfig && envConfig.target

  return {
    envname, env, output, dist, packageName, envs, deploy, target, envConfig, cookie
  }
}

// 设置项目中的环境变量
const setProjectEnv = async (envs, program) => {
  const envString = (program.env || '').trim();
  const envName = envString.split('?')[0]; // 可以使用 dev?level=1&debug=true 来传参

  if (!envs.includes(envName)) {
    console.log(`请选择环境( [${envs}] ):`)
    // 接收数据为 utf8 字符串，
    // 如果没有设置字符编码，则会接收到 Buffer 对象。
    await new Promise((resolve, reject) => process.stdin.on('data', (input) => {
      const envString = input.toString().trim();
      const envName = envString.split('?')[0]; // 可以使用 dev?level=1&debug=true 来传参
      if (envs.includes(envName)) {
        program.parse(['-e', envString], { from: 'user' });
        process.stdin.emit('end')
        resolve()
      } else {
        console.log(`请选择环境( [${envs}] ):`)
      }
    }))
  }
  // console.log(`编译环境为: process.env.${program.envname}="${program.env}"`)
  return `"${program.env}"`
}

module.exports.initCommand = initCommand;
module.exports.getOpts = getOpts;
module.exports.setProjectEnv = setProjectEnv;