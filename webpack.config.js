const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());


module.exports = {
  entry: path.resolve(appDirectory, "src/app.ts"),
  output: {
    filename: 'js/coolBabylon.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devServer: {    //Dev Server location
    host: "0.0.0.0",
    port: 8080,
    disableHostCheck: true,
    contentBase: path.resolve(appDirectory, "public"),
    publicPath: "/",
    hot: true
  },
  module: {     //Need to lookup how this works in webPack
    rules: [{
      test: /.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  plugins:[     //What are plugins? why are plugins?
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(appDirectory, "public/index.html")
    }),
    new CleanWebpackPlugin()
  ],
  mode: "development"
};