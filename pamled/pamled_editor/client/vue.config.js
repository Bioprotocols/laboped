const path = require("path");

module.exports = {
  publicPath: process.env.VUE_APP_STATIC_URL,
  outputDir: path.resolve(__dirname, "../static", "pamled"),
  indexPath: path.resolve(__dirname, "../templates/", "pamled", "index.html"),
  devServer: {
    before: (app) => {
      app.set('etag', 'strong');
      app.use((req, res, next) => {
        res.set('Cache-Control', 'must-revalidate');
        next();
      });
    },
  },
};
