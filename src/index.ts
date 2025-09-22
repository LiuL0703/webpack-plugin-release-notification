import { accessSync, constants, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { PluginOptions } from './type';
import type { Compilation, Compiler } from 'webpack';
import { 
  getVersion,
  generateVersionJSONFileContent, 
  generateInjectJsFileContent,
  get__Dirname,
  getFileHash,
  injectPluginHtml,
} from './utils';
import { 
  DIRECTORY_NAME, 
  JSON_FILE_NAME, 
  INJECT_SCRIPT_FILE_NAME,
  INJECT_STYLE_FILE_NAME

 } from './constant';

class ReleaseNotificationPlugin {
  options: PluginOptions
  constructor(options: PluginOptions) {
    this.options = options || {}
  }
  apply(compiler: Compiler) {
    let jsFileHash = ''
    let cssFileHash = ''
    const { publicPath } = compiler.options.output;
    if (!this.options.publicUrl) {
      this.options.publicUrl = typeof publicPath === 'string' ? publicPath : '/';
    }
    const version = getVersion();
    // 生成 包含version的json文件 
    // checkupdate的js 
    // 样式
    // 将这些文件同步到打包文件内
    compiler.hooks.emit.tap('ReleaseNotificationPlugin', (compilation: Compilation) => {
      const versionJSONFileContent = generateVersionJSONFileContent(version)
      // @ts-expect-error 写入包含version的json
      compilation.assets[`${DIRECTORY_NAME}/${JSON_FILE_NAME}.json`] = {
        source: () => versionJSONFileContent,
        size: () => versionJSONFileContent.length,
      }

      const injectStyleContent = readFileSync(`${get__Dirname()}/${INJECT_STYLE_FILE_NAME}.css`, 'utf-8')
      cssFileHash = getFileHash(injectStyleContent)
      // @ts-expect-error 处理提示弹窗的css
      compilation.assets[`${DIRECTORY_NAME}/${INJECT_STYLE_FILE_NAME}.${cssFileHash}.css`] = {
        source: () => injectStyleContent,
        size: () => injectStyleContent.length,
      }

      const filePath = resolve(`${__dirname}/${INJECT_SCRIPT_FILE_NAME}.js`)
      const injectScriptContent = generateInjectJsFileContent(
        readFileSync(filePath, 'utf8').toString(),
        version,
        this.options,
      )
      jsFileHash = getFileHash(injectScriptContent)

      // @ts-expect-error 写入checkupdate的js
      compilation.assets[`${DIRECTORY_NAME}/${INJECT_SCRIPT_FILE_NAME}.${jsFileHash}.js`] = {
        source: () => injectScriptContent,
        size: () => injectScriptContent.length,
      }
    });
    // 将生成的js和css插入到html中，并执行checkupdate方法
    compiler.hooks.afterEmit.tap('ReleaseNotificationPlugin', () => {
      const htmlFilePath = resolve(compiler.outputPath, './index.html');
      try {
        accessSync(htmlFilePath, constants.F_OK)

        let html = readFileSync(htmlFilePath, 'utf8')
        html = injectPluginHtml(
          html,
          version,
          this.options,
          {
            jsFileHash,
            cssFileHash,
          },
        )
        writeFileSync(htmlFilePath, html)
      } catch (err) {
        console.error(err)
      }
    });
  }
}

export { ReleaseNotificationPlugin };