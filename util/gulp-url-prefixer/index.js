let gutil = require('gulp-util');
let path = require('path');
let through = require('through2');
let PLUGIN_NAME = 'gulp-url-prefixer';

let default_conf = {
  tags: ['script', 'link', 'a', 'img', 'embed'],
  attrs: ['src', 'href'],
  prefix: 'http://localhost/',
  placeholderFuncName: '__uri'
};

let config = {};

let processConf = function (conf) {
  Object.keys(default_conf).forEach(function (key) {
    config[key] = conf[key] || default_conf[key];
  });
};

let buildHtmlTagRegex = function () {
  let tags = config.tags;
  return new RegExp('<\\s*(' + tags.join('|') + ')[\\s\\S]*?>', 'g');
};

let buildHtmlAttrRegex = function () {
  let attrs = config.attrs;
  return new RegExp('(' + attrs.join('|') + ')=([\'"]?)([\\s\\S]*?)(\\?[\\s\\S]*?)?\\2', 'g');
};

let buildCssRegex = function () {
  return /url\((['"])?([\s\S]+?)(\?[\s\S]*?)?\1\)/g;
};

let buildJsRegex = function () {
  return new RegExp(config.placeholderFuncName + '\\s*\\(\\s*([\'"])([\\s\\S]+?)(\\?[\\s\\S]*?)?\\1([\\s\\S]*?)\\)', 'g');
};

let buildUrl = function (file, url, prefix) {
  if (url.charAt(0) === '/') {
    url = url.substring(1);
  } else {
    url = path.join(path.dirname(file.relative), url);
  }

  url = path.normalize(url);

  if (prefix.charAt(prefix.length - 1) !== '/') {
    prefix += '/';
  }

  url = prefix + url;

  if (process.platform === 'win32') {
    url = url.replace(/\\+/g, '/');
  }

  return url;
};

let autoHtmlUrl = function (file, tagReg, attrReg) {
  let prefix = config.prefix;
  let contents = file.contents.toString().replace(tagReg, function (match, tagName) {
    return match.replace(attrReg, function (__, attrName, delimiter, url, search) {
      if (url.indexOf(':') === -1 && /[\w\/\.]/.test(url.charAt(0))) {
        url = buildUrl(file, url, typeof prefix === 'function' ? prefix(url) : prefix);
        delimiter = delimiter || '';
        search = search || '';
        return attrName + '=' + delimiter + url + search + delimiter;
      } else {
        return __;
      }
    });
  });
  file.contents = new Buffer(contents);
};

let autoCssUrl = function (file, reg) {
  let prefix = config.prefix;
  let contents = file.contents.toString().replace(reg, function (match, delimiter, url, search) {
    if (url.indexOf(':') === -1 && /[\w\/\.]/.test(url.charAt(0))) {
      delimiter = delimiter || '';
      search = search || '';
      url = buildUrl(file, url, typeof prefix === 'function' ? prefix(url) : prefix);
      return 'url(' + delimiter + url + search + delimiter + ')';
    } else {
      return match;
    }
  });
  file.contents = new Buffer(contents);
};

let autoJsUrl = function (file, reg) {
  let prefix = config.prefix;

  let contents = file.contents.toString().replace(reg, function (match, delimiter, url, search, appendix) {
    if (url.indexOf(':') === -1) {
      delimiter = delimiter || '';
      search = search || '';
      appendix = appendix || '';

      url = buildUrl(file, url, typeof prefix === 'function' ? prefix(url) : prefix);
      url = delimiter + url + search + delimiter + appendix;
      return url;
    } else {
      return match;
    }
  });

  file.contents = new Buffer(contents);
};

exports.js = function (conf) {
  processConf(conf);
  let reg = buildJsRegex();
  return through.obj(function (file, encoding, cb) {
    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    autoJsUrl(file, reg);
    cb(null, file);
  });
};

exports.css = function (conf) {
  processConf(conf);
  let reg = buildCssRegex();
  return through.obj(function (file, encoding, cb) {
    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    autoCssUrl(file, reg);
    cb(null, file);
  });
};

exports.html = function (conf) {
  processConf(conf);
  let tagReg = buildHtmlTagRegex();
  let attrReg = buildHtmlAttrRegex();
  return through.obj(function (file, encoding, cb) {
    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    autoHtmlUrl(file, tagReg, attrReg);
    cb(null, file);
  });
};

