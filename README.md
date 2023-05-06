# vite-plugin-vitepress-auto-sidebar

The vite plugin that automatically generates sidebar data by scanning directories, based on vitepress

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
  vite:{
    plugins:[
      // add plugin
      AutoSidebar()
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

| name            | description                                | type       | default |
| --------------- | ------------------------------------------ | ---------- | ------- |
| ignoreList      | ignore specified folder                    | `string[]` | `true`  |
| path            | create scan path for the sidebar           | `string`   | `/docs` |
| ignoreIndexItem | ignore the page sidebar with only index.md | `boolean`  | `false` |
| collapsed  | By adding collapsed option to the sidebar group, it shows a toggle button to hide/show each section,For specific usage, please refer to VitePress. | `boolean`\|`undefined`  | `undefined` |
| prefix | secondary sort | `string`  |  |

## License

[MIT](./LICENSE) License © 2023 [QC2168](https://github.com/QC2168)
