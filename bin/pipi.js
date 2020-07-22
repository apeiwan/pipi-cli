#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const cleanArgs = require('../util/cleanArgs');
const config = require('../util/config');

program
  .version(`@pipi/cli ${require('../package').version}`)
  .usage('<command> [options]');

program
  .command('publish [project-path]')
  .description('项目部署')
  .option('--env <env>', `指定的打包环境 [${config.BUILD_ENV.join(' ')}]`)
  .action(function(project, cmd){
    require('../lib/publish')(project, cleanArgs(cmd));
  });

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(`  Run ${chalk.cyan('pipi <command> --help')} for detailed usage of given command.`);
  console.log();
});

program.commands.forEach(c => c.on('--help', () => console.log()));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}