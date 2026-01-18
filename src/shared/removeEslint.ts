import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

type RemoveEslintOptions = {
	/** Also remove scripts containing "lint" in the key (not just "eslint") */
	removeLintScripts?: boolean;
};

export function removeEslint(options: RemoveEslintOptions = {}): boolean {
	const removedFromPackageJson = removeEslintFromPackageJson(options);
	const removedConfigFiles = removeEslintConfigFiles();

	if (removedFromPackageJson || removedConfigFiles) {
		console.log("Running npm install...");
		execSync("npm install", { stdio: "inherit" });
		return true;
	}

	return false;
}

function removeEslintFromPackageJson(options: RemoveEslintOptions): boolean {
	const packageJsonPath = "package.json";
	if (!existsSync(packageJsonPath)) {
		return false;
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
			const isEslintScript =
				key.includes("eslint") ||
				packageJson.scripts[key].includes("eslint") ||
				(options.removeLintScripts && key.includes("lint"));

			if (isEslintScript) {
				delete packageJson.scripts[key];
				modified = true;
			}
		}
	}

	if (modified) {
		writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
		console.log("Removed eslint references from package.json");
	}

	return modified;
}

function removeEslintConfigFiles(): boolean {
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
		".eslintignore",
	];

	let removed = false;
	for (const configFile of eslintConfigFiles) {
		if (existsSync(configFile)) {
			unlinkSync(configFile);
			console.log(`Removed ${configFile}`);
			removed = true;
		}
	}

	return removed;
}
