import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		version: "0.2.2",
		permissions: ["storage"],
	},
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	srcDir: "src",
	outDir: "output",
});
