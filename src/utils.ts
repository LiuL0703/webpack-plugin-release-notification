import { execSync } from 'child_process';
import type { PluginOptions } from './type';

export const getVersion = (): string => {
  try {
    return execSync('git rev-parse --short HEAD').toString().replace('\n', '').trim()
  }
  catch (err) {
    console.error(err)
    return `${Date.now()}_${Math.random().toString(36).slice(-6)}`
  }
}


export function generateVersionJSONFileContent(version: string) {
  return JSON.stringify(version, null, 2)
}

export function generateInjectJsFileContent(jsFileContent: string, version: string, options: PluginOptions) {
  return `${jsFileContent}
    window.__checkUpdate__(${JSON.stringify(options)});
  `
}