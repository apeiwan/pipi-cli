#!/usr/bin/env node
require('shelljs/global');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');
const inquirer = require('inquirer');
const defaultConfig = require('../util/publishDefaultConfig');
const mergeWith = require('lodash.mergewith');
const help = require('../util/help');
const dayjs = require('dayjs');

async function run(projectPath){
  const cwd = projectPath || process.cwd();
  const configFilePath = path.resolve(cwd, 'pipi.cli.config.js');
  const configPackagePath = path.resolve(cwd, 'package.json');
  const pkg = require(configPackagePath);

  // 检查目录是否存在
  if (!fs.existsSync(configFilePath)) {
    console.error(chalk.red('当前项目缺少配置文件 pipi.cli.config.js 配置文件'));
    process.exit(1);
  }
  // 检查配置文件是否存在
  if (!fs.existsSync(configPackagePath)) {
    console.error(chalk.red('当前项目缺少 package.json 文件说明'));
    process.exit(1);
  }

  const projectConfig = require(configFilePath);

  let inquirerTaskList = [];
  let optionTaskKey = ['staging','staging2','staging3','staging4','preview','production'];
  for(let i = 0;i < optionTaskKey.length;i++){
    const key = optionTaskKey[i];
    if(projectConfig[key]){
      const item = mergeWith({},defaultConfig[key],projectConfig[key]);
      const name = item.name + '-' + item.server;
      inquirerTaskList.push({
        name: name,
        value: mergeWith({},item,{
          env: item.env,
          title: name,
          upload: 'scp -r ' + item.dist + '/** ' + item.server
        })
      });
    }
  }
  if(!inquirerTaskList.length){
    console.warn('没有可发布的任务项');
    process.exit(1);
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'task',
      message: '请选择需要部署的环境',
      pageSize: 1000,
      choices: inquirerTaskList
    }
  ]);
  let checkTaskList = answers.task;
  if (!checkTaskList.length) return;

  var selectTask = {};
  var runTaskIndex = 0;
  var env = '';
  var language = projectConfig.language;
  selectTask.build = '';
  startTask();

  // 开始任务
  function startTask () {
    selectTask = checkTaskList[runTaskIndex];
    env = selectTask.env;
    language = projectConfig.language;
    selectTask.build = help.crossEnv('NODE_ENV', 'production') + '&& vue-cli-service build --mode ' + selectTask.env;
    console.warn(chalk.magenta('====== 任务' + (runTaskIndex + 1) + '：' + selectTask.title + ' 开始执行 ======'));
    runExec();
  }

  // 任务结束结果统计
  function taskRunEndHandle () {
    console.warn(chalk.green('====== 任务' + (runTaskIndex + 1) + '：' + selectTask.title + ' 【' + dayjs().format('YYYY-MM-DD HH:mm:ss') + '】 执行成功 ======\n\n'));
    runTaskIndex += 1;
    if (runTaskIndex === checkTaskList.length) {
      console.log(chalk.bold.magenta('********** 任务成功执行结果统计 **********'));
      checkTaskList.forEach(function (item, index) {
        console.log(chalk.green(index + 1 + '、' + item.title + ' ' + dayjs().format('YYYY-MM-DD HH:mm:ss')));
      });
      process.exit();
    } else {
      startTask();
    }
  }

  // 获取任务的统计
  function getCdnPath () {
    /* eslint-disable-next-line */
    return 'https:\/\/' + selectTask.bucket + '.' + (selectTask.domain || 'apeiwan.com') + (selectTask.prefix || ('/' + pkg.name));
  }

  // 返回生成的编译命令
  function getBuildExecStr () {
    var assetsDir = pkg.version;
    var outputDir = selectTask.dist;
    switch (language) {
    case 'vue':
      exec('rm -rf bundle');
      return help.crossEnv('outputDir', outputDir) + '&& ' + help.crossEnv('assetsDir', assetsDir) + '&& ' + help.crossEnv('publicPath', getCdnPath()) + '&& ' + selectTask.build;
    case 'default':
    case 'none':
      exec('rm -rf bundle');
      return 'gulp released --gulpfile ' + help.resolve('gulpfile.js') + ' --cwd ' + process.cwd() + ' --publicPath ' + selectTask.publicPath + '  --env production --build ' + selectTask.dist + ' --cdn ' + getCdnPath();
    case 'oss':
    case 'all':
      exec('rm -rf bundle');
      return 'cp -R ' + path.resolve(process.cwd(), outputDir || 'src') + ' ' + path.resolve(process.cwd(), 'bundle');
    default:
      return '';
    }
  }

  // 清除目录文件
  function getExecClearCode () {
    return exec('rm -rf dist dist_released bundle bundle_released production staging staging2 staging3 staging4 preview').code;
  }

  // 上传到测试服务器
  function uploadServerTest () {
    var spinnerUpload = ora(' 开始部署到服务器：' + chalk.cyan.bold(selectTask.server) + chalk.cyan.bold(' ' + selectTask.upload)).start();
    if (exec(selectTask.upload).code === 0) {
      spinnerUpload.succeed(chalk.green.bold('服务器部署成功 ') + chalk.cyan.bold(selectTask.server));
      getExecClearCode();
      taskRunEndHandle();
    }
  }

  // oss 文件上传任务
  function ossTask (success, fail) {
    const ossConfig = {
      bucket: selectTask.bucket,
      dist: path.resolve(process.cwd(), selectTask.dist),
      prefix: selectTask.prefix || '/' + pkg.name,
      region: selectTask.region,
      accessKeyId: selectTask.accessKeyId,
      accessKeySecret: selectTask.accessKeySecret,
    };
    const cdnPath = getCdnPath();
    const spinnerLoad = ora('开始上传文件到' + chalk.bold(' oss ') + '服务器 ' + chalk.cyan.bold(JSON.stringify(ossConfig))).start();
    if (exec('scp -r ' + selectTask.dist + '/**' + '  root@47.96.239.153:/mnt/' + selectTask.bucket + ossConfig.prefix).code === 0) {
      spinnerLoad.succeed(chalk.green.bold('oss 文件上传成功') + ' ' + chalk.cyan.bold('cdn地址：') + chalk.green.bold(cdnPath));
      success && success(cdnPath);
    } else {
      process.exit(1);
      spinnerLoad.fail('上传失败，请检查俺看日志');
      fail && fail();
    }
  }

  // git push
  function gitTagPush () {
    const spinnerLoad = ora('开始推送项目 ' + chalk.cyan.bold(pkg.name) + ' 到 ' + chalk.cyan.bold(pkg.git) + ' 准备发布，版本号：' + chalk.cyan.bold(pkg.version)).start();
    var tag = 'v' + pkg.version + '_source';
    var sourcePushExec = 'git tag ' + tag + ' && git push origin ' + tag;
    var bundlePushExec = 'cd bundle && git init && git remote add origin ' + pkg.git + ' && git add . && git commit -a -m ' + tag + ' && git branch -m master bundle && git push -f origin bundle:bundle && cd ..';
    function failBundle () {
      exec(`git tag -d ${tag} && git push origin :refs/tags/${tag}`);
      console.warn(`分之 bundle 推送失败，本地 tag ${tag} 和 远程 tag ${tag}已删除`);
      process.exit(1);
    }
    if (exec(sourcePushExec).code === 0) {
      if (exec('git push origin --delete bundle').code !== undefined) {
        if (exec(bundlePushExec).code === 0) {
          spinnerLoad.succeed('项目 ' + chalk.cyan.bold(pkg.name) + (selectTask.author ? '已部署到正式线，请确认结果' : chalk.green.bold(' 部署成功,请到钉钉进行提交部署申请')));
          if (!(language === 'all' || language === 'oss')) {
            getExecClearCode();
          } else if ((language === 'all' || language === 'oss') && selectTask.author) {
            ossTask(function (cdnPath) {
              console.log(chalk.green.bold('所有文件 oss 部署成功 ') + 'cdn path：' + chalk.cyan.bold(cdnPath));
              taskRunEndHandle();
            });
          } else {
            taskRunEndHandle();
          }
        } else {
          exec(` git tag -d ${tag} && git push origin :refs/tags/${tag} `);
          console.warn(`分之 bundle 推送失败，本地 tag ${tag} 和 远程 tag ${tag}已删除`);
          process.exit(1);
        }
      }else{
        failBundle();
      }
    }else{
      console.warn(`版本 ${tag}推送失败`);
      process.exit(1);
    }
  }

  // 执行命令
  function runExec () {
    if (env === 'production') {
      inquirer.prompt({
        type: 'confirm',
        name: 'value',
        message: '1. 请确认当前是否进行了' + chalk.cyan.bold(' pull ') + '操作  2.已询问' + chalk.cyan.bold(' 其他来源') + '是否有变更提交操作  3.当前文件是否已合并到' + chalk.cyan.bold(' master ') + '分支'
      }).then(function (isConfirmPublish) {
        if (isConfirmPublish.value) {
          if (help.getCurrentBranceName() !== 'master') {
            console.log(chalk.cyan.bold('需在 master 分支才能进行发布操作'));
          } else if (!help.checkBranceCommitFile()) {
            console.log(chalk.cyan.bold(' master ') + ' 分支存在有文件未提交的操作，请先进行提交操作');
          } else if (help.isExitsTag(pkg.version)) {
            console.log('请修改下一个 ' + chalk.cyan.bold('package.json') + ' 文件的版本号，然后进行提交');
          } else {
            publishStep();
          }
        }
      });
    } else {
      publishStep();
    }

    // 编译任务
    function buildTask () {
      var buildExecStr = getBuildExecStr();
      const spinnerLoad = ora('开始编译 ' + chalk.cyan.bold(buildExecStr)).start();
      var code = exec(buildExecStr).code;
      if (code === 0) {
        spinnerLoad.succeed('项目 ' + chalk.green.bold(pkg.name) + ' 编译成功，版本号：' + chalk.green.bold(pkg.version) + ' ');
        return 0;
      }
      process.exit(1);
      return -1;
    }

    function publishStep () {
      let clearResult = language === 'all' || language === 'oss' ? 0 : getExecClearCode();
      if (clearResult === 0) {
        if (env === 'production') {
          if (buildTask() === 0) {
            gitTagPush();
          }
        } else {
          if (language === 'all' || language === 'oss') {
            ossTask(function (cdnPath) {
              console.log(chalk.green.bold('所有文件 oss 部署成功 ') + 'cdn path：' + chalk.cyan.bold(cdnPath));
              taskRunEndHandle();
            });
          } else if (buildTask() === 0) {
            ossTask(function () {
              uploadServerTest();
            });
          }
        }
      }
    }
  }
}


module.exports = function (...args) {
  return run(...args).then().catch(err => {
    console.log(err);
    process.exit(1);
  });

};