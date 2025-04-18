import { defineConfig } from "tsup";

export default defineConfig((options) => {
	const isDev = process.env.NODE_ENV !== "production";

	return {
		entry: ["src/index.ts"],
		splitting: false,
		sourcemap: isDev, // Activer les sourcemaps uniquement en développement
		clean: !isDev, // Nettoyer le dossier de sortie uniquement en build
		minify: !isDev, // Minifier uniquement en build
		watch: isDev, // Activer le mode watch en développement
		dts: true, // Générer les fichiers de déclaration TypeScript
	};
});
