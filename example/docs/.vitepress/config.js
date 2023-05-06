import AutoSidebar from "vite-plugin-vitepress-auto-sidebar";

export default {
  lang: "en-US",
  title: "VitePress",
  description: "Vite & Vue powered static site generator.",
  vite: {
    plugins: [AutoSidebar({ prefix: '.', collapsed: false })],
  },
  themeConfig: {
     nav: [{ text: "home", link: "/" },{ text: "note", link: "/note/index" }],
  },
};
