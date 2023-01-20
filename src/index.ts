import { join } from "path";
import { readdirSync, statSync, closeSync, openSync, utimesSync } from "fs";
import c from "picocolors";
import { type DefaultTheme } from "vitepress";
import { type ViteDevServer } from 'vite'

const configFile = join(process.cwd(),'docs/.vitepress/config.ts');

function touch() {
  const time = new Date();

  try {
    utimesSync(configFile, time, time);
  } catch (err) {
    closeSync(openSync(configFile, "w"));
  }
}

function createSideBarItems(
  targetPath: string,
  ...reset: string[]
): DefaultTheme.SidebarItem[] {
  let node = readdirSync(join(targetPath, ...reset));
  const result: DefaultTheme.SidebarItem[] = [];
  for (const fname of node) {
    if (statSync(join(targetPath, ...reset, fname)).isDirectory()) {
      // is directory
      result.push({
        text: fname,
        items: createSideBarItems(join(targetPath), ...reset, fname),
      });
    } else {
      // file
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
  targetPath:string,
  folder:string
): DefaultTheme.SidebarGroup[] {
  return [
    {
      items: createSideBarItems(targetPath, folder),
    },
  ];
}

function createSidebarMulti(
  path:string,
  ignoreList: string[] = []
): DefaultTheme.SidebarMulti {
  const data: DefaultTheme.SidebarMulti = {};
  let node = readdirSync(path).filter(
    (n) => statSync(join(path, n)).isDirectory() && !ignoreList.includes(n)
  );
  for (const k of node) {
    data[`/${k}/`] = createSideBarGroups(
      path,
      k
    ) as DefaultTheme.SidebarGroup[];
  }

  return data;
}
function insertStr(source:string, start:number, newStr:string) {
  return source.slice(0, start) + newStr + source.slice(start);
}
function injectSidebar(
  source: string,
  data: DefaultTheme.SidebarMulti | DefaultTheme.SidebarGroup[]
) {
  const themeConfigPosition = source.indexOf(
    "{",
    source.indexOf("themeConfig")
  );
  return insertStr(
    source,
    themeConfigPosition + 1,
    `"sidebar": ${JSON.stringify(data)},`.replaceAll('"', '\\"')
  );
}
export interface SidebarPluginOptionType {
  ignoreList?: string[];
  path?: string;
}

export default function VitePluginVitepressAutoSidebar(
  option: SidebarPluginOptionType = {}
) {
  return {
    name: "vite-plugin-vitepress-auto-sidebar",
    configureServer({ watcher}:ViteDevServer) {
      const fsWatcher = watcher.add("*.md");
      fsWatcher.on("all", (event,path) => {
        if (event !== "change") {
          touch();
          console.log(
            c.bgGreen(" UPDATE "),
            c.green(`${event} ${path}, update sidebar data...`)
          );
        }
      });
    },
    transform(source: string, id: string) {
      if (/\/@siteData/.test(id)) {
        console.log(c.bgGreen(" INFO "), c.green("Creating sidebar data"));
        const { ignoreList = [], path = "/docs" } = option;
        // 忽略扫描的文件
        const ignoreFolder = [
          "scripts",
          "components",
          "assets",
          ".vitepress",
          ...ignoreList,
        ];
        const docsPath = join(process.cwd(), path);
        // 创建侧边栏对象
        const data = createSidebarMulti(docsPath, ignoreFolder);
        // 插入数据
        const code = injectSidebar(source, data);
        console.log(
          c.bgGreen(" INFO "),
          c.green("The sidebar data was successfully injected")
        );
        return { code };
      }
    },
  };
}
