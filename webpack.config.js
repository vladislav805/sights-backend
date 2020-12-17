const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const {
    NODE_ENV = 'development',
} = process.env;

const BUILD_DIR = 'dist';

module.exports = {
    entry: path.resolve('src', 'index.ts'),

    mode: NODE_ENV,

    target: 'node',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },

    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.mjs',
        ],
        modules: [
            path.resolve('node_modules')
        ],
    },

    output: {
        filename: 'index.js',
        path: path.resolve(BUILD_DIR),
        libraryTarget: 'commonjs',
    },

    externals: fs.readdirSync('node_modules')
        .filter(x => ['.bin'].indexOf(x) === -1)
        .forEach((acc, mod) => {
            acc[mod] = 'commonjs ' + mod;
            return acc;
        }, {}),

    devtool: 'source-map',

    stats: 'errors-only',

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: path.resolve('package-lock.json'), to: path.resolve(BUILD_DIR, 'package-lock.json'), },
                { from: path.resolve('package.json'), to: path.resolve(BUILD_DIR, 'package.json'), },
            ],
        }),
    ],
};
