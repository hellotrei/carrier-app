module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['react-native/Libraries/*'],
      },
    ],
  },
};
