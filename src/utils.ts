import { execSync } from 'child_process';
import type { PluginOptions } from './type';
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import md5 from 'md5';
import { 
  DIRECTORY_NAME, 
  INJECT_STYLE_FILE_NAME, 
  INJECT_SCRIPT_FILE_NAME, 
  INJECT_SCRIPT_ID 
} from './constant';

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

export function getFileHash(fileString: string) {
  return md5(fileString).slice(0, 8)
}

/**
 * Get the current directory name
 * @returns current __dirname
 */
export function get__Dirname() {
  try {
    if (import.meta && import.meta.url)
      return dirname(fileURLToPath(import.meta.url))

    return __dirname
  }
  catch (err) {
    console.error(err)
    return __dirname
  }
}


export function injectPluginHtml(
  html: string,
  version: string,
  options: PluginOptions,
  { cssFileHash, jsFileHash }: { jsFileHash: string; cssFileHash: string },
) {
  const { publicUrl = '/' } = options

  const cssLinkHtml = `<link rel="stylesheet" href="${publicUrl}${DIRECTORY_NAME}/${INJECT_STYLE_FILE_NAME}.${cssFileHash}.css">`
  let res = html

  res = res.replace(
    '<head>',
    `<head>
    ${cssLinkHtml}
    <script id="${INJECT_SCRIPT_ID}" data-v="${version}" src="${publicUrl}${DIRECTORY_NAME}/${INJECT_SCRIPT_FILE_NAME}.${jsFileHash}.js"></script>`,
  )

  return res
}