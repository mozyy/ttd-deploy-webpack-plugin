const path = require('path')

const { DefinePlugin } = require('webpack')

const command = require('./command')
const { archiveDist } = require('./archive')
const { deployHandler } = require('./deploy')

const pluginName = 'TTDDeployWebpackPlugin';

class TTDDeployWebpackPlugin {
  /**
   *p1
   * @param {*} option
   * Options:
   *   -V, --version                 output the version number
   *   -E, --envs <envs>             增加编译环境('{"dev": {}, "prod": {"target": "http:...","package": "name"}}') (default: {})
   *   -e, --env <env>               编译环境
   *   -n, --envname <env name>      项目中的环境变量名 (default: "__TTD_ENV__")
   *       --no-deploy <boolean>     不部署(默认在生产环境且指定target,package时自动部署)
   *   -d, --dist <directory>        打包目录
   *   -p, --package <package name>  默认包名
   *   -o, --output <directory>      输出目录 (default: "output")
   *   -z, --zipPath                 zip文件的目录结构(default: "dist")
   *   -c, --cookie string           cookie
   *   -h, --help                    display help for command
   *   --no-sass                     不在sass 里注入 环境变量
   * @param {*} config
   * allowUnknownOption boolean allow unknown option
   * 
   */
  constructor(option, config) {
    const program = command.initCommand(option, config);

    console.log('ttd option: ', program.opts());

    this.program = program
    this.defineEnv = null
    this.plugins = [
      new DefinePlugin({
        [program.envname]: DefinePlugin.runtimeValue(()=> this.defineEnv)
      }),
    ];
  }

  apply(compiler) {
    // [
    //   'entry-option bailResult',
    //   'after-plugins sync',
    //   'after-resolvers sync',
    //   'environment sync',
    //   'after-environment sync',
    //   'before-run async',
    //   'run async',
    //   'watch-run async',
    //   'normal-module-factory sync',
    //   'context-module-factory sync',
    //   'before-compile async',
    //   'compile sync',
    //   'this-compilation sync',
    //   'compilation sync',
    //   'make parallel',
    //   'after-compile async',
    //   'should-emit bailResult',
    //   'need-additional-pass bailResult',
    //   'emit async',
    //   'after-emit async',
    //   'done sync',
    //   'failed sync',
    //   'invalid sync',
    //   'watch-close sync',
    // ].forEach(str => {
    //   const [plugin, type] = str.split(' ')
    //   compiler.plugin(plugin, (compilation, callback) => {
    //     console.log('webpack hook: ', plugin, ', type: ', type);
    //     if (type === 'async') {
    //       callback()
    //     }
    //   });
    // })
    compiler.hooks.run.tapAsync(pluginName, (compilation, callback) => {
      this.setProjectEnv(compiler, callback)
    })
    compiler.hooks.watchRun.tapAsync(pluginName, (compilation, callback) => {
      this.setProjectEnv(compiler, callback)
    })
      
    const { sass } = command.getOpts(this.program);
    if (sass){
      compiler.hooks.compilation.tap(pluginName, compilation => {
        compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
          if (/.scss/.test(module.userRequest)) {
            module.loaders.push({
              loader: 'sass-loader', // Path to loader
              options: {
                prependData: "$" + this.program.envname + ":" + this.defineEnv + ";",
              }
            });
          }
        });
      });
    }

    this.plugins.forEach(plugin => {
      plugin.apply(compiler);
    });

    compiler.hooks.done.tap(pluginName, async (compilation) => {
      await Promise.resolve(); // 输出打印在最后
      const {envname, env, output, dist, packageName, target, deploy, cookie, zipPath} = command.getOpts(this.program);
      console.log(`环境[${envname}]: ${env}`);

      if (process.env.NODE_ENV === 'production') {
        if (output && dist && packageName) {
          const envOutput = path.resolve(output, env)
          await archiveDist(envOutput, dist, packageName, zipPath)
          if (deploy && target) {
            const filePath = path.resolve(envOutput, packageName + '.zip')
            deployHandler(filePath, target, cookie)
          }
        }
      }
    });

  }

  // 设置环境变量
  setProjectEnv(compiler, callback) {
    // 只设置一次环境变量
    if (this.defineEnv) {
      callback()
      return
    }
    const envs = Object.keys(this.program.envs);
    command.setProjectEnv(envs, this.program).then(env => {
      this.defineEnv = env
      callback();
    })
  }
}

module.exports = TTDDeployWebpackPlugin;