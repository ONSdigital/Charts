import { resolve } from "node:path";
import { defineConfig } from "vite";

const entry = resolve(__dirname, "src/index.ts");

export default defineConfig(({ mode }) => {
  const isUmdBuild = mode === "umd";

  return {
    appType: "mpa",
    build: isUmdBuild
      ? {
          emptyOutDir: false,
          lib: {
            entry,
            fileName: () => "ons-charts.js",
            formats: ["umd"],
            name: "ONSCharts",
          },
          outDir: "dist/umd",
          rollupOptions: {
            output: {
              exports: "named",
            },
          },
          sourcemap: true,
        }
      : {
          emptyOutDir: false,
          lib: {
            entry,
            formats: ["es"],
          },
          outDir: "dist/esm",
          rollupOptions: {
            output: {
              assetFileNames: "assets/[name][extname]",
              chunkFileNames: "chunks/[name]-[hash].js",
              entryFileNames: "[name].js",
              preserveModules: true,
              preserveModulesRoot: "src",
            },
          },
          sourcemap: true,
        },
    server: {
      open: "/playground/",
    },
  };
});
