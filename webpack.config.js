const path = require('path')
const HtmlWebpackPlugin =  require("html-webpack-plugin")

const htmlPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname,'./src/index.html'),
    filename: "index.html"
})


module.exports = {
    mode: "development",//development production
    //在webpack4中默认额入口文件是src中的src => index.js
    plugins: [
        htmlPlugin
    ],
    module: {
        rules: [
            {test: /\.js|jsx$/,use: "babel-loader",exclude: /node_modules/},
            {test: /\.css$/,use: ["style-loader","css-loader"] }, //localIdentName
            {test:/\.scss$/,use: ["style-loader","css-loader","sass-loader"]}
        ]
    },
    resolve:{
        extensions: ['.js','.json','.jsx'],
        alias: {
            '@': path.join(__dirname,'./src')
        }
    },
}