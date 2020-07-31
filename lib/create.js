#!/usr/bin/env node
require('shelljs/global');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const validateProjectName = require('validate-npm-package-name');

/*选择绑定的域名*/
const inquirerActionBindDomain = [
  {
    name: 'action',
    type: 'list',
    message: '请选择绑定访问的域名',
    choices: [
      { name: 'app.apeiwan.com', value: 'app' },
      { name: 'h5.apeiwan.com', value: 'h5' },
    ]
  }
];

async function run(projectName,options){
  const cwd = options.cwd || process.cwd();
  const inCurrent = projectName === '.';
  const name = inCurrent ? path.relative('../', cwd) : projectName;
  const targetDir = path.resolve(cwd, projectName || '.');

  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`无效的项目名称: "${name}"`));
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err));
    });
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn));
    });
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    const { ok } = await inquirer.prompt([
      {
        name: 'ok',
        type: 'confirm',
        message: '当前项目已存在该目录，只有覆盖才能进行创建，是否继续？'
      }
    ]);
    if (!ok) {
      return;
    }
  }

  const { domain } = await inquirer.prompt([
    {
      name: 'domain',
      type: 'list',
      message: '请选择绑定访问的域名',
      choices: [
        { name: 'https://app.apeiwan.com', value: 'app' },
        { name: 'https://h5.apeiwan.com', value: 'h5' },
      ]
    }
  ]);
  if (!domain) {
    return;
  }

  const { description } = await inquirer.prompt([
    {
      name: 'description',
      type: 'input',
      message: '请输入项目的简要说明',
      default:'项目说明'
    }
  ]);
  // staging: {
  //   server: "tomcat@116.63.34.107:/data/web1/h5/htm/lottery"
  // },
  // staging2: {
  //   server: "tomcat@116.63.34.107:/data/web2/h5/htm/lottery"
  // },
  // staging3: {
  //   server: "tomcat@116.63.34.107:/data/web3/h5/htm/lottery"
  // },
  // staging4: {
  //   server: "tomcat@116.63.34.107:/data/web4/h5/htm/lottery"
  // },
  // preview: {
  //   server: "tomcat@47.114.77.34:/data/pre/h5/htm/lottery"
  // },
  // production: {
  //   server: "tomcat@47.96.77.150:/data/h5/htm/lottery"
  // }
  //
  //
  // app
  // staging: {
  //   server: 'tomcat@116.63.34.107:/data/web1/h5/down/lob-template'
  // },
  // staging2: {
  //   server: 'tomcat@116.63.34.107:/data/web2/h5/down/lob-template'
  // },
  // staging3: {
  //   server: 'tomcat@116.63.34.107:/data/web3/h5/down/lob-template'
  // },
  // staging4: {
  //   server: 'tomcat@116.63.34.107:/data/web4/h5/down/lob-template'
  // },
  // preview: {
  //   server: 'tomcat@47.114.77.34:/data/pre/h5/down/lob-template'
  // },
  // production: {
  //   server: 'tomcat@47.96.77.150:/data/h5/down/lob-template'
  // }
  const templateGitUrl = 'http://git.hbkejin.com/pipiweb/lob-template.git';
  const giftSpinner = ora(` 开始下载模板：${chalk.cyan(templateGitUrl)} \n`).start();
  if(exec(`git clone http://git.hbkejin.com/pipiweb/lob-template.git ${targetDir}`).code === 0){
    giftSpinner.succeed('模板下载完毕');
    const initSpinner = ora(' 初始化项目 ').start();
    let pipiCliConfigJs = fs.readFileSync(path.resolve(targetDir,'pipi.cli.config.js'),'utf-8');
    let pkgJSON = fs.readFileSync(path.resolve(targetDir,'package.json'),'utf-8');
    let readmeMD = fs.readFileSync(path.resolve(targetDir,'README.md'),'utf-8');
    pipiCliConfigJs = pipiCliConfigJs.replace(/lob-template/g,name);
    readmeMD = readmeMD.replace(/项目模板/g,description).replace(/\/lob-template/g,'/' + name);
    pkgJSON = pkgJSON.replace(/lob-template/g,name);
    if(domain === 'h5'){
      readmeMD = readmeMD.replace(/app./g,'h5.').replace(/\/down\//g,'/htm/');
      pipiCliConfigJs = pipiCliConfigJs.replace(/\/down\//g,'/htm/');
    }
    fs.writeFileSync(path.resolve(targetDir,'pipi.cli.config.js'),pipiCliConfigJs,'utf-8');
    fs.writeFileSync(path.resolve(targetDir,'README.md'),readmeMD,'utf-8');
    fs.writeFileSync(path.resolve(targetDir,'package.json'),pkgJSON,'utf-8');
    initSpinner.succeed('项目初始化成功');
    const remoteSpinner = ora(' 初始化远程服务器目录 ').start();
    const remoteDir = `/data/[dir]/h5/${domain === 'h5' ? 'htm' : 'down'}/${name}`;
    const dirs = ['web1','web2','web3','web4'];
    let createTestRemoteWebDirExecStr = [];
    for(let i = 0;i < dirs.length;i++){
      createTestRemoteWebDirExecStr.push(remoteDir.replace('[dir]',dirs[i]));
    }
    const testEnvExecMkdirExec = `ssh tomcat@116.63.34.107 -t -t "mkdir -p ${createTestRemoteWebDirExecStr.join(' ')} && exit; /bin/bash"`;
    const preEnvExecMkdirExec = `ssh tomcat@47.114.77.34 -t -t "mkdir -p ${remoteDir.replace('[dir]','pre')} && exit; /bin/bash"`;
    if(exec(testEnvExecMkdirExec).code === 0 && exec(preEnvExecMkdirExec).code === 0){
      remoteSpinner.succeed('远程服务器目录初始化成功');
      const installStr = 'npm install --registry=https://registry.npm.taobao.org/';
      const installSpinner = ora(` 开始安装依赖 ${chalk.cyan(installStr)}` ).start();
      if(exec(`cd ${targetDir} && ${installStr}`).code === 0){
        installSpinner.stop();
        console.log(`🎉  Successfully created project ${chalk.yellow(name)}.`);
        console.log('👉  Get started with the following commands:\n');
        console.log(chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`));
        console.log(chalk.cyan(` ${chalk.gray('$')} npm run serve`));
      }
    }else{
      process.exit(1);
    }
  }else{
    process.exit(1);
  }
}


module.exports = function (...args) {
  return run(...args).then().catch(err => {
    console.log(err);
    process.exit(1);
  });

};