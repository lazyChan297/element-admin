'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const compressionWebpackConfig = require('compression-webpack-plugin')
function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Element Admin' // page title
// 定义压缩文件类型
const productionGzipExtensions = ['js', 'css']
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 9527 // dev port
console.log(process.env.NODE_ENV)
// All configuration item explanations can be find in https://cli.vuejs.org/config/
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
    // after: require('./mock/mock-server.js')
  },
  configureWebpack: config => {
    config.name = name
    config.resolve.alias['@'] = resolve('src')
    config.performance = {
      hints: 'warning',
      //入口起点的最大体积 整数类型（以字节为单位）
      maxEntrypointSize: 50000000,
      //生成文件的最大体积 整数类型（以字节为单位 300k）
      maxAssetSize: 30000000,
      //只给出 js 文件的性能提示
      assetFilter: function(assetFilename) {
        return assetFilename.endsWith('.js')
      }
    }
    if (process.env.NODE_ENV === 'production') {
      // 编译时删除console.log
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      //  配置productionGzip-高级的方式
      // 配置参数详解
      // asset： 目标资源名称。 [file] 会被替换成原始资源。[path] 会被替换成原始资源的路径， [query] 会被替换成查询字符串。默认值是 "[path].gz[query]"。
      // algorithm： 可以是 function(buf, callback) 或者字符串。对于字符串来说依照 zlib 的算法(或者 zopfli 的算法)。默认值是 "gzip"。
      // test： 所有匹配该正则的资源都会被处理。默认值是全部资源。
      // threshold： 只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
      // minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
      config.plugins.push(
        new compressionWebpackConfig({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])
    config.plugin('mini-css-extract-plugin')
      .use(require('mini-css-extract-plugin'), [
        {
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].css'
        }
      ])
    .end()
    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch').delete("preload")

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

          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
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
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
