module.exports = {
  name: "皮皮h5 cli 工具",
  git:'', // git 地址
  language: "", // 语言类型  vue/none/oss/all
  // 测试服务器1
  staging: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: "部署应用-测试线1",
    type: 'build',
    dist: "staging",
    author: true,
    env: "staging",
    server: "",
    bucket: "t-h5-public",
    oss: true
  },
  // 测试服务器2
  staging2: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: "部署应用-测试线2",
    type: 'build',
    dist: "staging2",
    author: true,
    env: "staging2",
    server: "",
    bucket: "t2-h5-public",
    oss: true
  },
  // 测试服务器3
  staging3: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: "部署应用-测试线3",
    type: 'build',
    dist: "staging3",
    author: true,
    env: "staging3",
    server: "",
    bucket: "t3-h5-public",
    oss: true
  },
  // 测试服务器4
  staging4: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode staging",
    name: "部署应用-测试线4",
    type: 'build',
    dist: "staging4",
    author: true,
    env: "staging4",
    server: "",
    bucket: "t4-h5-public",
    oss: true
  },
  preview: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode preview",
    name: "部署应用-预发布",
    type: 'build',
    dist: "preview",
    author: true,
    env: "preview",
    server: "",
    bucket: "pre-h5-public",
    oss: true
  },
  production: {
    // build: "cross-env NODE_ENV=production vue-cli-service build --mode production",
    name: "部署应用-正式线",
    type: 'build',
    author: false,
    dist: "bundle",
    env: "production",
    server: "",
    bucket: "h5-public",
    oss: true
  }
};
