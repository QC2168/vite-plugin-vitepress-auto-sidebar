# vite-plugin-vitepress-auto-sidebar

The vite plugin that automatically generates sidebar data by scanning directories, based on vitepress

[![Npm](https://img.shields.io/npm/v/vite-plugin-vitepress-auto-sidebar)](http://blog.csdn.net/a_zhon)
[![Download](https://img.shields.io/npm/dt/vite-plugin-vitepress-auto-sidebar)](http://blog.csdn.net/a_zhon)
[![License](https://img.shields.io/github/license/qc2168/vite-plugin-vitepress-auto-sidebar)](http://blog.csdn.net/a_zhon)

## ✨ Feature

🚀 Automatically create the sidebar data and injected into `config.ThemeConfig.sidebar`

🤖 Listen globally for `*.md` files to automatically update sidebar data when they are added or deleted

## 🕯️ Usage

install vite-plugin-vitepress-auto-sidebar

```bash
# recommend using pnpm packageManager
pnpm i vite-plugin-vitepress-auto-sidebar
# or yarn
yarn add vite-plugin-vitepress-auto-sidebar
# or npm
npm install vite-plugin-vitepress-auto-sidebar
```

add plugin in `.vitepress/config.ts`

```typescript
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';

export default defineConfig({
  vite: {
    plugins: [
      // add plugin
      AutoSidebar({
        // You can also set options to adjust sidebar data
        // see option document below
      })
    ]
  },
})
```

> Warning, you must clear the sidebar objects in the config.ts or it may not work properly

`pnpm run dev`

```
 [auto-sidebar] injected sidebar data successfully
```

> If you see the above message, it means the plugin is working properly, otherwise there may be a problem

### 🛠️ Options

#### Parameters

| name                     | description                                                                                                                                       | type                                                               | default |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| ignoreList               | ignore specified folder                                                                                                                           | `string[]`                                                         | `true`  |
| path                     | create scan path for the sidebar                                                                                                                  | `string`                                                           | `/docs` |
| ignoreIndexItem          | ignore the page sidebar with only index.md                                                                                                        | `boolean`                                                          | `false` |
| collapsed                | By adding collapsed option to the sidebar group, it shows a toggle button to hide/show each section,For specific usage, please refer to VitePress | `boolean`                                                          | `false` |
| deletePrefix             | deletes the md file prefix                                                                                                                        | `string`                                                           |         |
| titleFromFile            | read title from md file                                                                                                                           | `boolean`                                                          | `false` |
| titleFromFileByYaml      | read title from yaml config                                                                                                                       | `boolean`                                                          | `false` |

### Hooks

You can change the injected sidebar object using the hooks parameter

| name                     | description                                                                                                                                       | type                                                               | default |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| sideBarResolved          | receive complete sidebar objects for custom modifications                                                                                         | `(data: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti`   |         |
| sideBarItemsResolved     | receive complete sidebar subItem objects for custom modifications                                                                                 | `(data: DefaultTheme.SidebarItem[]) => DefaultTheme.SidebarItem[]` |         |
| beforeCreateSideBarItems | obtain a list of file names scanned before generating sidebar subitems. If you want to sort sidebar data, it is recommended to use it             | `(data: string[]) => string[]`                                     |         |

## License

[MIT](./LICENSE) License © 2023 [QC2168](https://github.com/QC2168)
