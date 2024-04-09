const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "src/index.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "pico-ml": path.resolve(__dirname, "../core/src/index.ts"),
    },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, loader: "ts-loader", options: { transpileOnly: true } },
      {
        test: /\.css$/,
        exclude: [/node_modules/, /src\/styles/],
        include: /src\/components/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
              },
            },
          },
          { loader: "postcss-loader" },
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/, /src\/styles/],
        exclude: /src\/components/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: {
              modules: false,
            },
          },
          { loader: "postcss-loader" },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new HtmlWebpackPlugin({ template: "index.html" })],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  devServer: {
    port: 4001,
  },
};
