const proxy = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    proxy('/api', {
      target: 'http://localhost:8888',
      changeOrigin: true,
      pathRewrite(path) {
        return path.replace('/api', '');
    }
    })
  )
}