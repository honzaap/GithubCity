import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: true, // IPアドレスを有効化
    },
    root: "./src",
    base: "/GithubCity/",
    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {
                index: resolve(__dirname, "./src/index.html"),
            },
        },
    },
});
