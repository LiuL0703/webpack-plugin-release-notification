import { accessSync, constants, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { PluginOptions } from './type';
import type { Compilation, Compiler } from 'webpack';
import { 
  getVersion,
  generateVersionJSONFileContent, 
  generateInjectJsFileContent,
} from './utils';
import { DIRECTORY_NAME, JSON_FILE_NAME, INJECT_SCRIPT_FILE_NAME } from './constant';

class ReleaseNotificationPlugin {
  options: PluginOptions
  constructor(options: PluginOptions) {
    this.options = options || {}
  }
  apply(compiler: Compiler) {
    const { publicPath } = compiler.options.output;
    if (!this.options.publicUrl) {
      this.options.publicUrl = typeof publicPath === 'string' ? publicPath : '/';
    }
    const version = getVersion();

    compiler.hooks.emit.tap('ReleaseNotificationPlugin', (compilation: Compilation) => {
      const versionJSONFileContent = generateVersionJSONFileContent(version)
      // @ts-expect-error
      compilation.assets[`${DIRECTORY_NAME}/${JSON_FILE_NAME}.json`] = {
        source: () => versionJSONFileContent,
        size: () => versionJSONFileContent.length,
      }

      const filePath = resolve(`${__dirname}/${INJECT_SCRIPT_FILE_NAME}.js`)
      const injectScriptContent = generateInjectJsFileContent(
        readFileSync(filePath, 'utf8').toString(),
        version,
        this.options,
      )
    });
    compiler.hooks.afterEmit.tap('ReleaseNotificationPlugin', (compilation: Compilation) => {
      console.log('ReleaseNotificationPlugin afterEmit', { compilation });
    });
  }
}

export { ReleaseNotificationPlugin };