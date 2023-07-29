import c from 'picocolors';
import { existsSync, readFileSync } from 'fs';

export const DEFAULT_IGNORE_FOLDER = ['scripts', 'components', 'assets', '.vitepress'];
export function log (...info: string[]): void {
  console.log(c.bold(c.cyan('[auto-sidebar]')), ...info);
}

// remove the file prefix
export function removePrefix (str: string, identifier: string | RegExp): string {
  return str.replace(identifier, '');
}

// 尝试从一个md文件中读取标题，读取到第一个 ‘# 标题内容’ 的时候返回这一行
export function getTitleFromFile (realFileName: string): string | undefined {
  if (!existsSync(realFileName)) {
    return undefined;
  }
  const fileExtension = realFileName.substring(
    realFileName.lastIndexOf('.') + 1
  );
  if (fileExtension !== 'md' && fileExtension !== 'MD') {
    return undefined;
  }
  // read contents of the file
  const data = readFileSync(realFileName, { encoding: 'utf-8' });
  // split the contents by new line
  const lines = data.split(/\r?\n/);
  // return title
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2);
    }
  }
  return undefined;
}
