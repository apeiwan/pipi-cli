var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
module.exports = [
  autoprefixer({
    overrideBrowserslist: [
      'iOS >= 8',
      'Android >= 4.4',
      'last 3 versions',
    ]
  }),
  cssnano
];
