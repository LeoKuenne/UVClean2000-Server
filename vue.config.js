const path = require('path');

module.exports = {
  // outputDir: path.resolve(__dirname, './server/dashboard/dist'),
  // assetsDir: '../static',
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].server = `${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}`;
        return args;
      });
  },
  configureWebpack: {
    externals: {
      moment: 'moment',
    },
  },
};
