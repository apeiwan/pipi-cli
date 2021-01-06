const childProcess = require('child_process');
const path = require('path');
const find = require('lodash.find');

// 得到完整的分支名称
function getFormatBranchName(branch) {
  branch = branch.toString();
  return branch.replace(/\s+/g, '').replace(/\*+/g, '');
}

// 获取当前分支名称
let getCurrentBranceName = function () {
  let gitAllBranchExec = childProcess.execSync('git branch -a').toString().split('\n');
  for (let i = 0; i < gitAllBranchExec.length; i++) {
    let branchStr = gitAllBranchExec[i];
    if (branchStr !== '') {
      if (branchStr.indexOf('*') !== -1) {
        return branchStr.replace('* ', '');
      }
    }
  }
};


// 检测当前分支是否有未提交文件
let checkBranceCommitFile = function () {
  let gitAllBranchExec = childProcess.execSync('git status').toString().split('\n');
  for (let i = 0; i < gitAllBranchExec.length; i++) {
    let branchStr = gitAllBranchExec[i];
    if (branchStr.indexOf('nothing to commit') !== -1 || branchStr.indexOf('无文件要提交，干净的工作区') !== -1) {
      return true;
    }
  }
  return false;
};

let crossEnv = function (key, value) {
  return ((process.platform === 'darwin' || process.platform === 'linux') ? 'export' : 'set') + ' ' + key + '=' + value;
};

// 检测远程所有tag标签是否已存在本地
let isExitsTag = function (version) {
  let remoteBranchAll = [];
  let BranchExec = childProcess.execSync('git tag -l').toString().split('\n');
  for (let i = 0; i < BranchExec.length; i++) {
    let branchStr = BranchExec[i];
    if (branchStr !== '' && branchStr.indexOf('_source') !== -1) {
      remoteBranchAll.push(getFormatBranchName(branchStr));
    }
  }
  return find(remoteBranchAll, item => item === 'v' + version + '_source') !== undefined;
};

let resolve = function (dir) {
  return path.join(__dirname, '.', dir);
};

module.exports = {
  getCurrentBranceName,
  checkBranceCommitFile,
  isExitsTag,
  resolve,
  crossEnv
};
