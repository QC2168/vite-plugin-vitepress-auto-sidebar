import c from 'picocolors';

export const DEFAULT_IGNORE_FOLDER = ['scripts', 'components', 'assets', '.vitepress'];
export function log (...info: string[]): void {
  console.log(c.bold(c.cyan('[auto-sidebar]')), ...info);
}

// remove the file prefix
export function removePrefix (str: string, identifier: string | RegExp): string {
  return str.replace(identifier, '');
}
