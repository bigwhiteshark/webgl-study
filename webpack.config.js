const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, './'),
    entry: [
        'babel-polyfill',
        'webpack-dev-server/client?http://localhost:8080',
        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint
        'webpack/hot/only-dev-server',
        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
        './index.js'
        // the entry point of our app
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [ {
                test: /\.(glsl|vs|fs)$/,
                loader: 'shader-loader'
            },
            {
                test: /\.css$/,
                /*loader: ExtractTextPlugin.extract({
                     fallback: 'style-loader',
                     use: "css-loader"
                })*/
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader",
                    options: {
                        modules: true
                    }
                }]
            }, {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: '/node_modules/',
                options: {
                    presets: ['es2015']
                }
            }, {
                test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                exclude: '/node_modules/',
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }]
            }

        ]
    },
    devServer: {
        historyApiFallback: true,

        inline: true,

        contentBase: path.resolve(__dirname, 'dist'),
        // match the output path

        publicPath: '/',
        // match the output `publicPath`

        https: false
    },
    devtool: "eval-source-map",
    resolve: {
        extensions: [
            '.js',
            '.jsx',
            '.less',
            '.css',
            '.html'
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            title: "webgl study",
            desc: "webgl study",
            inject: 'body',
            hash: true
        }),
        // new ExtractTextPlugin({
        //      filename: '[name].bundle.css',
        //      allChunks: true,
        // }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'commons.js',
            minChunks: 2,
        }),

    ]
};
