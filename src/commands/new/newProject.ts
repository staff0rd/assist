import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { init as deployInit } from "../deploy/init";
import { init } from "../init";

export async function newProject(): Promise<void> {
	console.log("Initializing Vite with react-ts template...");
	execSync("npm create vite@latest . -- --template react-ts", {
		stdio: "inherit",
	});

	removeEslintFromPackageJson();
	removeEslintConfigFile();
	addViteBaseConfig();
	await init();
	await deployInit();
}

function removeEslintFromPackageJson(): void {
	const packageJsonPath = "package.json";
	if (!existsSync(packageJsonPath)) {
		console.log("No package.json found, skipping eslint removal");
		return;
	}

	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	let modified = false;

	// Remove eslint from dependencies
	if (packageJson.dependencies) {
		for (const key of Object.keys(packageJson.dependencies)) {
			if (key.includes("eslint")) {
				delete packageJson.dependencies[key];
				modified = true;
			}
		}
	}

	// Remove eslint from devDependencies
	if (packageJson.devDependencies) {
		for (const key of Object.keys(packageJson.devDependencies)) {
			if (key.includes("eslint")) {
				delete packageJson.devDependencies[key];
				modified = true;
			}
		}
	}

	// Remove eslint scripts
	if (packageJson.scripts) {
		for (const key of Object.keys(packageJson.scripts)) {
			if (
				key.includes("eslint") ||
				key.includes("lint") ||
				packageJson.scripts[key].includes("eslint")
			) {
				delete packageJson.scripts[key];
				modified = true;
			}
		}
	}

	if (modified) {
		writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
		console.log("Removed eslint references from package.json");
	}
}

function addViteBaseConfig(): void {
	const viteConfigPath = "vite.config.ts";
	if (!existsSync(viteConfigPath)) {
		console.log("No vite.config.ts found, skipping base config");
		return;
	}

	const content = readFileSync(viteConfigPath, "utf-8");
	if (content.includes("base:")) {
		console.log("vite.config.ts already has base config");
		return;
	}

	const updated = content.replace(
		/defineConfig\(\{/,
		'defineConfig({\n\tbase: "./",',
	);

	if (updated !== content) {
		writeFileSync(viteConfigPath, updated);
		console.log('Added base: "./" to vite.config.ts');
	}
}

function removeEslintConfigFile(): void {
	const eslintConfigFiles = [
		"eslint.config.js",
		"eslint.config.mjs",
		"eslint.config.cjs",
		".eslintrc",
		".eslintrc.js",
		".eslintrc.cjs",
		".eslintrc.json",
		".eslintrc.yaml",
		".eslintrc.yml",
	];

	for (const configFile of eslintConfigFiles) {
		if (existsSync(configFile)) {
			unlinkSync(configFile);
			console.log(`Removed ${configFile}`);
		}
	}
}
