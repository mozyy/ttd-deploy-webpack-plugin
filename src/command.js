const { Command } = require('commander');
const { version } = require('../package.json')

const initCommand = (options, config)=>{
  const program = new Command();
  program.version(version);

  program
    .option('-E, --envs <envs>', `增加编译环境('{"dev": {}, "prod": {"target": "http:...","needRemarks":true,"needFbkey":true,"package": "name"}}')`, (c, p) =>
      ({...p, ...JSON.parse(c)}), {})
    .option('-e, --env <env>', '编译环境')
    .option('-n, --envname <env name>', '项目中的环境变量名', '__TTD_ENV__')
    // ttd 发包平台 http://192.168.88.122:9990/rd.php
    // .option('-t, --target <url>', '部署地址')
    .option('--no-deploy', '是否部署')
    .option('--no-sass', '是否在sass注入环境变量')
    .option('-d, --dist <directory>', '打包目录')
    .option('-p, --package <package name>', '默认包名')
    .option('-o, --output <directory>', '输出目录', 'output')
    .option('-c, --cookie <string>', 'cookie', 'fb_user=%E5%91%A8%E5%BF%97%E5%BC%BA; fb_leve=1; fb_role=1') // `fb_user=${encodeURIComponent('周志强')}\`
    .option('-z, --zipPath <string>', 'zip文件的目录结构', 'dist')
    .option('-m, --remarks <string>', "发布备注", '')
    .option('-k, --fbkey <string>', "发布key", '')

    if (config && config.allowUnknownOption) {
        program.allowUnknownOption();
    }

  program.parse(options, { from: 'user' });
  program.parse(process.argv);

  return program
}

// 获得command的参数
const getOpts = (program) => {
  const {env = '',  package: packageDefault, envs, ...otherProgram} = program;
  const envConfig = envs[env.split('?')[0]] || {}
  const {package, ...otherEnvConfig} = envConfig
  const packageName = package || packageDefault

  return {
    env, packageName, envs,
    ...otherProgram,
    ...otherEnvConfig,
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
    await new Promise((resolve, reject) => {
      const onData = (input) => {
        const envString = input.toString().trim();
        const envName = envString.split('?')[0]; // 可以使用 dev?level=1,debug=true 来传参
        if (envs.includes(envName)) {
          program.parse(['-e', envString], { from: 'user' });
          process.stdin.off('data', onData)
          resolve()
        } else {
          console.log(`请选择环境( [${envs}] ):`)
        }
      }
      process.stdin.on('data', onData)
    })
  }
  // console.log(`编译环境为: process.env.${program.envname}="${program.env}"`)
  return `"${program.env}"`
}

module.exports.initCommand = initCommand;
module.exports.getOpts = getOpts;
module.exports.setProjectEnv = setProjectEnv;