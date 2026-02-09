import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { removeEslintConfigFiles } from "./removeEslintConfigFiles";

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

	modified = removeEslintDeps(packageJson.dependencies) || modified;
	modified = removeEslintDeps(packageJson.devDependencies) || modified;
	modified = removeEslintScripts(packageJson.scripts, options) || modified;

	if (modified) {
		writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
		console.log("Removed eslint references from package.json");
	}

	return modified;
}

function removeEslintDeps(deps: Record<string, string> | undefined): boolean {
	if (!deps) return false;
	let modified = false;
	for (const key of Object.keys(deps)) {
		if (key.includes("eslint")) {
			delete deps[key];
			modified = true;
		}
	}
	return modified;
}

function removeEslintScripts(
	scripts: Record<string, string> | undefined,
	options: RemoveEslintOptions,
): boolean {
	if (!scripts) return false;
	let modified = false;
	for (const key of Object.keys(scripts)) {
		const isEslintScript =
			key.includes("eslint") ||
			scripts[key].includes("eslint") ||
			(options.removeLintScripts && key.includes("lint"));
		if (isEslintScript) {
			delete scripts[key];
			modified = true;
		}
	}
	return modified;
}
