var child_process = require('child_process');
var path = require('path');
const find = require('lodash.find');

// 得到完整的分支名称
function getFormatBranchName(branch) {
  branch = branch.toString();
  return branch.replace(/\s+/g, '').replace(/\*+/g, '')
}

// 获取当前分支名称
let getCurrentBranceName = function () {
  var git_all_branch_exec = child_process.execSync('git branch -a').toString().split('\n');
  for (var i = 0; i < git_all_branch_exec.length; i++) {
    var _item_branch_str = git_all_branch_exec[i];
    if (_item_branch_str !== '') {
      if (_item_branch_str.indexOf('*') !== -1) {
        return _item_branch_str.replace('* ', '');
      }
    }
  }
};


// 检测当前分支是否有未提交文件
let checkBranceCommitFile = function () {
  var git_all_branch_exec = child_process.execSync('git status').toString().split('\n');
  for (var i = 0; i < git_all_branch_exec.length; i++) {
    var _item_branch_str = git_all_branch_exec[i];
    if (_item_branch_str.indexOf('nothing to commit') !== -1 || _item_branch_str.indexOf('无文件要提交，干净的工作区') !== -1) {
      return true;
    }
  }
  return false;
};

let crossEnv = function (key, value) {
  return (process.platform === 'darwin' ? 'export' : 'set') + ' ' + key + '=' + value
};

// 检测远程所有tag标签是否已存在本地
let isExitsTag = function (version) {
  var remote_git_branch_all = [];
  var git_all_branch_exec = child_process.execSync('git tag -l').toString().split('\n');
  for (var i = 0; i < git_all_branch_exec.length; i++) {
    var _item_branch_str = git_all_branch_exec[i];
    if (_item_branch_str !== '' && _item_branch_str.indexOf('_source') !== -1) {
      remote_git_branch_all.push(getFormatBranchName(_item_branch_str))
    }
  }
  return find(remote_git_branch_all, item => item === 'v' + version + '_source') !== undefined
};

let resolve = function (dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
  getCurrentBranceName,
  checkBranceCommitFile,
  isExitsTag,
  resolve,
  crossEnv
};