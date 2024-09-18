import { defineConfig } from "@pandacss/dev";
import { warePreset } from "@wwwares/ui-system/preset";

export default defineConfig({
	// Whether to use css reset
	preflight: true,
	conditions: {
		light: "[data-color-mode=light] &",
		dark: "[data-color-mode=dark] &",
	},
	presets: [warePreset],
	jsxFramework: "react",
	// Where to look for your css declarations
	include: ["./app/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	importMap: "@wwwares/ui-system",

	outdir: "styled-system",
});
