import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // abre o browser automaticamente quando o dev server arrancar
    proxy: {
      // /api/qualquercoisa → http://localhost:8000/api/qualquercoisa
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
