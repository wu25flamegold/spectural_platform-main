const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/tmapi',
        createProxyMiddleware({
          target: 'http://xds3.cmbm.idv.tw:81',
          changeOrigin: true,
        })
      );
      app.use(
        '/api',
        createProxyMiddleware({
          target: 'http://xds3.cmbm.idv.tw:81',
          changeOrigin: true,
        })
      );
};
