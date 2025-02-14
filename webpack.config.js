const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "production",
  entry: "./_resouce/main.js",
  output: {
    path: __dirname + "/dist",
    filename: "app.js"
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            name: "./dist/img/icon/[name].[ext]"
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      mapboxgl: "mapbox-gl"
    }),
    new Dotenv()
  ],
  devServer: {
    contentBase: __dirname + "/dist",
    publicPath: "/",
    watchContentBase: true,
    open: true
  }
};
