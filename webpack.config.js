const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = ({ NODE_ENV }) => {
  require("dotenv").config({
    path: NODE_ENV == "production" ? ".env.production" : ".env",
  });

  return {
    entry: "./src/index.js",
    mode: NODE_ENV,
    output: {
      filename: `[contenthash].bundle.js`,
      path: path.resolve(__dirname, "./dist"),
      publicPath: `/`,
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        // NOTE: Remove the '/' from the end (if any)
        publicPath: `${process.env.APP_PATH.replace(/\/$/, "")}/`,
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "src"),
      port: 8080,
      open: true,
      hot: true,
      // Source: https://stackoverflow.com/a/50179280
      historyApiFallback: {
        index: "/",
      },
    },
  };
};
