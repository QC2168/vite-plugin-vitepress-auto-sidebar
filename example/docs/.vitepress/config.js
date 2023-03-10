import AutoSidebar from "vite-plugin-vitepress-auto-sidebar";

export default {
  lang: "en-US",
  title: "VitePress",
  description: "Vite & Vue powered static site generator.",
  vite: {
    plugins: [AutoSidebar()],
  },
  themeConfig: {
     nav: [{ text: "note", link: "/note/index" }],
  },
};
