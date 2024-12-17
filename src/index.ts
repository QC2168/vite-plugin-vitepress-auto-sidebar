import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import type { DefaultTheme } from 'vitepress/theme';
import type { Plugin, ViteDevServer } from 'vite';
import type { SidebarPluginOptionType, UserConfig } from './types';

import { DEFAULT_IGNORE_FOLDER, log, removePrefix, extractTitleFn } from './utils';

let option: SidebarPluginOptionType;


function createSideBarItems(
  targetPath: string,
  path: string[],
  recursive = true
): DefaultTheme.SidebarItem[] {
  const {
    ignoreIndexItem,
    deletePrefix,
    collapsed,
    sideBarItemsResolved,
    beforeCreateSideBarItems,
    ignoreList = [],
    titleFromFile = false,
    titleFromFileByYaml = false,
  } = option;
  const rawNode = readdirSync(join(targetPath, ...path));
  const node = beforeCreateSideBarItems?.(rawNode) ?? rawNode;
  const currentDir = join(targetPath, ...path);
  if (ignoreIndexItem && node.length === 1 && node[0] === 'index.md') {
    return [];
  }
  const result: DefaultTheme.SidebarItem[] = [];

  const exec = extractTitleFn({ titleFromFile, titleFromFileByYaml });
  for (const fname of node) {
    if (recursive && statSync(join(targetPath, ...path, fname)).isDirectory()) {
      if (ignoreList.some(item => item === fname || (item instanceof RegExp && item.test(fname)))) {
        continue;
      }
      // is directory
      // ignore cur node if items length is 0
      const items = createSideBarItems(join(targetPath), [...path, fname]);
      // replace directory name, if yes
      let text = fname;
      // get the title in index.md file
      if (exec) {
        const filenames = [
          join(currentDir, fname, 'index.md'),
          join(currentDir, fname, 'index.MD'),
          join(currentDir, fname, fname + '.md')
        ];

        for (const filename of filenames) {
          const title = exec(filename);
          if (title) {
            text = title;
            break;
          }
        }
      }
      if (deletePrefix) {
        text = removePrefix(text, deletePrefix);
      }
      if (items.length > 0) {
        const sidebarItem: DefaultTheme.SidebarItem = {
          text,
          items
        };
        // vitePress sidebar option collapsed
        sidebarItem.collapsed = collapsed;
        result.push(sidebarItem);
      }
    } else {
      // is filed
      if (
        (ignoreIndexItem && fname === 'index.md') ||
        /^-.*\.(md|MD)$/.test(fname) ||
        ignoreList.some(item => item === fname || (item instanceof RegExp && item.test(fname))) ||
        !fname.endsWith('.md')
      ) {
        continue;
      }
      const fileName = fname.replace(/\.md$/, '');
      let text = fileName;
      if (deletePrefix) {
        text = removePrefix(text, deletePrefix);
      }
      const realFileName = join(currentDir, fname);
      if (exec) {
        const title = exec(realFileName);
        if (title) {
          text = title;
        }
      }
      const item: DefaultTheme.SidebarItem = {
        text,
        link: '/' + [...path.filter(Boolean), `${fileName}.html`].join('/')
      };
      result.push(item);
    }
  }
  return sideBarItemsResolved?.(result) ?? result;
}

function createSideBarGroups(
  targetPath: string,
  folder: string,
  recursive = true
): DefaultTheme.SidebarItem[] {
  return [
    {
      items: createSideBarItems(targetPath, [folder], recursive)
    }
  ];
}

function createSidebarMulti(path: string): DefaultTheme.SidebarMulti {
  const {
    ignoreList = [],
    ignoreIndexItem = false,
    sideBarResolved,
    scanRootMdFiles = true
  } = option;
  const il = [...DEFAULT_IGNORE_FOLDER, ...ignoreList];
  const data: DefaultTheme.SidebarMulti = {};
  const node = readdirSync(path).filter(
    (n) => statSync(join(path, n)).isDirectory() && !il.includes(n)
  );

  // all md in root
  if (scanRootMdFiles) {
    data['/'] = createSideBarGroups(path, '', false);
  }

  for (const k of node) {
    data[`/${k}/`] = createSideBarGroups(path, k);
  }

  // is ignored only index.md
  if (ignoreIndexItem) {
    for (const i in data) {
      // eslint-disable-next-line @typescript-eslint/prefer-destructuring
      let obj = data[i];
      if (Array.isArray(obj)) {
        obj = obj.filter((i) => i.items != null && i.items.length > 0);
        if (obj.length === 0) {
          Reflect.deleteProperty(data, i);
        }
      }
    }
  }

  return sideBarResolved?.(data) ?? data;
}

export default function VitePluginVitePressAutoSidebar(
  opt: SidebarPluginOptionType = {}
): Plugin {
  return {
    name: 'vite-plugin-vitepress-auto-sidebar',
    configureServer({
      watcher,
      restart
    }: ViteDevServer) {
      const fsWatcher = watcher.add('*.md');
      fsWatcher.on('all', async (event, path) => {
        if (event !== 'change') {
          log(`${event} ${path}`);
          try {
            await restart();
            log('update sidebar...');
          } catch {
            log(`${event} ${path}`);
            log('update sidebar failed');
          }
        }
      });
    },
    config(config) {
      option = opt;
      const { path = '/docs' } = option;
      // increment ignore item
      const docsPath = join(process.cwd(), path);
      // create sidebar data and insert
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/prefer-destructuring
      const { themeConfig } = (config as UserConfig).vitepress.site;
      themeConfig.sidebar =
        createSidebarMulti(docsPath);
      log('injected sidebar data successfully');
      return config;
    }
  };
}
