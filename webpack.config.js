/**
 *  TODO: check ts-loader with a simple project, so we
 *  can do everything in one pass
 */


var path = require('path');

module.exports = {
// Change to your "entry-point".
    entry: './src/index',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devServer: {
        contentBase: './'
    },
    module: {
        rules: [{
// Include ts, tsx, and js files.
            test: /\.(tsx?)|(js)$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    devtool: 'eval-source-map',
    mode: 'development'
};