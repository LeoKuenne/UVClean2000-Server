module.exports = {
  configureWebpack: {
    externals: {
      moment: 'moment',
    },
    devServer: {
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
  },
  outputDir: 'server/ExpressServer/sites/',
  assetsDir: 'static',
  indexPath: 'ui',
  // publicPath: '/',
  pages: {
    managment: {
      entry: 'website/pages/managment/main.js',
      template: 'website/public/index.html',
      filename: 'managment.html',
      title: 'UVClean Managment',
      server: `${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}`,
    },
    login: {
      entry: 'website/pages/login/main.js',
      template: 'website/public/index.html',
      filename: 'login.html',
      title: 'UVClean login',
      server: `${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}`,
    },
  },
  // chainWebpack: (config) => {
  //   config
  //     .plugin('html')
  //     .tap((args) => {
  //       args[0].server = `${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}`;
  //       return args;
  //     });
  // },
  // configureWebpack: {
  //   externals: {
  //     moment: 'moment',
  //   },
  // },
};
