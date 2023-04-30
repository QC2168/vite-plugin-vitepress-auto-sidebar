import { join } from "path";
import { readdirSync, statSync, closeSync, openSync, utimesSync, existsSync } from "fs";
import c from "picocolors";
import {type DefaultTheme, type SiteConfig} from "vitepress";
import { type ViteDevServer} from "vite";
import { SidebarPluginOptionType } from "./types";


interface UserConfig {
  vitepress: SiteConfig
}

let configFilePath = '';

function log(...info: string[]) {
  console.log(c.bold(c.cyan("[auto-sidebar]")), ...info);
}

function touch() {
  const time = new Date();

  try {
    utimesSync(configFilePath, time, time);
  } catch (err) {
    closeSync(openSync(configFilePath, "w"));
  }
}

function createSideBarItems(
  targetPath: string,
  option: SidebarPluginOptionType,
  ...reset: string[]
): DefaultTheme.SidebarItem[] {
  const { ignoreIndexItem } = option;
  let node = readdirSync(join(targetPath, ...reset));
  if (ignoreIndexItem && node.length === 1 && node[0] === "index.md") {
    return [];
  }
  const result: DefaultTheme.SidebarItem[] = [];
  for (const fname of node) {
    if (statSync(join(targetPath, ...reset, fname)).isDirectory()) {
      // is directory
      // ignore cur node if items length is 0
      const items = createSideBarItems(
        join(targetPath),
        option,
        ...reset,
        fname
      );
      if (items.length > 0) {
        result.push({
          text: fname,
          items,
        });
      }
    } else {
      // is filed
      if (ignoreIndexItem && fname === "index.md" || /^-.*\.(md|MD)$/.test(fname)) {
        continue;
      }
      const text = fname.replace(/\.md$/, "");
      const item: DefaultTheme.SidebarItem = {
        text,
        link: [...reset, `${text}.html`].join("/"),
      };
      result.push(item);
    }
  }
  return result;
}

function createSideBarGroups(
  targetPath: string,
  folder: string,
  option: SidebarPluginOptionType
): DefaultTheme.SidebarItem[] {
  return [
    {
      items: createSideBarItems(targetPath, option, folder),
    },
  ];
}

function createSidebarMulti(
  path: string,
  option: SidebarPluginOptionType
): DefaultTheme.SidebarMulti {
  const { ignoreList = [], ignoreIndexItem = false } = option;
  const data: DefaultTheme.SidebarMulti = {};
  let node = readdirSync(path).filter(
    (n) => statSync(join(path, n)).isDirectory() && !ignoreList.includes(n)
  );

  for (const k of node) {
    data[`/${k}/`] = createSideBarGroups(path, k, option);
  }

  // is ignored only index.md
  if (ignoreIndexItem) {
    for (const i in data) {
      let obj = data[i];
      obj = obj.filter((i) => i.items && i.items.length > 0);
      if (obj.length === 0) {
        Reflect.deleteProperty(data, i);
      }
    }
  }

  return data;
}

export default function VitePluginVitepressAutoSidebar(
  option: SidebarPluginOptionType = {}
) {
  return {
    name: "vite-plugin-vitepress-auto-sidebar",
    configureServer({ watcher }: ViteDevServer) {
      const fsWatcher = watcher.add("*.md");
      fsWatcher.on("all", (event, path) => {
        if (event !== "change") {
          touch();
          log(`${event} ${path}`);
          log("update sidebar...");
        }
      });
    },
    config(config:UserConfig){
      const { path = "/docs" } = option;

      // get config file path
      const configPath = join(process.cwd(), `${path}/.vitepress`);
      configFilePath = existsSync(join(configPath, 'config.ts')) ? join(configPath, 'config.ts') : join(configPath, 'config.js');

      // increment ignore item
      const items = ["scripts", "components", "assets", ".vitepress"];
      option.ignoreList
          ? option.ignoreList.push(...items)
          : (option.ignoreList = items);
      const docsPath = join(process.cwd(), path);
      // create sidebar data and insert
      config.vitepress.site.themeConfig.sidebar = createSidebarMulti(docsPath, option);
      log("injected sidebar data successfully");
      return config;
    }
  };
}
