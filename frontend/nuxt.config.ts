export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/styles/global.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:3001",
    },
  },
});
