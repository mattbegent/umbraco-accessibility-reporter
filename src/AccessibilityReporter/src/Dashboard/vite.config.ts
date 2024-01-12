import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/accessibility-reporter-dashboard.element.ts", // your web component source file
            formats: ["es"],
        },
        outDir: "../../App_Plugins/AccessibilityReporter/dist", // your web component will be saved in this location
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});