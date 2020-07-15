#!/usr/bin/env node
const program = require('commander');
const cleanArgs = require('../util/cleanArgs');

program
  .command('publish [project-path]')
  .description('打包部署项目')
  .option('--env <env>', '指定的打包环境 [ staging,staging1,staging2,staging3,staging4,preview,production]')
  .action(function(project, cmd){
    require('../lib/publish')(project, cleanArgs(cmd));
  });

program.parse(process.argv);