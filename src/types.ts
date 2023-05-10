import type { DefaultTheme, SiteConfig } from 'vitepress';
export interface SidebarPluginOptionType {
  ignoreList?: string[]
  path?: string
  createIndex?: boolean
  ignoreIndexItem?: boolean
  deletePrefix?: string | RegExp
  collapsed?: boolean
  sideBarResolved?: (data: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti
  sideBarItemsResolved?: (data: DefaultTheme.SidebarItem[]) => DefaultTheme.SidebarItem[]
}
export interface UserConfig {
  vitepress: SiteConfig
}
