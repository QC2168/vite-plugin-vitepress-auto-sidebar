import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { type DefaultTheme } from 'vitepress';
import { type Plugin, type ViteDevServer } from 'vite';
import type { SidebarPluginOptionType, UserConfig } from './types';

import { DEFAULT_IGNORE_FOLDER, log, removePrefix } from './utils';

let option: SidebarPluginOptionType;

function createSideBarItems (
  targetPath: string,
  ...reset: string[]
): DefaultTheme.SidebarItem[] {
  const { ignoreIndexItem, deletePrefix, collapsed = false, sideBarItemsResolved, beforeCreateSideBarItems } = option;
  const rawNode = readdirSync(join(targetPath, ...reset));
  const node = beforeCreateSideBarItems?.(rawNode) ?? rawNode;
  if (ignoreIndexItem && node.length === 1 && node[0] === 'index.md') {
    return [];
  }
  const result: DefaultTheme.SidebarItem[] = [];
  for (const fname of node) {
    if (statSync(join(targetPath, ...reset, fname)).isDirectory()) {
      // is directory
      // ignore cur node if items length is 0
      const items = createSideBarItems(
        join(targetPath),
        ...reset,
        fname
      );
      // replace directory name, if yes
      let text = fname;

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
      if (ignoreIndexItem && fname === 'index.md' || /^-.*\.(md|MD)$/.test(fname)) {
        continue;
      }
      const fileName = fname.replace(/\.md$/, '');
      let text = fileName;
      if (deletePrefix) {
        text = removePrefix(text, deletePrefix);
      }

      const item: DefaultTheme.SidebarItem = {
        text,
        link: '/' + [...reset, `${fileName}.html`].join('/')
      };
      result.push(item);
    }
  }
  return sideBarItemsResolved?.(result) ?? result;
}

function createSideBarGroups (
  targetPath: string,
  folder: string
): DefaultTheme.SidebarItem[] {
  return [
    {
      items: createSideBarItems(targetPath, folder)
    }
  ];
}

function createSidebarMulti (
  path: string
): DefaultTheme.SidebarMulti {
  const { ignoreList = [], ignoreIndexItem = false, sideBarResolved } = option;
  const il = [...DEFAULT_IGNORE_FOLDER, ...ignoreList];
  const data: DefaultTheme.SidebarMulti = {};
  const node = readdirSync(path).filter(
    (n) => statSync(join(path, n)).isDirectory() && !il.includes(n)
  );

  for (const k of node) {
    data[`/${k}/`] = createSideBarGroups(path, k);
  }

  // is ignored only index.md
  if (ignoreIndexItem) {
    for (const i in data) {
      let obj = data[i];
      obj = obj.filter((i) => (i.items != null) && i.items.length > 0);
      if (obj.length === 0) {
        Reflect.deleteProperty(data, i);
      }
    }
  }

  return sideBarResolved?.(data) ?? data;
}

export default function VitePluginVitePressAutoSidebar (
  opt: SidebarPluginOptionType = {}
): Plugin {
  return {
    name: 'vite-plugin-vitepress-auto-sidebar',
    configureServer ({ watcher, restart }: ViteDevServer) {
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
    config (config) {
      option = opt;
      const { path = '/docs' } = option;
      // increment ignore item
      const docsPath = join(process.cwd(), path);
      // create sidebar data and insert
      (config as UserConfig).vitepress.site.themeConfig.sidebar = createSidebarMulti(docsPath);
      log('injected sidebar data successfully');
      return config;
    }
  };
}
