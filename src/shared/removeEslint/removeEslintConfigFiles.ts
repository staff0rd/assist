import { existsSync, unlinkSync } from "node:fs";

const ESLINT_CONFIG_FILES = [
	"eslint.config.js",
	"eslint.config.mjs",
	"eslint.config.cjs",
	".eslintrc",
	".eslintrc.js",
	".eslintrc.cjs",
	".eslintrc.json",
	".eslintrc.yaml",
	".eslintrc.yml",
	".eslintignore",
];

export function removeEslintConfigFiles(): boolean {
	let removed = false;
	for (const configFile of ESLINT_CONFIG_FILES) {
		if (existsSync(configFile)) {
			unlinkSync(configFile);
			console.log(`Removed ${configFile}`);
			removed = true;
		}
	}
	return removed;
}
