module.exports = {
  name: '皮皮h5 cli 工具',
  git:'', // git 地址
  language: '', // 语言类型  vue/none/oss/all
  // 测试服务器1
  staging: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线1',
    type: 'build',
    dist: 'staging',
    author: true,
    env: 'staging',
    server: '',
    bucket: 't-h5-public',
    oss: true
  },
  // 测试服务器2
  staging2: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线2',
    type: 'build',
    dist: 'staging2',
    author: true,
    env: 'staging2',
    server: '',
    bucket: 't2-h5-public',
    oss: true
  },
  // 测试服务器3
  staging3: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线3',
    type: 'build',
    dist: 'staging3',
    author: true,
    env: 'staging3',
    server: '',
    bucket: 't3-h5-public',
    oss: true
  },
  // 测试服务器4
  staging4: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线4',
    type: 'build',
    dist: 'staging4',
    author: true,
    env: 'staging4',
    server: '',
    bucket: 't4-h5-public',
    oss: true
  },
  // 测试服务器6
  staging5: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线5',
    type: 'build',
    dist: 'staging5',
    author: true,
    env: 'staging5',
    server: '',
    bucket: 't5-h5-public',
    oss: true
  },
  // 测试服务器6
  staging6: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线6',
    type: 'build',
    dist: 'staging6',
    author: true,
    env: 'staging6',
    server: '',
    bucket: 't6-h5-public',
    oss: true
  },
  // 测试服务器7
  staging7: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线7',
    type: 'build',
    dist: 'staging7',
    author: true,
    env: 'staging7',
    server: '',
    bucket: 't7-h5-public',
    oss: true
  },
  // 测试服务器8
  staging8: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线8',
    type: 'build',
    dist: 'staging8',
    author: true,
    env: 'staging8',
    server: '',
    bucket: 't8-h5-public',
    oss: true
  },
  // 测试服务器9
  staging9: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线9',
    type: 'build',
    dist: 'staging9',
    author: true,
    env: 'staging9',
    server: '',
    bucket: 't9-h5-public',
    oss: true
  },
  // 测试服务器9
  staging10: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: '部署应用-测试线10',
    type: 'build',
    dist: 'staging10',
    author: true,
    env: 'staging10',
    server: '',
    bucket: 't10-h5-public',
    oss: true
  },
  // 预发布
  preview: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode preview",
    name: '部署应用-预发布',
    type: 'build',
    dist: 'preview',
    author: true,
    env: 'preview',
    server: '',
    bucket: 'pre-h5-public',
    oss: true
  },
  // 生产环境
  production: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode production",
    name: '部署应用-正式线',
    type: 'build',
    author: false,
    dist: 'bundle',
    env: 'production',
    server: '',
    bucket: 'h5-public',
    oss: true
  }
};
