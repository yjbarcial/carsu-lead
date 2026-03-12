export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/styles/global.css"],
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001",
    },
  },
});
