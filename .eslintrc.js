module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended'
  ],
  rules: {
    indent: [2, 2],
    'object-curly-spacing': [2, 'always'],
    'no-const-assign': 2,
    camelcase: [2, { properties: 'never' }],
    'comma-dangle': 0,
    'quote-props': [2, 'as-needed'],
    quotes: [1, 'single'],
    'space-infix-ops': 2,
    'no-multiple-empty-lines': 2,
    'prefer-arrow-callback': 0,
    'func-names': 0,
    'object-shorthand': 0,
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  globals: {
    FLPPDeviceInfo: false,
    PPJSBridge: false,
    Sentry: false,
    html2canvas: false,
    QRCode: false,
    Swiper: false,
  },
};
