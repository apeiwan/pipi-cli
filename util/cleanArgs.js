/**
 * 格式化 commander 参数
 * @link  https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli/bin/vue.js#L275
 * @param str
 * @returns {*}
 */
function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
module.exports = function(cmd) {
  const args = {};
  // console.warn('cmd.options:::',cmd.options)
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''));
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
  });
  return args;
};