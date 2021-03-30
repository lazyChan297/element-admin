'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const compressionWebpackConfig = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Element Admin' // web标题
const productionGzipExtensions = ['js', 'css'] // 定义压缩文件类型
const port = process.env.port || process.env.npm_config_port || 9527 // dev port

const externals = {
  'vue': 'Vue',
  'element-ui': 'ELEMENT',
  'vue-router': 'VueRouter',
  'Vuex': 'Vuex',
  'echarts': 'echarts',
  'axios': 'axios'
}

module.exports = {
  publicPath: '.',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/mock': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        pathRewrite: {
          '^/mock': '/'
        }
      }
    },
  },
  configureWebpack: config => {
    config.name = name
    
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 50000000, //入口起点的最大体积 整数类型（以字节为单位）
      maxAssetSize: 30000000, //生成文件的最大体积 整数类型（以字节为单位 300k）
      assetFilter: function(assetFilename) {
        return assetFilename.endsWith('.js') //只给出 js 文件的性能提示
      }
    }
    config.externals = externals // 引用第三方库

    if (process.env.NODE_ENV === 'production') {
      // 编译时删除console.log
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.plugins.push(
        new compressionWebpackConfig({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240, // threshold： 只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
          minRatio: 0.8 // minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
        }),
        // 分析打包文件工具
        new BundleAnalyzerPlugin()
      )
    }
  },
  chainWebpack(config) {
    // process.env.NODE_ENV
    // 打开preload，提高首屏加载速度
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])
    // 将css和js分开打包
    config.plugin('mini-css-extract-plugin')
      .use(require('mini-css-extract-plugin'), [
        {
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].css'
        }
      ])
    .end()
    // 关闭prefetch
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    
    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // 配置别名，减少搜索范围，提高打包速度
          config.resolve.alias
            .set('@', resolve('src'))
            .set('components', resolve('src/components'))
            .set('api', resolve('src/api'))
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                vendor: {
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendors',
                  chunks: 'initial',
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3,
                  priority: 5,
                  reuseExistingChunk: true
                },
                styles: {
                  name: 'styles',
                  test: /\.(sa|sc|c)ss$/,
                  chunks: 'all',
                  enforce: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
