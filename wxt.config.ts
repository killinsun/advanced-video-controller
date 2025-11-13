import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import path from "node:path";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		version: "0.3.1",
		permissions: ["storage"],
	},
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
	}),
	srcDir: "src",
	outDir: "output",
});
