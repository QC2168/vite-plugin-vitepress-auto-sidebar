import { join } from "path";
import { readdirSync, statSync, closeSync, openSync, utimesSync } from "fs";
import c from "picocolors";
import { type DefaultTheme } from "vitepress";
import { type ViteDevServer } from "vite";
import { SidebarPluginOptionType } from "./types";


function log(...info: string[]) {
  console.log(c.bold(c.cyan("[auto-sidebar]")), ...info);
}

function touch({path='docs'}: SidebarPluginOptionType) {
  const configFile = join(process.cwd(), `${path}/.vitepress/config.ts`);
  const time = new Date();

  try {
    utimesSync(configFile, time, time);
  } catch (err) {
    closeSync(openSync(configFile, "w"));
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

function insertStr(source: string, start: number, newStr: string) {
  return source.slice(0, start) + newStr + source.slice(start);
}

function injectSidebar(source: string, data: DefaultTheme.Sidebar) {
  const themeConfigPosition = source.indexOf(
    "{",
    source.indexOf("themeConfig")
  );
  return insertStr(
    source,
    themeConfigPosition + 1,
    `"sidebar": ${JSON.stringify(data)}${
      source[themeConfigPosition + 1] !== "}" ? "," : ""
    }`.replaceAll('"', '\\"')
  );
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
          touch(option);
          log(`${event} ${path}`);
          log("update sidebar...");
        }
      });
    },
    transform(source: string, id: string) {
      if (/\/@siteData/.test(id)) {
        const { path = "/docs" } = option;
        // increment ignore item
        const items = ["scripts", "components", "assets", ".vitepress"];
        option.ignoreList
          ? option.ignoreList.push(...items)
          : (option.ignoreList = items);
        const docsPath = join(process.cwd(), path);
        // 创建侧边栏对象
        const data = createSidebarMulti(docsPath, option);
        // 插入数据
        const code = injectSidebar(source, data);
        log("injected sidebar data successfully");
        return { code };
      }
    },
  };
}
