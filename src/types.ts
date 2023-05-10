import { SiteConfig } from 'vitepress';
export interface SidebarPluginOptionType {
  ignoreList?: string[]
  path?: string
  createIndex?: boolean
  ignoreIndexItem?: boolean
  deletePrefix?: string | RegExp
  collapsed?: boolean
}
export interface UserConfig {
  vitepress: SiteConfig
}
