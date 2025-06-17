import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo (development, production, etc.)
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: true,
      }),
    ],
    // No necesitas definir manualmente las variables de entorno, loadEnv las carga automáticamente
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: { charset: false },
        css: { charset: false },
      },
    },
    server: {
      port: 5173, // Puerto para el servidor de desarrollo
    },
  };
});