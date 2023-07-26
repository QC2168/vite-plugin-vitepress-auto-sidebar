import type { DefaultTheme, SiteConfig } from 'vitepress';
export interface SidebarPluginOptionType {
  ignoreList?: string[]
  path?: string
  createIndex?: boolean
  ignoreIndexItem?: boolean
  deletePrefix?: string | RegExp
  collapsed?: boolean
  //是否从文件获取sidebar标题，默认是否
  titleFromFile?:boolean
  sideBarResolved?: (data: DefaultTheme.SidebarMulti) => DefaultTheme.SidebarMulti
  sideBarItemsResolved?: (data: DefaultTheme.SidebarItem[]) => DefaultTheme.SidebarItem[]
  beforeCreateSideBarItems?: (data: string[]) => string[]
}
export interface UserConfig {
  vitepress: SiteConfig
}
